import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UseVideoProgressProps {
  videoId: string;
  initialProgress?: number;
  initialCompleted?: boolean;
}

/**
 * STEP 3: Video Progress Tracking Hook
 * 
 * WHY: Manages saving video watch progress to the backend
 * 
 * HOW IT WORKS:
 * 1. Receives progress updates from YouTubePlayer component
 * 2. Debounces API calls (waits 5 seconds after last update)
 * 3. Sends progress to backend: POST /progresses
 * 4. Handles both auto-tracking and manual completion
 * 5. Shows toast notifications for user feedback
 * 
 * DEBOUNCING: We don't want to hit the API every second while video plays.
 * Instead, we wait 5 seconds after the last progress change before saving.
 * This reduces server load while still tracking progress accurately.
 */
export const useVideoProgress = ({
  videoId,
  initialProgress = 0,
  initialCompleted = false,
}: UseVideoProgressProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(initialProgress);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync state with props when they change (e.g. after data fetch)
  useEffect(() => {
    setProgress(initialProgress);
    setCurrentTime(0);
    setIsCompleted(initialCompleted);
    lastSavedProgressRef.current = initialProgress;
  }, [initialProgress, initialCompleted, videoId]);
  
  // Debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef(initialProgress);

  /**
   * Save progress to backend
   * Called after debounce delay or immediately on video end
   */
  const saveProgress = useCallback(async (
    progressPct: number,
    timeInSeconds: number,
    completed: boolean = false
  ) => {
    // Don't save if progress hasn't changed
    if (progressPct === lastSavedProgressRef.current && !completed) {
      return;
    }

    try {
      setIsSaving(true);
      
      await api.post("/progresses", {
        progress: {
          video_id: videoId,
          completion_pct: progressPct,
          current_time: timeInSeconds,
          completed: completed,
          last_watched: new Date().toISOString(),
        }
      });

      lastSavedProgressRef.current = progressPct;
      
      // Only show toast for completion, not every progress update
      if (completed) {
        toast({
          title: "Video completed!",
          description: "Your progress has been saved.",
        });
      }
    } catch (error: any) {
      console.error("Error saving progress:", error);
      // Don't show error toast for every failed save, just log it
      if (completed) {
        toast({
          title: "Error",
          description: "Failed to save progress. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [videoId, toast]);

  /**
   * Update progress (called by YouTubePlayer every second)
   * Uses debouncing to avoid excessive API calls
   */
  const updateProgress = useCallback((progressPct: number, timeInSeconds: number) => {
    setProgress(progressPct);
    setCurrentTime(timeInSeconds);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout - save after 5 seconds of no updates
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(progressPct, timeInSeconds, false);
    }, 5000);
  }, [saveProgress]);

  /**
   * Mark video as complete (called when video ends or reaches 90%)
   * Saves immediately without debouncing
   */
  const markComplete = useCallback(async () => {
    setIsCompleted(true);
    setProgress(100);
    
    // Clear any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save immediately
    await saveProgress(100, currentTime, true);
  }, [saveProgress, currentTime]);

  /**
   * Toggle completion manually (for the "Mark Complete" button)
   */
  const toggleComplete = useCallback(async () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    if (newCompletedState) {
      setProgress(100);
      await saveProgress(100, currentTime, true);
    } else {
      // Mark as incomplete
      await saveProgress(progress, currentTime, false);
      toast({
        title: "Marked as incomplete",
        description: "You can continue watching this video.",
      });
    }
  }, [isCompleted, progress, currentTime, saveProgress, toast]);

  /**
   * Cleanup: Save progress when component unmounts
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save current progress on unmount (user navigating away)
      if (progress > lastSavedProgressRef.current) {
        saveProgress(progress, currentTime, isCompleted);
      }
    };
  }, [progress, currentTime, isCompleted, saveProgress]);

  return {
    progress,
    currentTime,
    isCompleted,
    isSaving,
    updateProgress,
    markComplete,
    toggleComplete,
  };
};
