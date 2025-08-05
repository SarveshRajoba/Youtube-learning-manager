import { useState } from "react";
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
  ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - in real app this would be fetched based on video ID
const videoData = {
  id: 4,
  title: "Effects and Side Effects with useEffect",
  description: "Learn how to handle side effects in React using the useEffect hook. We'll cover dependency arrays, cleanup functions, and common patterns for data fetching, subscriptions, and DOM manipulation.",
  duration: "32:15",
  watchProgress: 65,
  completed: false,
  thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
  playlist: {
    id: 1,
    title: "React Masterclass 2024",
    currentIndex: 3,
    totalVideos: 25
  },
  author: {
    name: "Tech Academy",
    avatar: "",
    subscribers: "150K"
  },
  publishedAt: "2024-01-20",
  tags: ["React", "useEffect", "Hooks", "JavaScript"],
  aiSummary: {
    available: true,
    keyPoints: [
      "useEffect hook manages side effects in React components",
      "Dependency array controls when effects run",
      "Cleanup functions prevent memory leaks",
      "Common use cases include data fetching and event listeners"
    ],
    generatedAt: "2024-01-21T10:30:00Z"
  },
  notes: "This is a complex topic. Need to practice with more examples.",
  relatedVideos: [
    { id: 3, title: "State Management with useState", duration: "25:20" },
    { id: 5, title: "Context API and useContext", duration: "28:10" }
  ]
};

const VideoDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState(videoData.notes);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const video = videoData; // In real app, fetch based on id

  const handleMarkComplete = () => {
    toast({
      title: "Video completed!",
      description: "Great job! Moving to the next video.",
    });
  };

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
            {/* Video Player Placeholder */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button size="lg" className="gap-2">
                    <Play className="h-6 w-6" />
                    {video.watchProgress > 0 ? "Continue" : "Start"} Video
                  </Button>
                </div>
                {video.watchProgress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={video.watchProgress} className="h-1 rounded-none" />
                  </div>
                )}
              </div>
            </Card>

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
                {video.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            {video.aiSummary.available && (
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
                    {video.aiSummary.keyPoints.map((point, index) => (
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
                    <span>{video.watchProgress}%</span>
                  </div>
                  <Progress value={video.watchProgress} className="h-3" />
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    onClick={handleMarkComplete} 
                    className="w-full gap-2"
                    variant={video.completed ? "outline" : "default"}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {video.completed ? "Mark Incomplete" : "Mark Complete"}
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