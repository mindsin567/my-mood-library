import { useState } from 'react';
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!songs || songs.length === 0) return null;

  const getYouTubeSearchQuery = (song: Song) => {
    return encodeURIComponent(`${song.title} ${song.artist} official audio`);
  };

  const getYouTubeSearchUrl = (song: Song) => {
    return `https://www.youtube.com/results?search_query=${getYouTubeSearchQuery(song)}`;
  };

  const getYouTubeEmbedUrl = (song: Song) => {
    // Use YouTube's embed with search - this shows a playlist of results
    return `https://www.youtube.com/embed?listType=search&list=${getYouTubeSearchQuery(song)}`;
  };

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
            onClick={() => toggleExpand(index)}
          >
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
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={expandedIndex === index ? "default" : "outline"}
                className="shrink-0 gap-1"
              >
                <Play className="w-3 h-3" />
                {expandedIndex === index ? "Close" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(getYouTubeSearchUrl(song), '_blank');
                }}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* YouTube Embed Player */}
          {expandedIndex === index && (
            <div className="px-3 pb-3">
              <iframe
                src={getYouTubeEmbedUrl(song)}
                width="100%"
                height="200"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
              />
            </div>
          )}
        </Card>
      ))}
      <p className="text-[10px] text-muted-foreground/60">Powered by YouTube</p>
    </div>
  );
};

export default ChatMusicPlayer;
