import { Music, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface Song {
  title: string;
  artist: string;
  language?: string;
  spotifyId?: string | null;
  albumArt?: string | null;
}

interface ChatMusicPlayerProps {
  songs: Song[];
}

const ChatMusicPlayer = ({ songs }: ChatMusicPlayerProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!songs || songs.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        🎵 Tap a song to listen
      </p>
      {songs.map((song, index) => {
        const isExpanded = expandedIndex === index;
        const hasSpotify = !!song.spotifyId;

        return (
          <Card key={index} className="bg-background/50 border-border/50 overflow-hidden">
            {/* Song row */}
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full p-3 flex items-center gap-3 text-left hover:bg-accent/30 transition-colors"
              disabled={!hasSpotify}
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {song.albumArt ? (
                  <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <Music className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {song.artist}
                  {song.language && <span className="text-primary ml-1">• {song.language}</span>}
                </p>
              </div>
              {hasSpotify ? (
                isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <span className="text-[10px] text-muted-foreground/60 shrink-0">Not found</span>
              )}
            </button>

            {/* Spotify embed */}
            {isExpanded && hasSpotify && (
              <div className="px-3 pb-3">
                <iframe
                  src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                  title={`${song.title} by ${song.artist}`}
                />
              </div>
            )}
          </Card>
        );
      })}
      <p className="text-[10px] text-muted-foreground/60">Log in to Spotify in the player for full songs</p>
    </div>
  );
};

export default ChatMusicPlayer;
