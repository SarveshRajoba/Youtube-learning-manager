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
  videos_count: number;
  completed_count: number;
  thumbnail: string;
  thumbnail_url?: string;
  yt_id: string;
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
      // Fetch dashboard stats from the new endpoint
      const response = await api.get("/dashboard/stats");
      const data = response.data.data;

      // Set real statistics
      setStats({
        totalVideos: data.stats.total_videos,
        completedVideos: data.stats.completed_videos,
        totalWatchTime: data.stats.total_watch_time,
        activeGoals: data.stats.active_goals,
        weeklyProgress: data.stats.weekly_progress
      });

      // Set real recent activity
      setRecentActivity(data.recent_activities || []);

      // Set real recent playlists
      setRecentPlaylists(data.recent_playlists || []);

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        // User is not authenticated, redirect to login
        toast({
          title: "Authentication Required",
          description: "Please log in to view your dashboard",
          variant: "destructive"
        });
        window.location.href = "/login";
        return;
      }
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load dashboard data";
      toast({
        title: "Dashboard Error",
        description: errorMessage,
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
        <div className="mb-8 px-4 sm:px-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's your learning progress overview
          </p>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-6 md:p-10 place-items-stretch">
          <Card className="w-full bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-primary">Videos Completed</CardTitle>
              <PlayCircle className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{stats.completedVideos}/{stats.totalVideos}</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalVideos > 0 ? Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="w-full bg-gradient-to-br from-success/10 to-success/5 border-success/20 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-success">Total Watch Time</CardTitle>
              <Clock className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{stats.totalWatchTime}</div>
              <p className="text-sm text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card className="w-full bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-warning">Active Goals</CardTitle>
              <Target className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{stats.activeGoals}</div>
              <p className="text-sm text-muted-foreground">In progress</p>
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
                <Card key={playlist.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div
                    className="aspect-video bg-muted relative"
                    onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.yt_id}`, '_blank')}
                  >
                    <img
                      src={playlist.thumbnail_url || playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <PlayCircle className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{playlist.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{playlist.completed_count || 0}/{playlist.videos_count || 0} videos</span>
                      <span>{playlist.videos_count > 0 ? Math.round(((playlist.completed_count || 0) / playlist.videos_count) * 100) : 0}%</span>
                    </div>
                    <Progress value={playlist.videos_count > 0 ? ((playlist.completed_count || 0) / playlist.videos_count) * 100 : 0} className="h-1" />
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.yt_id}`, '_blank')}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Watch on YouTube
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link to={`/playlists/${playlist.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
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