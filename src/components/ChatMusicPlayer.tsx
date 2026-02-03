import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Song {
  title: string;
  artist: string;
  language?: string;
}

interface ChatMusicPlayerProps {
  songs: Song[];
}

const ChatMusicPlayer = ({ songs }: ChatMusicPlayerProps) => {
  if (!songs || songs.length === 0) return null;

  const getYouTubeSearchUrl = (song: Song) => {
    const query = encodeURIComponent(`${song.title} ${song.artist} official audio`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  const openYouTube = (song: Song) => {
    window.open(getYouTubeSearchUrl(song), '_blank');
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        🎵 Music for you
      </p>
      {songs.map((song, index) => (
        <Card key={index} className="bg-background/50 border-border/50 overflow-hidden">
          <div className="p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {song.artist}
                {song.language && <span className="text-primary ml-1">• {song.language}</span>}
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="shrink-0 gap-1"
              onClick={() => openYouTube(song)}
            >
              <Play className="w-3 h-3" />
              Play on YouTube
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </Card>
      ))}
      <p className="text-[10px] text-muted-foreground/60">Opens YouTube in new tab</p>
    </div>
  );
};

export default ChatMusicPlayer;
