import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
    Search,
    PlayCircle,
    Clock,
    ExternalLink,
    Loader2,
    Plus
} from "lucide-react";
import YouTubeAPI, { YouTubePlaylist } from "@/lib/youtube-api";
import api from "@/lib/api";

interface YouTubeImportModalProps {
    onImportSuccess: () => void;
}

const YouTubeImportModal = ({ onImportSuccess }: YouTubeImportModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<YouTubePlaylist[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const youtubeAPI = new YouTubeAPI();
            const results = await youtubeAPI.searchPlaylists(searchQuery, 10);
            setSearchResults(results);
        } catch (error: any) {
            console.error("Search error:", error);
            toast({
                title: "Search Error",
                description: error.message || "Failed to search YouTube playlists",
                variant: "destructive"
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleImport = async (playlist: YouTubePlaylist) => {
        setIsImporting(true);
        try {
            // First, get the full playlist details with videos
            const youtubeAPI = new YouTubeAPI();
            const fullPlaylist = await youtubeAPI.getPlaylist(playlist.id);
            const videos = await youtubeAPI.getPlaylistVideos(playlist.id);

            // Create playlist in backend
            const playlistResponse = await api.post("/playlists", {
                playlist: {
                    yt_id: fullPlaylist.id,
                    title: fullPlaylist.title,
                    thumbnail_url: fullPlaylist.thumbnailUrl,
                    video_count: fullPlaylist.videoCount
                }
            });

            // Create videos in backend
            for (const video of videos) {
                await api.post("/videos", {
                    video: {
                        playlist_id: playlistResponse.data.data.id,
                        yt_id: video.id,
                        title: video.title,
                        thumbnail_url: video.thumbnailUrl,
                        duration: YouTubeAPI.parseDuration(video.duration),
                        position: video.position
                    }
                });
            }

            toast({
                title: "Playlist Imported!",
                description: `${fullPlaylist.title} has been added to your library with ${videos.length} videos.`,
            });

            setIsOpen(false);
            onImportSuccess();
        } catch (error: any) {
            console.error("Import error:", error);
            toast({
                title: "Import Error",
                description: error.response?.data?.message || "Failed to import playlist",
                variant: "destructive"
            });
        } finally {
            setIsImporting(false);
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Import from YouTube
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import YouTube Playlist</DialogTitle>
                    <DialogDescription>
                        Search for YouTube playlists to import into your learning library
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search for playlists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Searching...
                                </>
                            ) : (
                                "Search"
                            )}
                        </Button>
                    </div>

                    {/* Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-medium">Search Results</h3>
                            <div className="grid gap-4">
                                {searchResults.map((playlist) => (
                                    <Card key={playlist.id} className="overflow-hidden">
                                        <div className="flex gap-4">
                                            <img
                                                src={playlist.thumbnailUrl}
                                                alt={playlist.title}
                                                className="w-32 h-20 object-cover rounded"
                                            />
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-foreground mb-1">
                                                            {playlist.title}
                                                        </h4>
                                                        {playlist.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                                {playlist.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <PlayCircle className="h-4 w-4" />
                                                                {playlist.videoCount} videos
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.id}`, '_blank')}
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleImport(playlist)}
                                                            disabled={isImporting}
                                                        >
                                                            {isImporting ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                                    Importing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="h-4 w-4 mr-1" />
                                                                    Import
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {searchResults.length === 0 && searchQuery && !isSearching && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No playlists found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default YouTubeImportModal; 