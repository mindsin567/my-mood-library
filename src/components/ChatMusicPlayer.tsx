import { Play, ExternalLink, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Song {
  title: string;
  artist: string;
  language?: string;
  youtubeUrl?: string;
}

interface ChatMusicPlayerProps {
  songs: Song[];
}

const ChatMusicPlayer = ({ songs }: ChatMusicPlayerProps) => {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!songs || songs.length === 0) return null;

  const getYouTubeUrl = (song: Song) => {
    if (song.youtubeUrl) return song.youtubeUrl;
    const query = encodeURIComponent(`${song.title} ${song.artist} official audio`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  const copyUrl = async (song: Song, index: number) => {
    const url = getYouTubeUrl(song);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      toast({ title: 'Link copied!', description: 'Paste it in your browser to listen.' });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({ title: 'Copy failed', description: url, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        🎵 Suggested songs
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
            <button
              onClick={() => copyUrl(song, index)}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {copiedIndex === index ? (
                <><Check className="w-3 h-3" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy Link</>
              )}
            </button>
          </div>
        </Card>
      ))}
      <p className="text-[10px] text-muted-foreground/60">Copy the link and paste in your browser to listen</p>
    </div>
  );
};

export default ChatMusicPlayer;
