import { Play, Pause, Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Song {
  title: string;
  artist: string;
  language?: string;
  audioUrl?: string | null;
  albumArt?: string | null;
}

interface ChatMusicPlayerProps {
  songs: Song[];
}

const ChatMusicPlayer = ({ songs }: ChatMusicPlayerProps) => {
  const { toast } = useToast();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlay = (index: number, audioUrl: string) => {
    // If already playing this track, pause it
    if (playingIndex === index && audioRef.current) {
      audioRef.current.pause();
      setPlayingIndex(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Stop any currently playing track
    if (audioRef.current) {
      audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingIndex(index);

    audio.play().catch(() => {
      toast({ title: 'Playback failed', description: 'Could not play this preview.', variant: 'destructive' });
      setPlayingIndex(null);
    });

    intervalRef.current = setInterval(() => {
      if (audio.duration) {
        setProgress(prev => ({ ...prev, [index]: (audio.currentTime / audio.duration) * 100 }));
      }
    }, 100);

    audio.onended = () => {
      setPlayingIndex(null);
      setProgress(prev => ({ ...prev, [index]: 0 }));
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  };

  if (!songs || songs.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        🎵 Suggested songs — tap to preview
      </p>
      {songs.map((song, index) => {
        const isPlaying = playingIndex === index;
        const hasAudio = !!song.audioUrl;

        return (
          <Card key={index} className="bg-background/50 border-border/50 overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              {/* Album art or fallback */}
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {song.albumArt ? (
                  <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <span className="text-lg">🎵</span>
                )}
              </div>

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {song.artist}
                  {song.language && <span className="text-primary ml-1">• {song.language}</span>}
                </p>
                {/* Progress bar */}
                {isPlaying && (
                  <Progress value={progress[index] || 0} className="h-1 mt-1.5" />
                )}
              </div>

              {/* Play/Pause button */}
              {hasAudio ? (
                <button
                  onClick={() => togglePlay(index, song.audioUrl!)}
                  className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground/60 shrink-0">No preview</span>
              )}
            </div>
          </Card>
        );
      })}
      <p className="text-[10px] text-muted-foreground/60">30-second previews powered by Deezer</p>
    </div>
  );
};

export default ChatMusicPlayer;
