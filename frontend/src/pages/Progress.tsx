import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Filter,
  Search,
  Calendar,
  BarChart3
} from "lucide-react";

// Mock data
const progressData = {
  stats: {
    totalVideosWatched: 45,
    totalWatchTime: "28h 45m",
    averagePerDay: "1h 20m",
    streakDays: 7,
    completionRate: 78
  },
  recentVideos: [
    {
      id: 1,
      title: "Advanced React Patterns",
      playlist: "React Masterclass",
      progress: 100,
      duration: "25:30",
      completedAt: "2024-01-21T14:30:00Z",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=120&fit=crop"
    },
    {
      id: 2,
      title: "Node.js Authentication",
      playlist: "Backend Development",
      progress: 65,
      duration: "32:15",
      lastWatchedAt: "2024-01-21T10:15:00Z",
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=200&h=120&fit=crop"
    },
    {
      id: 3,
      title: "CSS Grid Layout",
      playlist: "Frontend Mastery",
      progress: 45,
      duration: "18:45",
      lastWatchedAt: "2024-01-20T16:20:00Z",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=120&fit=crop"
    },
    {
      id: 4,
      title: "Database Design Principles",
      playlist: "Database Fundamentals",
      progress: 90,
      duration: "40:10",
      lastWatchedAt: "2024-01-20T09:45:00Z",
      thumbnail: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=200&h=120&fit=crop"
    }
  ],
  weeklyProgress: [
    { day: "Mon", minutes: 85 },
    { day: "Tue", minutes: 120 },
    { day: "Wed", minutes: 95 },
    { day: "Thu", minutes: 140 },
    { day: "Fri", minutes: 110 },
    { day: "Sat", minutes: 75 },
    { day: "Sun", minutes: 90 }
  ]
};

const Progress = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const filteredVideos = progressData.recentVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.playlist.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "completed" && video.progress === 100) ||
                         (filterStatus === "in-progress" && video.progress > 0 && video.progress < 100) ||
                         (filterStatus === "not-started" && video.progress === 0);
    
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 100) return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    if (progress > 0) return <Badge variant="secondary">In Progress</Badge>;
    return <Badge variant="outline">Not Started</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and see how far you've come
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
              <PlayCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.stats.totalVideosWatched}</div>
              <p className="text-xs text-muted-foreground">
                Total completed
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.stats.totalWatchTime}</div>
              <p className="text-xs text-muted-foreground">
                Total time invested
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <BarChart3 className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.stats.averagePerDay}</div>
              <p className="text-xs text-muted-foreground">
                Past 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.stats.streakDays}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent to-accent/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.stats.completionRate}%</div>
              <ProgressBar value={progressData.stats.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Progress List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Recent Learning Activity</CardTitle>
                    <CardDescription>Videos you've been working on</CardDescription>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="not-started">Not Started</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVideos.map((video) => (
                    <div key={video.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors group">
                      <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <PlayCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              <Link to={`/videos/${video.id}`}>{video.title}</Link>
                            </h3>
                            <p className="text-sm text-muted-foreground">{video.playlist}</p>
                          </div>
                          {getStatusBadge(video.progress)}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-muted-foreground">{video.progress}%</span>
                          </div>
                          <ProgressBar value={video.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {video.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {video.completedAt ? 
                                `Completed ${formatDuration(video.completedAt)}` : 
                                `Last watched ${formatDuration(video.lastWatchedAt || '')}`
                              }
                            </span>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/videos/${video.id}`}>
                              {video.progress === 100 ? "Review" : video.progress > 0 ? "Continue" : "Start"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredVideos.length === 0 && (
                    <div className="text-center py-8">
                      <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No videos found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Try adjusting your search terms" : "Start watching videos to see your progress here"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Chart */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your learning time this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.weeklyProgress.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{day.day}</span>
                      <div className="flex-1 mx-4">
                        <ProgressBar value={(day.minutes / 150) * 100} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {Math.floor(day.minutes / 60)}h {day.minutes % 60}m
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.floor(progressData.weeklyProgress.reduce((sum, day) => sum + day.minutes, 0) / 60)}h{" "}
                      {progressData.weeklyProgress.reduce((sum, day) => sum + day.minutes, 0) % 60}m
                    </div>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
                <CardDescription>Your current objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Watch 5 videos this week</span>
                    <span>4/5</span>
                  </div>
                  <ProgressBar value={80} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete React course</span>
                    <span>18/25</span>
                  </div>
                  <ProgressBar value={72} className="h-2" />
                </div>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/goals">
                    <CheckCircle className="h-4 w-4" />
                    View All Goals
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;