import { Music, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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
    <div className="mt-3 space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-1 flex items-center gap-1.5">
        <Music className="w-3 h-3" /> Recommended tracks
      </p>
      <div className="rounded-xl border border-border/50 overflow-hidden bg-background/60 backdrop-blur-sm">
        {songs.map((song, index) => {
          const isExpanded = expandedIndex === index;
          const hasSpotify = !!song.spotifyId;
          const isLast = index === songs.length - 1;

          return (
            <div key={index}>
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                  hasSpotify ? 'hover:bg-accent/40 cursor-pointer' : 'opacity-50 cursor-default'
                } ${isExpanded ? 'bg-accent/20' : ''}`}
                disabled={!hasSpotify}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                  {song.albumArt ? (
                    <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-primary/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[13px] truncate text-foreground">{song.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {song.artist}
                    {song.language && <span className="text-primary/70 ml-1">· {song.language}</span>}
                  </p>
                </div>
                {hasSpotify ? (
                  isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )
                ) : (
                  <span className="text-[9px] text-muted-foreground/40 shrink-0">N/A</span>
                )}
              </button>

              {isExpanded && hasSpotify && (
                <div className="px-3 pb-3">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-lg"
                    title={`${song.title} by ${song.artist}`}
                  />
                </div>
              )}

              {!isLast && <div className="h-px bg-border/30 mx-3" />}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/50 px-1">Log in to Spotify for full playback</p>
    </div>
  );
};

export default ChatMusicPlayer;
