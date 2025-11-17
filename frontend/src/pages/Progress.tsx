import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import {
  PlayCircle,
  Clock,
  CheckCircle,
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  position: number;
  yt_id: string;
  playlist_id: string;
  progress?: {
    id?: string;
    current_time: number;
    completion_pct: number;
    completed: boolean;
    last_watched: string;
  };
}

interface Playlist {
  id: string;
  yt_id: string;
  title: string;
  thumbnail_url: string;
  video_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  videos: Video[];
}

const Progress = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingVideos, setUpdatingVideos] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/playlists");
      console.log("Playlists response:", response.data);

      // Handle JSONAPI format - extract attributes if present
      const playlistsData = (response.data.data || []).map((item: any) => {
        return item.attributes || item;
      });
      setPlaylists(playlistsData);

      // Expand all playlists by default - create new Set instance
      setExpandedPlaylists(new Set(playlistsData.map((p: Playlist) => p.id)));
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const togglePlaylist = (playlistId: string) => {
    setExpandedPlaylists(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(playlistId)) {
        newExpanded.delete(playlistId);
      } else {
        newExpanded.add(playlistId);
      }
      return newExpanded;
    });
  };

  const handleVideoToggle = async (video: Video, checked: boolean) => {
    // Prevent multiple simultaneous updates
    if (updatingVideos.has(video.id)) return;

    setUpdatingVideos(prev => new Set(prev).add(video.id));

    try {
      if (checked) {
        // Mark as complete
        if (video.progress?.id) {
          // Update existing progress
          await api.put(`/progresses/${video.progress.id}`, {
            progress: {
              completed: true,
              completion_pct: 100,
              last_watched: new Date().toISOString()
            }
          });
        } else {
          // Create new progress
          await api.post("/progresses", {
            progress: {
              video_id: video.id,
              completed: true,
              completion_pct: 100,
              current_time: video.duration,
              last_watched: new Date().toISOString()
            }
          });
        }

        toast({
          title: "Progress Updated",
          description: `Marked "${video.title}" as complete`,
        });
      } else {
        // Mark as incomplete
        if (video.progress?.id) {
          await api.put(`/progresses/${video.progress.id}`, {
            progress: {
              completed: false,
              completion_pct: 0,
              current_time: 0,
              last_watched: new Date().toISOString()
            }
          });

          toast({
            title: "Progress Updated",
            description: `Marked "${video.title}" as incomplete`,
          });
        }
      }

      // Refresh playlists to get updated progress
      await fetchPlaylists();
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    } finally {
      setUpdatingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(video.id);
        return newSet;
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPlaylistProgress = (playlist: Playlist) => {
    if (!playlist.videos || playlist.videos.length === 0) return 0;
    const completed = playlist.videos.filter(v => v.progress?.completed).length;
    return (completed / playlist.videos.length) * 100;
  };

  const getTotalStats = () => {
    const totalVideos = playlists.reduce((sum, p) => sum + (p.videos?.length || 0), 0);
    const completedVideos = playlists.reduce(
      (sum, p) => sum + (p.videos?.filter(v => v.progress?.completed).length || 0),
      0
    );
    return { totalVideos, completedVideos };
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading progress...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your progress across all playlists - check off videos as you complete them
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                Across {playlists.length} playlists
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completedVideos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalVideos > 0 ? Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0}% complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.totalVideos - stats.completedVideos}</div>
              <p className="text-xs text-muted-foreground">
                Videos to watch
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Playlists with Videos */}
        <div className="space-y-4">
          {filteredPlaylists.map((playlist) => {
            const isExpanded = expandedPlaylists.has(playlist.id);
            const progress = getPlaylistProgress(playlist);
            const completedCount = playlist.videos?.filter(v => v.progress?.completed).length || 0;

            return (
              <Card key={playlist.id}>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => togglePlaylist(playlist.id)}>
                  <div className="flex items-center gap-4">
                    <button className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    <img
                      src={playlist.thumbnail_url || "https://via.placeholder.com/120x68?text=No+Thumbnail"}
                      alt={playlist.title}
                      className="w-24 h-14 object-cover rounded"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold truncate">{playlist.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {completedCount}/{playlist.videos?.length || 0} videos completed
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={progress === 100 ? "default" : "secondary"}>
                            {Math.round(progress)}%
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link to={`/playlists/${playlist.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <ProgressBar value={progress} className="mt-2" />
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {playlist.videos?.map((video, index) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                        >
                          <Checkbox
                            id={`video-${video.id}`}
                            checked={video.progress?.completed || false}
                            onCheckedChange={(checked) => handleVideoToggle(video, checked as boolean)}
                            disabled={updatingVideos.has(video.id)}
                            className="flex-shrink-0"
                          />

                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>

                          <img
                            src={video.thumbnail_url || "https://via.placeholder.com/80x48?text=No+Thumbnail"}
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`video-${video.id}`}
                              className={`font-medium cursor-pointer truncate block ${video.progress?.completed ? "line-through text-muted-foreground" : ""
                                }`}
                            >
                              {video.title}
                            </label>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(video.duration)}
                              </span>
                              {video.progress?.completed && video.progress?.last_watched && (
                                <span className="text-success">
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                          </div>

                          {updatingVideos.has(video.id) && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                          )}
                        </div>
                      ))}

                      {(!playlist.videos || playlist.videos.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <PlayCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No videos in this playlist</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {filteredPlaylists.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No playlists found" : "No playlists yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Import your first playlist from YouTube to start tracking progress"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/playlists">Browse Playlists</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
