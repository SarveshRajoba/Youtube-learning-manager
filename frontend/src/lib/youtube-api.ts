const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubePlaylist {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoCount: number;
    description?: string;
}

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string;
    description?: string;
    publishedAt: string;
}

export interface YouTubePlaylistItem {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string;
    position: number;
    description?: string;
}

class YouTubeAPI {
    private apiKey: string;

    constructor() {
        if (!YOUTUBE_API_KEY) {
            throw new Error("YouTube API key not found. Please set VITE_YOUTUBE_API_KEY in your environment variables.");
        }
        this.apiKey = YOUTUBE_API_KEY;
    }

    private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
        const url = new URL(`${YOUTUBE_API_BASE_URL}${endpoint}`);
        url.searchParams.append("key", this.apiKey);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getPlaylist(playlistId: string): Promise<YouTubePlaylist> {
        const data = await this.makeRequest("/playlists", {
            id: playlistId,
            part: "snippet,contentDetails"
        });

        if (!data.items || data.items.length === 0) {
            throw new Error("Playlist not found");
        }

        const playlist = data.items[0];
        return {
            id: playlist.id,
            title: playlist.snippet.title,
            thumbnailUrl: playlist.snippet.thumbnails?.medium?.url || "",
            videoCount: playlist.contentDetails.itemCount,
            description: playlist.snippet.description
        };
    }

    async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<YouTubePlaylistItem[]> {
        const data = await this.makeRequest("/playlistItems", {
            playlistId,
            maxResults: maxResults.toString(),
            part: "snippet,contentDetails"
        });

        if (!data.items) {
            return [];
        }

        // Get video IDs to fetch duration
        const videoIds = data.items.map((item: any) => item.contentDetails.videoId);
        const videoDetails = await this.getVideosDetails(videoIds);

        return data.items.map((item: any, index: number) => {
            const videoDetail = videoDetails.find(v => v.id === item.contentDetails.videoId);
            return {
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                thumbnailUrl: item.snippet.thumbnails?.medium?.url || "",
                duration: videoDetail?.duration || "PT0S",
                position: index + 1,
                description: item.snippet.description
            };
        });
    }

    async getVideosDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
        if (videoIds.length === 0) return [];

        const data = await this.makeRequest("/videos", {
            id: videoIds.join(","),
            part: "snippet,contentDetails"
        });

        if (!data.items) return [];

        return data.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            thumbnailUrl: video.snippet.thumbnails?.medium?.url || "",
            duration: video.contentDetails.duration,
            description: video.snippet.description,
            publishedAt: video.snippet.publishedAt
        }));
    }

    async searchPlaylists(query: string, maxResults: number = 10): Promise<YouTubePlaylist[]> {
        const data = await this.makeRequest("/search", {
            q: query,
            type: "playlist",
            maxResults: maxResults.toString(),
            part: "snippet"
        });

        if (!data.items) return [];

        return data.items.map((item: any) => ({
            id: item.id.playlistId,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails?.medium?.url || "",
            videoCount: 0, // Will need separate call to get actual count
            description: item.snippet.description
        }));
    }

    // Convert YouTube duration format (PT4M13S) to seconds
    static parseDuration(duration: string): number {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1] || "0");
        const minutes = parseInt(match[2] || "0");
        const seconds = parseInt(match[3] || "0");

        return hours * 3600 + minutes * 60 + seconds;
    }

    // Format seconds to MM:SS or HH:MM:SS
    static formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

export default YouTubeAPI; 