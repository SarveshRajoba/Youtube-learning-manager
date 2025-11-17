import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import {
  Brain,
  Search,
  Calendar,
  Clock,
  PlayCircle,
  Edit,
  Trash2,
  Plus,
  Filter,
  MoreVertical,
  Loader2,
  ListVideo,
  ThumbsUp,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const Summaries = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const { toast } = useToast();

  const fetchSummaries = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching summaries...");
      const response = await api.get("/ai_summaries");
      console.log("Summaries response:", response.data);
      const summariesData = response.data.data || [];
      console.log("Setting summaries:", summariesData);
      console.log("Number of summaries:", summariesData.length);
      console.log("Summary IDs:", summariesData.map((s: any) => s.id));
      console.log("First summary:", summariesData[0]);
      setSummaries(summariesData);
    } catch (error: any) {
      console.error("Error fetching summaries:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description: "Failed to load AI summaries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.get("/playlists");
      const playlistsData = (response.data.data || []).map((item: any) =>
        item.attributes || item
      );
      setPlaylists(playlistsData);
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
    }
  };

  const generatePlaylistSummary = async () => {
    if (!selectedPlaylistId) {
      toast({
        title: "Error",
        description: "Please select a playlist",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setIsPlaylistDialogOpen(false);

      toast({
        title: "Generating Summary",
        description: "Using AI to summarize this playlist...",
      });

      const response = await api.post("/ai_summaries/generate_playlist", {
        playlist_id: selectedPlaylistId
      });

      console.log("Summary generation response:", response.data);

      const summaryData = response.data?.data;
      if (summaryData) {
        setSummaries([...summaries, summaryData]);
        setSelectedPlaylistId("");
        toast({
          title: "Summary Generated!",
          description: "AI summary has been created successfully.",
        });
      } else {
        throw new Error("No summary returned");
      }
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.message || "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = async (videoId: string) => {
    try {
      setIsGenerating(true);
      const response = await api.post("/ai_summaries/generate", { video_id: videoId });
      setSummaries([...summaries, response.data.data]);
      toast({
        title: "Summary Generated!",
        description: "AI summary has been created successfully.",
      });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
    fetchPlaylists();

    // Listen for summary generation events to refresh the list
    const handleSummaryGenerated = () => {
      console.log("Summary generated event received, refreshing list...");
      fetchSummaries();
    };

    window.addEventListener('summaryGenerated', handleSummaryGenerated);

    return () => {
      window.removeEventListener('summaryGenerated', handleSummaryGenerated);
    };
  }, []);

  const filteredSummaries = summaries.filter(summary => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      summary.title?.toLowerCase().includes(searchLower) ||
      summary.video?.title?.toLowerCase().includes(searchLower) ||
      summary.playlist?.title?.toLowerCase().includes(searchLower) ||
      summary.summary_text?.toLowerCase().includes(searchLower) ||
      (Array.isArray(summary.parsed_tags) && summary.parsed_tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) ||
      (Array.isArray(summary.parsed_key_points) && summary.parsed_key_points.some((point: string) => point.toLowerCase().includes(searchLower)))
    );
  });

  const handleDelete = async (summaryId: string) => {
    try {
      await api.delete(`/ai_summaries/${summaryId}`);
      setSummaries(summaries.filter(summary => summary.id !== summaryId));
      toast({
        title: "Summary deleted",
        description: "The AI summary has been permanently deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting summary:", error);
      toast({
        title: "Error",
        description: "Failed to delete summary",
        variant: "destructive"
      });
    }
  };

  const handleViewSummary = (summary: any) => {
    setSelectedSummary(summary);
    setIsViewDialogOpen(true);
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Summaries</h1>
            <p className="text-muted-foreground mt-2">
              AI-generated summaries of your learning videos
            </p>
          </div>
          <Button
            className="gap-2"
            disabled={isGenerating}
            onClick={() => setIsPlaylistDialogOpen(true)}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Generate Summary
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search summaries, videos, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading summaries...</span>
          </div>
        )}

        {/* Summaries Grid */}
        {!isLoading && filteredSummaries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2">
                        <button onClick={() => handleViewSummary(summary)} className="text-left">
                          {summary.title}
                        </button>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getConfidenceColor(summary.confidence)}`}
                        >
                          {summary.confidence}% confident
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewSummary(summary)}>
                          <Edit className="mr-2 h-4 w-4" />
                          View Full Summary
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(summary.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Playlist Summary - Show metadata */}
                  {summary.is_playlist_summary && summary.playlist_metadata ? (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Playlist:</h4>
                        <p className="font-medium">{summary.playlist?.title || 'Unknown Playlist'}</p>
                      </div>

                      {/* Playlist Stats */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
                        <div className="flex flex-col items-center text-center">
                          <ListVideo className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Videos</span>
                          <span className="text-sm font-semibold">{summary.playlist_metadata.total_videos}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Time</span>
                          <span className="text-sm font-semibold">{summary.playlist_metadata.total_time}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <ThumbsUp className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Likes</span>
                          <span className="text-sm font-semibold">{summary.playlist_metadata.estimated_total_likes}</span>
                        </div>
                      </div>

                      {summary.playlist_metadata.target_audience && (
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm text-muted-foreground">Best For:</h4>
                          <p className="text-sm text-foreground">{summary.playlist_metadata.target_audience}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Video Info */
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">From Video:</h4>
                      <p className="font-medium">{summary.video?.title || 'Unknown Video'}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{summary.playlist?.title || 'Unknown Playlist'}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {summary.video?.duration || 'Unknown Duration'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary Preview */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Summary:</h4>
                    <p className="text-sm text-foreground line-clamp-3">
                      {summary.summary_text || 'No summary available'}
                    </p>
                  </div>

                  {/* Key Points Preview */}
                  {(summary.parsed_key_points || []).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Key {summary.is_playlist_summary ? 'Topics' : 'Points'}:</h4>
                      <div className="space-y-1">
                        {(summary.parsed_key_points || []).slice(0, 2).map((point: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <p className="text-muted-foreground">{point}</p>
                          </div>
                        ))}
                        {(summary.parsed_key_points || []).length > 2 && (
                          <p className="text-xs text-muted-foreground pl-3">
                            +{(summary.parsed_key_points || []).length - 2} more {summary.is_playlist_summary ? 'topics' : 'points'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags - Only show for video summaries */}
                  {!summary.is_playlist_summary && (
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(summary.parsed_tags) ? summary.parsed_tags : []).slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {Array.isArray(summary.parsed_tags) && summary.parsed_tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{summary.parsed_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimeAgo(summary.generated_at || summary.created_at)}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleViewSummary(summary)}>
                      View Full
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredSummaries.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No summaries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Generate your first AI summary from a playlist"}
            </p>
            <Button
              className="gap-2"
              onClick={() => setIsPlaylistDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Generate First Summary
            </Button>
          </div>
        )}

        {/* View Summary Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedSummary && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedSummary.title}</DialogTitle>
                  <DialogDescription className="space-y-2">
                    {selectedSummary.is_playlist_summary ? (
                      <>
                        <div>Playlist: <span className="font-medium">{selectedSummary.playlist?.title || 'Unknown Playlist'}</span></div>
                        {selectedSummary.playlist_metadata && (
                          <div className="grid grid-cols-4 gap-4 text-sm pt-2">
                            <div>
                              <span className="text-muted-foreground">Videos:</span>
                              <span className="ml-2 font-medium">{selectedSummary.playlist_metadata.total_videos}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time:</span>
                              <span className="ml-2 font-medium">{selectedSummary.playlist_metadata.total_time}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Likes:</span>
                              <span className="ml-2 font-medium">{selectedSummary.playlist_metadata.estimated_total_likes}</span>
                            </div>
                            <Badge className={getConfidenceColor(selectedSummary.confidence || 0)}>
                              {selectedSummary.confidence || 0}% confident
                            </Badge>
                          </div>
                        )}
                        {selectedSummary.playlist_metadata?.target_audience && (
                          <div className="text-sm pt-2">
                            <span className="text-muted-foreground">Best For: </span>
                            <span className="font-medium">{selectedSummary.playlist_metadata.target_audience}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>From: <span className="font-medium">{selectedSummary.video?.title || 'Unknown Video'}</span></div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{selectedSummary.playlist?.title || 'Unknown Playlist'}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {selectedSummary.video?.duration || 'Unknown Duration'}
                          </span>
                          <Badge className={getConfidenceColor(selectedSummary.confidence || 0)}>
                            {selectedSummary.confidence || 0}% confident
                          </Badge>
                        </div>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Full Summary */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedSummary.summary_text || 'No summary available'}
                    </p>
                  </div>

                  {/* Key Points/Topics */}
                  {(selectedSummary.parsed_key_points || []).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Key {selectedSummary.is_playlist_summary ? 'Topics' : 'Learning Points'}</h3>
                      <div className="space-y-3">
                        {(selectedSummary.parsed_key_points || []).map((point: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <p className="text-muted-foreground">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags - Only show for video summaries */}
                  {!selectedSummary.is_playlist_summary && Array.isArray(selectedSummary.parsed_tags) && selectedSummary.parsed_tags.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedSummary.parsed_tags || []).map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {selectedSummary.is_playlist_summary ? (
                      <Button variant="outline" className="gap-2" asChild>
                        <Link to={`/playlists/${selectedSummary.playlist?.id}`}>
                          <ListVideo className="h-4 w-4" />
                          View Playlist
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2" asChild>
                        <Link to={`/videos/${selectedSummary.video?.id}`}>
                          <PlayCircle className="h-4 w-4" />
                          Watch Video
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Generate Summary Dialog */}
        <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Playlist Summary</DialogTitle>
              <DialogDescription>
                Select a playlist to generate an AI summary with total videos, time, likes, and key insights.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Playlist</label>
                <Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a playlist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.title} ({playlist.video_count} videos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {playlists.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No playlists available. Create a playlist first.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPlaylistDialogOpen(false);
                  setSelectedPlaylistId("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={generatePlaylistSummary}
                disabled={!selectedPlaylistId || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  );
};

export default Summaries;
// import Navigation from "@/components/Navigation";

// const Summaries = () => {
//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <Navigation />
//       <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
//         <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 animate-pulse">
//           🚧 Coming Soon!!
//         </h1>
//         <p className="text-muted-foreground text-base sm:text-lg max-w-md">
//           We're working hard to bring AI Summaries to your dashboard. Stay tuned for updates!
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Summaries;
