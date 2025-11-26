import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import {
  Play,
  Clock,
  CheckCircle,
  Target,
  Brain,
  BookOpen,
  ExternalLink,
  SkipForward,
  SkipBack,
  Bookmark,
  Share,
  ThumbsUp,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import api from "@/lib/api";
import YouTubePlayer from "@/components/YouTubePlayer";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const VideoDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [video, setVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);

  const fetchVideo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/videos/${id}`);
      setVideo(response.data.data);
      setNotes(response.data.data.notes || "");
    } catch (error: any) {
      console.error("Error fetching video:", error);
      toast({
        title: "Error",
        description: "Failed to load video details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    try {
      const response = await api.get(`/ai_summaries?video_id=${id}`);
      if (response.data.data && response.data.data.length > 0) {
        setAiSummary(response.data.data[0]);
      }
    } catch (error: any) {
      console.error("Error fetching AI summary:", error);
    }
  };

  const generateAiSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const response = await api.post("/ai_summaries/generate", { video_id: id });
      setAiSummary(response.data.data);
      toast({
        title: "AI Summary Generated!",
        description: "AI summary has been created successfully.",
      });
    } catch (error: any) {
      console.error("Error generating AI summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchAiSummary();
    }
  }, [id]);

  const {
    progress,
    isCompleted,
    updateProgress,
    markComplete,
    toggleComplete
  } = useVideoProgress({
    videoId: video?.id || "",
    initialProgress: video?.watchProgress || 0,
    initialCompleted: video?.completed || false,
  });

  const handleSetGoal = () => {
    toast({
      title: "Goal set successfully",
      description: "You'll be reminded to complete this video.",
    });
  };

  const handleGenerateSummary = () => {
    toast({
      title: "AI Summary generated",
      description: "Check the summary section below for key insights.",
    });
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes saved",
      description: "Your notes have been saved successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/playlists" className="hover:text-foreground">Playlists</Link>
          <span>/</span>
          <Link to={`/playlists/${video.playlist.id}`} className="hover:text-foreground">
            {video.playlist.title}
          </Link>
          <span>/</span>
          <span className="text-foreground">Video {video.playlist.currentIndex + 1}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Thumbnail with Action Buttons */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-3">
                    {/* Watch Here Button - Opens Modal with Embedded Player */}
                    <Button 
                      size="lg" 
                      className="gap-2 text-base px-6 py-6 h-auto shadow-xl"
                      onClick={() => setIsWatchModalOpen(true)}
                    >
                      <Play className="h-6 w-6" />
                      Watch Here
                    </Button>
                    
                    {/* Open in YouTube Button - Redirects to YouTube */}
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="gap-2 text-base px-6 py-6 h-auto bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-xl"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.yt_id}`, '_blank')}
                    >
                      <ExternalLink className="h-6 w-6" />
                      Open in YouTube
                    </Button>
                  </div>
                  
                  {video.watchProgress > 0 && (
                    <p className="text-white font-medium text-sm bg-black/60 px-4 py-2 rounded-full">
                      {video.watchProgress}% Complete
                    </p>
                  )}
                </div>
                
                {/* Progress Bar */}
                {video.watchProgress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={video.watchProgress} className="h-1 rounded-none" />
                  </div>
                )}
              </div>
            </Card>

            {/* Watch Here Modal - Embedded Player for Progress Tracking */}
            <Dialog open={isWatchModalOpen} onOpenChange={setIsWatchModalOpen}>
              <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black border-none">
                <div className="relative aspect-video w-full bg-black">
                  <YouTubePlayer
                    videoId={video.yt_id}
                    onProgressUpdate={updateProgress}
                    onVideoEnd={markComplete}
                    initialProgress={video.watchProgress}
                  />
                </div>
                <div className="p-4 bg-background border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-semibold text-lg truncate">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Progress: {progress}%{isCompleted && " • Completed ✓"}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setIsWatchModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Video Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={video.author.avatar} />
                        <AvatarFallback>{video.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{video.author.name}</span>
                      <span>•</span>
                      <span>{video.author.subscribers} subscribers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{video.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={isBookmarked ? "text-primary" : ""}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {video.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            {video.aiSummary?.available && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Generated Summary
                  </CardTitle>
                  <CardDescription>
                    Key insights and learning points from this video
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {video.aiSummary.keyPoints.map((point: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Personal Notes
                </CardTitle>
                <CardDescription>
                  Add your own notes and insights about this video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleSaveNotes} className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress & Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your progress on this video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Watch Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Button
                    onClick={toggleComplete}
                    className="w-full gap-2"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                  </Button>

                  <Button onClick={handleSetGoal} variant="outline" className="w-full gap-2">
                    <Target className="h-4 w-4" />
                    Set Learning Goal
                  </Button>

                  <Button onClick={handleGenerateSummary} variant="outline" className="w-full gap-2">
                    <Brain className="h-4 w-4" />
                    Generate Summary
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Playlist Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Playlist Navigation</CardTitle>
                <CardDescription>
                  Video {video.playlist.currentIndex + 1} of {video.playlist.totalVideos}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <SkipBack className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <SkipForward className="h-4 w-4" />
                    Next
                  </Button>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link to={`/playlists/${video.playlist.id}`}>
                    View All Videos
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Related Videos */}
            <Card>
              <CardHeader>
                <CardTitle>Related Videos</CardTitle>
                <CardDescription>Continue with these videos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {video.relatedVideos.map((relatedVideo) => (
                  <Link
                    key={relatedVideo.id}
                    to={`/videos/${relatedVideo.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{relatedVideo.title}</p>
                      <p className="text-xs text-muted-foreground">{relatedVideo.duration}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;