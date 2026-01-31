import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface Song {
  title: string;
  artist: string;
  language?: string;
  spotifyId?: string;
  albumArt?: string;
  previewUrl?: string;
}

interface ChatMusicPlayerProps {
  songs: Song[];
}

const ChatMusicPlayer = ({ songs }: ChatMusicPlayerProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!songs || songs.length === 0) return null;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        🎵 Music for you
      </p>
      {songs.map((song, index) => (
        <Card key={index} className="bg-background/50 border-border/50 overflow-hidden">
          <div 
            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => song.spotifyId && toggleExpand(index)}
          >
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
            </div>
            {song.spotifyId && (
              <Button
                size="sm"
                variant={expandedIndex === index ? "default" : "outline"}
                className="shrink-0 gap-1"
              >
                {expandedIndex === index ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {expandedIndex === index ? "Close" : "Play"}
              </Button>
            )}
          </div>
          
          {/* Spotify Embed Player */}
          {song.spotifyId && expandedIndex === index && (
            <div className="px-3 pb-3">
              <iframe
                src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
              />
            </div>
          )}
        </Card>
      ))}
      <p className="text-[10px] text-muted-foreground/60">Powered by Spotify</p>
    </div>
  );
};

export default ChatMusicPlayer;
