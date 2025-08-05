import { useState } from "react";
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
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - in real app this would be fetched based on playlist ID
const playlistData = {
  id: 1,
  title: "React Masterclass 2024",
  description: "Complete guide to modern React development with hooks, context, and performance optimization. Learn best practices and build real-world projects.",
  author: "Tech Academy",
  authorAvatar: "",
  videosCount: 25,
  completedCount: 18,
  totalDuration: "8h 45m",
  category: "Frontend",
  difficulty: "Intermediate",
  thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
  createdAt: "2024-01-15",
  videos: [
    {
      id: 1,
      title: "Introduction to React 18",
      duration: "12:30",
      completed: true,
      watchProgress: 100,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Understanding JSX and Components",
      duration: "18:45",
      completed: true,
      watchProgress: 100,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      title: "State Management with useState",
      duration: "25:20",
      completed: true,
      watchProgress: 100,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Effects and Side Effects with useEffect",
      duration: "32:15",
      completed: false,
      watchProgress: 65,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
    },
    {
      id: 5,
      title: "Context API and useContext",
      duration: "28:10",
      completed: false,
      watchProgress: 0,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
    }
  ]
};

const PlaylistDetail = () => {
  const { id } = useParams();
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  
  const playlist = playlistData; // In real app, fetch based on id
  const overallProgress = (playlist.completedCount / playlist.videosCount) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success text-success-foreground";
      case "Intermediate": return "bg-warning text-warning-foreground";
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getNextVideo = () => {
    return playlist.videos.find(video => !video.completed) || playlist.videos[0];
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
                src={playlist.thumbnail} 
                alt={playlist.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button size="lg" className="gap-2">
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
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={playlist.authorAvatar} />
                        <AvatarFallback>{playlist.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{playlist.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
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
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on YouTube
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Target className="mr-2 h-4 w-4" />
                      Set Learning Goal
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {playlist.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(playlist.difficulty)}>
                  {playlist.difficulty}
                </Badge>
                <Badge variant="outline">{playlist.category}</Badge>
                <Badge variant="outline">{playlist.videosCount} videos</Badge>
                <Badge variant="outline">{playlist.totalDuration}</Badge>
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
                    <span>{playlist.completedCount}/{playlist.videosCount}</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">{Math.round(overallProgress)}% complete</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{playlist.completedCount}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{playlist.videosCount - playlist.completedCount}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
                
                <Button className="w-full gap-2" asChild>
                  <Link to={`/videos/${getNextVideo().id}`}>
                    <Play className="h-4 w-4" />
                    {playlist.completedCount > 0 ? "Continue" : "Start"} Next Video
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Target className="h-4 w-4" />
                  Set Learning Goal
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Brain className="h-4 w-4" />
                  AI Summary
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on YouTube
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

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
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                    selectedVideo === video.id ? "bg-accent border-primary" : "border-border"
                  }`}
                  onClick={() => setSelectedVideo(video.id)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      {video.completed ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : video.watchProgress > 0 ? (
                        <Play className="h-3 w-3 text-white" />
                      ) : (
                        <Circle className="h-4 w-4 text-white/60" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{video.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration}</span>
                      </div>
                      {video.watchProgress > 0 && !video.completed && (
                        <div className="flex items-center gap-2">
                          <Progress value={video.watchProgress} className="w-20 h-1" />
                          <span className="text-xs text-muted-foreground">{video.watchProgress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/videos/${video.id}`}>
                        {video.completed ? "Rewatch" : video.watchProgress > 0 ? "Continue" : "Watch"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaylistDetail;