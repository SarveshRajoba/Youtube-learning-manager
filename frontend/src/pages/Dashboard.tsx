import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import {
  PlayCircle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Brain,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalVideos: number;
  completedVideos: number;
  totalWatchTime: string;
  activeGoals: number;
  weeklyProgress: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  playlist?: string;
  timestamp: string;
}

interface RecentPlaylist {
  id: string;
  title: string;
  videosCount: number;
  completedCount: number;
  thumbnail: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    completedVideos: 0,
    totalWatchTime: "0h 0m",
    activeGoals: 0,
    weeklyProgress: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentPlaylists, setRecentPlaylists] = useState<RecentPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      // Fetch playlists to calculate stats
      const playlistsResponse = await api.get("/playlists");
      const playlists = playlistsResponse.data.data || [];

      // Calculate basic stats from playlists
      const totalVideos = playlists.reduce((acc: number, playlist: any) => acc + (playlist.attributes.video_count || 0), 0);

      // For now, we'll use placeholder data until we have progress tracking
      const calculatedStats: DashboardStats = {
        totalVideos,
        completedVideos: Math.floor(totalVideos * 0.3), // 30% completion for demo
        totalWatchTime: "2h 15m", // Placeholder
        activeGoals: 2, // Placeholder
        weeklyProgress: 65 // Placeholder
      };

      setStats(calculatedStats);

      // Convert playlists to recent playlists format
      const recentPlaylistsData = playlists.slice(0, 3).map((playlist: any) => ({
        id: playlist.id,
        title: playlist.attributes.title,
        videosCount: playlist.attributes.video_count || 0,
        completedCount: Math.floor((playlist.attributes.video_count || 0) * 0.3), // 30% for demo
        thumbnail: playlist.attributes.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
      }));

      setRecentPlaylists(recentPlaylistsData);

      // Placeholder recent activity until we have progress tracking
      setRecentActivity([
        {
          id: "1",
          type: "imported",
          title: "React Masterclass",
          timestamp: "2 hours ago"
        },
        {
          id: "2",
          type: "started",
          title: "Advanced TypeScript Patterns",
          playlist: "TypeScript Pro",
          timestamp: "1 day ago"
        }
      ]);

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        // User is not authenticated, redirect to login
        window.location.href = "/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your learning progress overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Completed</CardTitle>
              <PlayCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedVideos}/{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalVideos > 0 ? Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWatchTime}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGoals}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyProgress}%</div>
              <p className="text-xs text-muted-foreground">
                vs last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.playlist && (
                        <p className="text-xs text-muted-foreground">{activity.playlist}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link to="/playlists">
                  <Plus className="mr-2 h-4 w-4" />
                  Import Playlist
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/progress">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Progress
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/goals">
                  <Target className="mr-2 h-4 w-4" />
                  Set Goals
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Playlists */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Recent Playlists
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/playlists" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPlaylists.map((playlist) => (
                <Card key={playlist.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2">{playlist.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{playlist.completedCount}/{playlist.videosCount} videos</span>
                      <span>{playlist.videosCount > 0 ? Math.round((playlist.completedCount / playlist.videosCount) * 100) : 0}%</span>
                    </div>
                    <Progress value={playlist.videosCount > 0 ? (playlist.completedCount / playlist.videosCount) * 100 : 0} className="h-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;