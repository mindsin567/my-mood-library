import { useState, useRef } from 'react';
import { Sparkles, Music, BookOpen, Play, Pause, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Song {
  title: string;
  artist: string;
  mood?: string;
  language?: string;
  audioUrl?: string;
  albumArt?: string;
}

interface Book {
  title: string;
  author: string;
  reason: string;
}

interface Recommendations {
  message: string;
  songs: Song[];
  books: Book[];
}

const questions: Question[] = [
  {
    id: 'mood',
    text: "How are you feeling?",
    options: ['Happy', 'Calm', 'Stressed', 'Sad', 'Angry']
  },
  {
    id: 'intention',
    text: "What do you need?",
    options: ['Relax', 'Get motivated', 'Focus', 'Heal']
  },
  {
    id: 'language',
    text: "Song language?",
    options: ['English', 'Hindi', 'Spanish', 'Korean', 'Any']
  }
];

const RecommendationsDialog = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await getRecommendations();
    }
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      // Get AI recommendations
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          type: 'recommendations',
          answers
        }
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      // Fetch real song previews from Deezer
      if (data.songs && data.songs.length > 0) {
        const musicResponse = await supabase.functions.invoke('music-search', {
          body: { songs: data.songs }
        });
        
        if (musicResponse.data?.songs) {
          data.songs = musicResponse.data.songs;
        }
      }

      setRecommendations(data);
    } catch (error) {
      console.error('Recommendations error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = (index: number, audioUrl?: string) => {
    if (!audioUrl) return;

    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingIndex(null);
      setPlayingIndex(index);
    }
  };

  const resetDialog = () => {
    setStep(0);
    setAnswers({});
    setRecommendations(null);
    setPlayingIndex(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Personalized Suggestions
          </DialogTitle>
        </DialogHeader>

        {!recommendations && !isLoading && (
          <div className="space-y-6">
            <Progress value={progress} className="h-2" />
            
            <div className="space-y-4">
              <p className="text-lg font-medium">{currentQuestion.text}</p>
              
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="w-full gap-2"
            >
              {step < questions.length - 1 ? (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Get Suggestions <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Finding perfect suggestions for you...</p>
          </div>
        )}

        {recommendations && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* AI Message */}
              <p className="text-muted-foreground italic">"{recommendations.message}"</p>

              {/* Music Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Music className="w-4 h-4 text-primary" />
                  Music for You
                </div>
                <div className="space-y-2">
                  {recommendations.songs?.map((song, index) => (
                    <Card key={index} className="bg-secondary/50">
                      <CardContent className="p-2 flex items-center gap-3">
                        {song.albumArt && (
                          <img 
                            src={song.albumArt} 
                            alt={song.title}
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {song.artist} {song.language && <span className="text-primary">• {song.language}</span>}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant={playingIndex === index ? "default" : "ghost"}
                          className="shrink-0"
                          onClick={() => togglePlay(index, song.audioUrl)}
                          disabled={!song.audioUrl}
                        >
                          {playingIndex === index ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Books Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Books for Your Mind
                </div>
                <div className="space-y-2">
                  {recommendations.books?.map((book, index) => (
                    <Card key={index} className="bg-secondary/50">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">by {book.author}</p>
                        <p className="text-xs text-muted-foreground/80 italic">{book.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={resetDialog} className="w-full">
                Start Over
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationsDialog;
