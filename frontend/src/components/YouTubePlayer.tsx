import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// YouTube IFrame Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  onProgressUpdate: (progress: number, currentTime: number) => void;
  onVideoEnd: () => void;
  initialProgress?: number;
  className?: string;
}

/**
 * STEP 2: YouTube Player Component
 * 
 * WHY: Embeds YouTube videos and tracks watch progress automatically
 * 
 * HOW IT WORKS:
 * 1. Loads YouTube IFrame API dynamically
 * 2. Creates player instance when API is ready
 * 3. Listens to player events (play, pause, end)
 * 4. Calculates progress every second during playback
 * 5. Calls onProgressUpdate callback with current progress
 * 6. Calls onVideoEnd when video reaches 90%+ or ends
 * 
 * FALLBACK: If video can't be embedded (age-restricted, disabled embeds),
 * shows error message and user can use manual "Mark Complete" button
 */
const YouTubePlayer = ({
  videoId,
  onProgressUpdate,
  onVideoEnd,
  initialProgress = 0,
  className = "",
}: YouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load the API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API will call this when ready
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    return () => {
      // Cleanup
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!containerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin, // Required to prevent redirects
          // Start at last watched position if available
          start: initialProgress > 0 ? Math.floor((initialProgress / 100) * getDuration()) : 0,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handlePlayerStateChange,
          onError: handlePlayerError,
        },
      });
    } catch (err) {
      console.error("Error initializing YouTube player:", err);
      setError("Failed to load video player");
      setIsLoading(false);
    }
  };

  const handlePlayerReady = () => {
    setIsLoading(false);
    console.log("YouTube player ready");
  };

  const handlePlayerStateChange = (event: any) => {
    const state = event.data;

    // YT.PlayerState constants
    // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
    
    if (state === 1) {
      // Playing
      setIsPlaying(true);
      startProgressTracking();
    } else if (state === 2) {
      // Paused
      setIsPlaying(false);
      stopProgressTracking();
      updateProgress(); // Save progress when paused
    } else if (state === 0) {
      // Ended
      setIsPlaying(false);
      stopProgressTracking();
      handleVideoComplete();
    }
  };

  const handlePlayerError = (event: any) => {
    const errorCode = event.data;
    let errorMessage = "Video cannot be played";

    switch (errorCode) {
      case 2:
        errorMessage = "Invalid video ID";
        break;
      case 5:
        errorMessage = "HTML5 player error";
        break;
      case 100:
        errorMessage = "Video not found or private";
        break;
      case 101:
      case 150:
        errorMessage = "Video cannot be embedded (use manual complete button)";
        break;
    }

    setError(errorMessage);
    setIsLoading(false);
    console.error("YouTube player error:", errorCode, errorMessage);
  };

  const getDuration = (): number => {
    if (!playerRef.current || !playerRef.current.getDuration) return 0;
    return playerRef.current.getDuration();
  };

  const getCurrentTime = (): number => {
    if (!playerRef.current || !playerRef.current.getCurrentTime) return 0;
    return playerRef.current.getCurrentTime();
  };

  const updateProgress = () => {
    const duration = getDuration();
    const currentTime = getCurrentTime();

    if (duration > 0) {
      const progress = Math.floor((currentTime / duration) * 100);
      onProgressUpdate(progress, Math.floor(currentTime));

      // Auto-complete at 90% (some videos have credits/outros)
      if (progress >= 90 && progress < 100) {
        handleVideoComplete();
      }
    }
  };

  const handleVideoComplete = () => {
    stopProgressTracking();
    onProgressUpdate(100, Math.floor(getDuration()));
    onVideoEnd();
  };

  const startProgressTracking = () => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Update progress every second
    progressIntervalRef.current = setInterval(() => {
      updateProgress();
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  if (error) {
    return (
      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <br />
            <span className="text-xs mt-2 block">
              You can still mark this video as complete using the button below.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default YouTubePlayer;
