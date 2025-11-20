'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  subtitle?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  autoPlay?: boolean;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  title,
  subtitle,
  onEnded,
  onPlay,
  onPause,
  autoPlay = false,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const soundRef = useRef<Howl | null>(null);
  const animationRef = useRef<number>();

  const { playbackSpeed, setPlaybackSpeed } = useUIStore();

  // Initialize audio
  useEffect(() => {
    if (!audioUrl) return;

    soundRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      rate: playbackSpeed,
      volume: volume,
      onload: () => {
        setDuration(soundRef.current?.duration() || 0);
      },
      onplay: () => {
        setIsPlaying(true);
        onPlay?.();
        updateProgress();
      },
      onpause: () => {
        setIsPlaying(false);
        onPause?.();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnded?.();

        // Handle repeat
        if (repeatMode === 'one') {
          soundRef.current?.play();
        }
      },
      onerror: (id, error) => {
        console.error('Audio error:', error);
      },
    });

    if (autoPlay) {
      soundRef.current.play();
    }

    return () => {
      soundRef.current?.unload();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl]);

  // Update progress
  const updateProgress = () => {
    if (soundRef.current && soundRef.current.playing()) {
      setCurrentTime(soundRef.current.seek());
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  // Play/Pause
  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  // Seek
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    soundRef.current?.seek(newTime);
    setCurrentTime(newTime);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!soundRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    soundRef.current.seek(newTime);
    setCurrentTime(newTime);
  };

  // Volume control
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    soundRef.current?.volume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      soundRef.current?.volume(volume);
      setIsMuted(false);
    } else {
      soundRef.current?.volume(0);
      setIsMuted(true);
    }
  };

  // Playback speed
  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setPlaybackSpeed(newSpeed);
    soundRef.current?.rate(newSpeed);
  };

  // Repeat mode
  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'one';
      if (prev === 'one') return 'all';
      return 'none';
    });
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6 space-y-4">
        {/* Title */}
        {(title || subtitle) && (
          <div className="text-center">
            {title && <h3 className="font-semibold text-lg">{title}</h3>}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleRepeatMode}
            className={cn(repeatMode !== 'none' && 'text-primary-500')}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(-10)}
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(10)}
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Volume & Speed Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Volume</label>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Speed: {playbackSpeed.toFixed(1)}x
            </label>
            <Slider
              value={[playbackSpeed]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleSpeedChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
