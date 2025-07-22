
"use client";

import { Pause, Play } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  onPlaybackEnd?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onPlaybackEnd,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (autoPlay) {
      // Browsers often require a user gesture to play audio.
      // We'll try to play and catch any errors silently.
      audio.play().catch(e => {
        console.warn("Autoplay was prevented by the browser.", e);
        setIsPlaying(false);
      });
    }
  }, [autoPlay]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setProgress(0);
    };

    const setAudioTime = () => {
      const value = (audio.currentTime / audio.duration) * 100 || 0;
      setProgress(value);
    };

    const handlePlaybackEnd = () => {
      setIsPlaying(false);
      if (onPlaybackEnd) {
        onPlaybackEnd();
      }
    };
    
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handlePlaybackEnd);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handlePlaybackEnd);
    };
  }, [audioUrl, onPlaybackEnd]);

  const togglePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
