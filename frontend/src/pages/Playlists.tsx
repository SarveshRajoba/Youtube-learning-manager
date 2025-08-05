import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import YouTubeImportModal from "@/components/YouTubeImportModal";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  PlayCircle,
  Clock,
  Filter,
  ExternalLink,
  MoreVertical,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";

interface Playlist {
  id: string;
  yt_id: string;
  title: string;
  thumbnail_url: string;
  video_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = ["all", "Frontend", "Backend", "Programming", "Data Science"];

  const fetchPlaylists = async () => {
    try {
      const response = await api.get("/playlists");
      setPlaylists(response.data.data || []);
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

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    // For now, we'll keep the category filter but it's not implemented in backend
    const matchesCategory = selectedCategory === "all";
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success text-success-foreground";
      case "Intermediate": return "bg-warning text-warning-foreground";
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleImportSuccess = () => {
    fetchPlaylists(); // Refresh the playlists after import
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading playlists...</span>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Playlists</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your video learning playlists
            </p>
          </div>
          <YouTubeImportModal onImportSuccess={handleImportSuccess} />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search playlists..."
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="relative">
                <img
                  src={playlist.thumbnail_url || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
                  alt={playlist.title || "Playlist"}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 border-0">
                        <MoreVertical className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.yt_id}`, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on YouTube
                      </DropdownMenuItem>
                      <DropdownMenuItem>Remove from Library</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    <Link to={`/playlists/${playlist.id}`}>
                      {playlist.title || "Untitled Playlist"}
                    </Link>
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">
                  YouTube Playlist
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Meta info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" />
                        {playlist.video_count} videos
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      YouTube
                    </Badge>
                  </div>

                  {/* Action button */}
                  <Button asChild className="w-full mt-4">
                    <Link to={`/playlists/${playlist.id}`}>
                      Start Learning
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlaylists.length === 0 && (
          <div className="text-center py-12">
            <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No playlists found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by importing your first playlist from YouTube"}
            </p>
            <YouTubeImportModal onImportSuccess={handleImportSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlists;