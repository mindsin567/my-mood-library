import { Music, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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

const ChatMusicPlayer = ({ songs: initialSongs }: ChatMusicPlayerProps) => {
  const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [songs, setSongs] = useState<Song[]>(initialSongs || []);

  const toggleCollapse = (index: number) => {
    setCollapsedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!songs || songs.length === 0) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const parts = searchQuery.split(' by ');
      const title = parts[0]?.trim() || searchQuery.trim();
      const artist = parts[1]?.trim() || '';

      const res = await supabase.functions.invoke('music-search', {
        body: { songs: [{ title, artist }] },
      });

      if (res.data?.songs?.[0]?.spotifyId) {
        const newSong = res.data.songs[0];
        setSongs(prev => [newSong, ...prev]);
        // New song added at index 0, ensure it's not collapsed
        setCollapsedIndices(prev => { const next = new Set(prev); next.delete(0); return next; });
      }
    } catch (err) {
      console.error('Song search error:', err);
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-1 flex items-center gap-1.5">
        <Music className="w-3 h-3" /> Recommended tracks
      </p>

      {/* Song search box */}
      <div className="flex gap-1.5 px-1">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search a song… e.g. Calm Down by Rema"
          className="h-8 text-xs rounded-lg border-border/50 bg-background/80"
          disabled={isSearching}
        />
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-lg"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-background/60 backdrop-blur-sm">
        {songs.map((song, index) => {
          const isCollapsed = collapsedIndices.has(index);
          const hasSpotify = !!song.spotifyId;
          const isLast = index === songs.length - 1;

          return (
            <div key={`${song.spotifyId || song.title}-${index}`}>
              <button
                onClick={() => toggleCollapse(index)}
                className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                  hasSpotify ? 'hover:bg-accent/40 cursor-pointer' : 'opacity-50 cursor-default'
                } ${!isCollapsed && hasSpotify ? 'bg-accent/20' : ''}`}
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
                  isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                ) : (
                  <span className="text-[9px] text-muted-foreground/40 shrink-0">N/A</span>
                )}
              </button>

              {!isCollapsed && hasSpotify && (
                <div className="px-3 pb-3">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="232"
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
