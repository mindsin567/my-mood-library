import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface Song {
  title: string;
  artist: string;
  language?: string;
  audioUrl?: string;
  albumArt?: string;
}

interface ChatMusicPlayerProps {
  songs: Song[];
}

const ChatMusicPlayer = ({ songs }: ChatMusicPlayerProps) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const togglePlay = (index: number, audioUrl?: string) => {
    if (!audioUrl) return;

    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        if (progressInterval.current) clearInterval(progressInterval.current);
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.play();
      setPlayingIndex(index);
      setProgress(0);
      
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(pct || 0);
        }
      }, 100);
      
      audioRef.current.onended = () => {
        setPlayingIndex(null);
        setProgress(0);
        if (progressInterval.current) clearInterval(progressInterval.current);
      };
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume / 100 : 0;
    }
  };

  if (!songs || songs.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        🎵 Music for you
      </p>
      {songs.map((song, index) => (
        <Card key={index} className="bg-background/50 border-border/50">
          <div className="p-2 flex items-center gap-3">
            {song.albumArt ? (
              <img 
                src={song.albumArt} 
                alt={song.title}
                className="w-12 h-12 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                🎵
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {song.artist}
                {song.language && <span className="text-primary ml-1">• {song.language}</span>}
              </p>
              {playingIndex === index && (
                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {playingIndex === index && (
                <div className="flex items-center gap-1 mr-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-16"
                  />
                </div>
              )}
              <Button
                size="icon"
                variant={playingIndex === index ? "default" : "outline"}
                className="h-8 w-8 shrink-0"
                onClick={() => togglePlay(index, song.audioUrl)}
                disabled={!song.audioUrl}
              >
                {playingIndex === index ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
      <p className="text-[10px] text-muted-foreground/60">30-second previews via Deezer</p>
    </div>
  );
};

export default ChatMusicPlayer;
