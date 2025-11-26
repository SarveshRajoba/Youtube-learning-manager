import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import {
  Play,
  Clock,
  CheckCircle,
  Circle,
  MoreVertical,
  ExternalLink,
  Target,
  Brain,
  Calendar,
  Loader2,
  FileText,
  Plus,
  Trash2,
  ListVideo,
  ThumbsUp,
  Users
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import YouTubePlayer from "@/components/YouTubePlayer";

interface Note {
  id: string;
  text: string;
  video_number?: number;
  created_at?: string;
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
  notes?: Note[];
}

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  position: number;
  yt_id: string;
  playlist_id: string;
  progress?: {
    current_time: number;
    completion_pct: number;
    completed: boolean;
    last_watched: string;
  };
}

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingVideos, setUpdatingVideos] = useState<Set<string>>(new Set());
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteVideoNumber, setNewNoteVideoNumber] = useState<string>("general");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [watchingVideo, setWatchingVideo] = useState<Video | null>(null);
  const [currentVideoProgress, setCurrentVideoProgress] = useState(0);
  const { toast } = useToast();

  const fetchPlaylist = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/playlists/${id}`);
      console.log("Playlist response:", response.data);

      // Handle JSONAPI format - data is nested under 'attributes'
      const playlistData = response.data.data.attributes || response.data.data;
      if (!playlistData.notes) playlistData.notes = [];
      setPlaylist(playlistData);
    } catch (error: any) {
      console.error("Error fetching playlist:", error);
      toast({
        title: "Error",
        description: "Failed to load playlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylistSummary = async () => {
    if (!id) return;

    try {
      const response = await api.get(`/ai_summaries?playlist_id=${id}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        // Find summary for this playlist
        const playlistSummary = response.data.data.find((summary: any) =>
          summary.is_playlist_summary && summary.playlist?.id === id
        );
        if (playlistSummary) {
          setAiSummary(playlistSummary);
        }
      }
    } catch (error: any) {
      // Silent fail - summary might not exist yet
      console.log("No existing summary found");
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlaylist();
      fetchPlaylistSummary();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading playlist...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">Playlist not found</h3>
            <p className="text-muted-foreground mb-4">The playlist you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/playlists">Back to Playlists</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedVideos = playlist.videos.filter(video => video.progress?.completed).length;
  const overallProgress = playlist.videos.length > 0 ? (completedVideos / playlist.videos.length) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success text-success-foreground";
      case "Intermediate": return "bg-warning text-warning-foreground";
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getNextVideo = () => {
    return playlist.videos.find(video => !video.progress?.completed) || playlist.videos[0];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleGenerateAISummary = async () => {
    if (!playlist) {
      console.error("No playlist available");
      toast({
        title: "Error",
        description: "Playlist not loaded",
        variant: "destructive"
      });
      return;
    }

    console.log("Generating summary for playlist:", playlist.id);
    setIsGeneratingSummary(true);

    try {
      toast({
        title: "Generating Summary",
        description: "Using AI to summarize this playlist...",
      });

      console.log("Sending request to /ai_summaries/generate_playlist with:", { playlist_id: playlist.id });

      const response = await api.post("/ai_summaries/generate_playlist", {
        playlist_id: playlist.id
      });

      console.log("Full response:", response.data);

      // Response now returns the flattened summary object
      const summaryData = response.data?.data;

      if (summaryData && (summaryData.summary_text || summaryData.summary)) {
        // Store the full summary object with metadata
        console.log("Setting summary data:", summaryData);
        setAiSummary(summaryData);

        // Refresh the summaries list by triggering a custom event
        window.dispatchEvent(new CustomEvent('summaryGenerated'));

        toast({
          title: "Summary Generated!",
          description: "AI summary has been created and saved. Check the Summaries tab to view it.",
        });
      } else {
        console.error("Invalid summary data received:", summaryData);
        throw new Error("No summary returned from API");
      }
    } catch (error: any) {
      console.error("Error generating AI summary:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !playlist) return;

    try {
      const existingNotes = playlist.notes || [];
      const videoNumber = newNoteVideoNumber === "general" ? null : parseInt(newNoteVideoNumber);

      const newNote: Note = {
        id: Date.now().toString(),
        text: newNoteText.trim(),
        video_number: videoNumber || undefined,
        created_at: new Date().toISOString()
      };

      const updatedNotes = [...existingNotes, newNote];

      await api.patch(`/playlists/${playlist.id}`, {
        playlist: {
          notes: updatedNotes
        }
      });

      setNewNoteText("");
      setNewNoteVideoNumber("general");
      await fetchPlaylist();

      toast({
        title: "Note added",
        description: "Your note has been saved",
      });
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editingNoteText.trim() || !playlist) return;

    try {
      const updatedNotes = (playlist.notes || []).map(note =>
        note.id === noteId ? { ...note, text: editingNoteText.trim() } : note
      );

      await api.patch(`/playlists/${playlist.id}`, {
        playlist: {
          notes: updatedNotes
        }
      });

      setEditingNoteId(null);
      setEditingNoteText("");
      await fetchPlaylist();

      toast({
        title: "Note updated",
        description: "Your note has been saved",
      });
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!playlist) return;

    try {
      const updatedNotes = (playlist.notes || []).filter(note => note.id !== noteId);

      await api.patch(`/playlists/${playlist.id}`, {
        playlist: {
          notes: updatedNotes
        }
      });

      await fetchPlaylist();

      toast({
        title: "Note deleted",
        description: "Note has been removed",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const handleVideoToggle = async (video: Video, checked: boolean) => {
    // Prevent multiple simultaneous updates
    if (updatingVideos.has(video.id)) return;

    setUpdatingVideos(prev => new Set(prev).add(video.id));

    try {
      if (checked) {
        // Mark as complete
        if (video.progress) {
          // Update existing progress - need to get progress ID first
          const progressResponse = await api.get(`/progresses`);
          const userProgress = progressResponse.data.data.find((p: any) =>
            (p.attributes?.video_id || p.video_id) === video.id
          );

          if (userProgress) {
            const progressId = userProgress.id || userProgress.attributes?.id;
            await api.put(`/progresses/${progressId}`, {
              progress: {
                completed: true,
                completion_pct: 100,
                last_watched: new Date().toISOString()
              }
            });
          } else {
            // Create new if somehow doesn't exist
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
        if (video.progress) {
          const progressResponse = await api.get(`/progresses`);
          const userProgress = progressResponse.data.data.find((p: any) =>
            (p.attributes?.video_id || p.video_id) === video.id
          );

          if (userProgress) {
            const progressId = userProgress.id || userProgress.attributes?.id;
            await api.put(`/progresses/${progressId}`, {
              progress: {
                completed: false,
                completion_pct: 0,
                current_time: 0,
                last_watched: new Date().toISOString()
              }
            });
          }
        }

        toast({
          title: "Progress Updated",
          description: `Marked "${video.title}" as incomplete`,
        });
      }

      // Refresh playlist to get updated progress
      await fetchPlaylist();
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Playlist Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden mb-6">
              <img
                src={playlist.thumbnail_url || "https://via.placeholder.com/800x400?text=No+Thumbnail"}
                alt={playlist.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.yt_id}`, '_blank')}
                >
                  <Play className="h-5 w-5" />
                  Continue Learning
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">{playlist.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{playlist.video_count} videos</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.yt_id}`, '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on YouTube
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast({ title: "Coming Soon", description: "Learning goals feature will be available soon!" })}>
                      <Target className="mr-2 h-4 w-4" />
                      Set Learning Goal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGenerateAISummary()}>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                YouTube Playlist
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">YouTube</Badge>
                <Badge variant="outline">{playlist.video_count} videos</Badge>
                <Badge variant="outline">
                  {formatDuration(playlist.videos.reduce((total, video) => total + video.duration, 0))}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your progress in this playlist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{completedVideos}/{playlist.videos.length}</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">{Math.round(overallProgress)}% complete</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{completedVideos}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{playlist.videos.length - completedVideos}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    const nextVideo = getNextVideo();
                    if (nextVideo) {
                      window.open(`https://www.youtube.com/watch?v=${nextVideo.yt_id}&list=${playlist.yt_id}`, '_blank');
                    }
                  }}
                >
                  <Play className="h-4 w-4" />
                  {completedVideos > 0 ? "Continue" : "Start"} Next Video
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => toast({ title: "Coming Soon", description: "Learning goals feature will be available soon!" })}
                >
                  <Target className="h-4 w-4" />
                  Set Learning Goal
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary}
                >
                  <Brain className="h-4 w-4" />
                  {isGeneratingSummary ? "Generating..." : "AI Summary"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.yt_id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on YouTube
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Summary
            </CardTitle>
            <CardDescription>
              AI-generated summary of this playlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiSummary ? (
              <div className="space-y-4">
                {/* Playlist Metadata Stats */}
                {aiSummary.playlist_metadata && (
                  <div className="grid grid-cols-3 gap-3 p-4 bg-muted rounded-lg">
                    <div className="flex flex-col items-center text-center">
                      <ListVideo className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground mb-1">Total Videos</span>
                      <span className="text-lg font-semibold">{aiSummary.playlist_metadata.total_videos}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground mb-1">Total Time</span>
                      <span className="text-lg font-semibold">{aiSummary.playlist_metadata.total_time}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <ThumbsUp className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground mb-1">Total Likes</span>
                      <span className="text-lg font-semibold">{aiSummary.playlist_metadata.estimated_total_likes}</span>
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                {aiSummary.playlist_metadata?.target_audience && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Best For:</p>
                    <p className="text-sm font-medium">{aiSummary.playlist_metadata.target_audience}</p>
                  </div>
                )}

                {/* Summary Text */}
                <div className="space-y-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {aiSummary.summary_text || aiSummary.summary || ""}
                  </p>
                </div>

                {/* Key Topics */}
                {aiSummary.parsed_key_points && Array.isArray(aiSummary.parsed_key_points) && aiSummary.parsed_key_points.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium text-muted-foreground">Key Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiSummary.parsed_key_points.map((topic: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isGeneratingSummary ? "Regenerating..." : "Regenerate Summary"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No AI summary generated yet. Click the button below to generate one.
                </p>
                <Button
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isGeneratingSummary ? "Generating..." : "Generate AI Summary"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
            <CardDescription>Add notes for this playlist or specific videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Note Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note... (Press Shift+Enter for new line, Enter to submit)"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                className="min-h-[80px] resize-y"
              />
              <div className="flex gap-2">
                <Select value={newNoteVideoNumber} onValueChange={setNewNoteVideoNumber}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    {playlist.videos.map((_, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        Video {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddNote} disabled={!newNoteText.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Notes List */}
            {playlist.notes && playlist.notes.length > 0 ? (
              <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                {playlist.notes.map((note) => (
                  <div key={note.id} className="flex items-start gap-3 p-2 rounded hover:bg-background transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {note.video_number ? (
                          <Badge variant="secondary" className="text-xs">
                            Video {note.video_number}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            General
                          </Badge>
                        )}
                      </div>
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="min-h-[60px] resize-y"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveEdit(note.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleEditNote(note)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No notes yet. Add one above!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video List */}
        <Card>
          <CardHeader>
            <CardTitle>Playlist Videos</CardTitle>
            <CardDescription>All videos in this learning playlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playlist.videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${selectedVideo === video.id ? "bg-accent border-primary" : "border-border hover:bg-accent/50"
                    }`}
                >
                  <Checkbox
                    id={`video-${video.id}`}
                    checked={video.progress?.completed || false}
                    onCheckedChange={(checked) => handleVideoToggle(video, checked as boolean)}
                    disabled={updatingVideos.has(video.id)}
                    className="flex-shrink-0"
                  />

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    {index + 1}
                  </div>

                  <div
                    className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <img
                      src={video.thumbnail_url || "https://via.placeholder.com/80x48?text=No+Thumbnail"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      {video.progress?.completed ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : video.progress?.completion_pct && video.progress.completion_pct > 0 ? (
                        <Play className="h-3 w-3 text-white" />
                      ) : (
                        <Circle className="h-4 w-4 text-white/60" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`video-${video.id}`}
                      className={`font-medium cursor-pointer truncate block ${video.progress?.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                    >
                      {video.title}
                    </label>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                      {video.progress?.completed && (
                        <span className="text-xs text-success">✓ Completed</span>
                      )}
                      {video.progress?.completion_pct && video.progress.completion_pct > 0 && !video.progress.completed && (
                        <div className="flex items-center gap-2">
                          <Progress value={video.progress.completion_pct} className="w-20 h-1" />
                          <span className="text-xs text-muted-foreground">{video.progress.completion_pct}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {updatingVideos.has(video.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          onClick={() => {
                            setWatchingVideo(video);
                            setIsWatchModalOpen(true);
                          }}
                        >
                          <Play className="h-3 w-3" />
                          Watch Here
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${video.yt_id}&list=${playlist.yt_id}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View on YT
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Watch Here Modal */}
        {watchingVideo && isWatchModalOpen && (
          <Dialog open={isWatchModalOpen} onOpenChange={setIsWatchModalOpen}>
            <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black border-none">
              <div className="relative aspect-video w-full bg-black">
                <YouTubePlayer
                  videoId={watchingVideo.yt_id}
                  onProgressUpdate={(progress) => {
                    setCurrentVideoProgress(progress);
                  }}
                  onVideoEnd={() => {
                    // Don't auto-close, just let it finish playing
                  }}
                  initialProgress={watchingVideo.progress?.completion_pct || 0}
                />
              </div>
              <div className="p-4 bg-background border-t">
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-semibold text-lg truncate">{watchingVideo.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Progress: {Math.round(currentVideoProgress)}% • From: {playlist.title}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      // Auto-mark complete if watched >= 90%
                      if (currentVideoProgress >= 90 && watchingVideo && !watchingVideo.progress?.completed) {
                        await handleVideoToggle(watchingVideo, true);
                        toast({
                          title: "Video Completed! ✓",
                          description: `Marked "${watchingVideo.title}" as complete`,
                        });
                      }
                      
                      setIsWatchModalOpen(false);
                      setWatchingVideo(null);
                      setCurrentVideoProgress(0);
                      // Refresh playlist to get updated progress
                      await fetchPlaylist();
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;