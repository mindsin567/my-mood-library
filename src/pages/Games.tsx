import { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon, RotateCcw, Trophy } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type MoodType = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry' | 'excited' | 'tired';

const moodConfig: Record<MoodType, { icon: typeof Smile; label: string; games: string[] }> = {
  happy: { icon: Smile, label: 'Happy', games: ['memory', 'wordscramble'] },
  excited: { icon: Zap, label: 'Excited', games: ['reaction', 'memory'] },
  calm: { icon: Heart, label: 'Calm', games: ['wordscramble', 'breathing-count'] },
  neutral: { icon: Meh, label: 'Neutral', games: ['memory', 'reaction'] },
  tired: { icon: Moon, label: 'Tired', games: ['breathing-count', 'wordscramble'] },
  anxious: { icon: Cloud, label: 'Anxious', games: ['breathing-count', 'wordscramble'] },
  sad: { icon: Frown, label: 'Sad', games: ['memory', 'wordscramble'] },
  angry: { icon: Flame, label: 'Angry', games: ['breathing-count', 'reaction'] },
};

// ========== Memory Match Game ==========
const emojis = ['🌸', '🌊', '🌿', '☀️', '🦋', '🌙', '⭐', '🍃'];

const MemoryGame = () => {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const flipCard = (id: number) => {
    if (selected.length === 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newCards = cards.map((c, i) => i === id ? { ...c, flipped: true } : c);
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c));
          setSelected([]);
          // Check win
          const allMatched = newCards.every((c, i) => (i === a || i === b) ? true : c.matched);
          if (allMatched) setWon(true);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Moves: <span className="font-bold text-foreground">{moves}</span></p>
        <Button size="sm" variant="outline" onClick={initGame}><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </div>
      {won && (
        <div className="text-center py-2 rounded-lg bg-primary/10">
          <p className="font-semibold text-primary flex items-center justify-center gap-1"><Trophy className="w-4 h-4" /> You won in {moves} moves!</p>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-primary/10 scale-100'
                : 'bg-secondary hover:bg-secondary/80 scale-95'
            } ${card.matched ? 'opacity-60' : ''}`}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
};

// ========== Reaction Time Game ==========
const ReactionGame = () => {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result' | 'early'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRound = () => {
    setState('ready');
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting' || state === 'result' || state === 'early') {
      startRound();
    } else if (state === 'ready') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('early');
    } else if (state === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      if (!best || time < best) setBest(time);
      setState('result');
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const bgColor = state === 'go' ? 'bg-green-500/20 border-green-500/40' : state === 'ready' ? 'bg-red-500/10 border-red-500/30' : 'bg-secondary';

  return (
    <div className="space-y-4">
      {best && <p className="text-sm text-muted-foreground">Best: <span className="font-bold text-primary">{best}ms</span></p>}
      <button
        onClick={handleClick}
        className={`w-full h-48 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${bgColor}`}
      >
        {state === 'waiting' && <p className="text-foreground font-medium">Click to start</p>}
        {state === 'ready' && <p className="text-red-500 font-medium text-lg">Wait for green...</p>}
        {state === 'go' && <p className="text-green-600 font-bold text-2xl">CLICK NOW!</p>}
        {state === 'result' && (
          <>
            <p className="text-primary font-bold text-3xl">{reactionTime}ms</p>
            <p className="text-muted-foreground text-sm mt-1">Click to try again</p>
          </>
        )}
        {state === 'early' && (
          <>
            <p className="text-red-500 font-medium">Too early!</p>
            <p className="text-muted-foreground text-sm mt-1">Click to try again</p>
          </>
        )}
      </button>
    </div>
  );
};

// ========== Word Scramble Game ==========
const positiveWords = ['GRATITUDE', 'PEACEFUL', 'SERENITY', 'JOYFUL', 'KINDNESS', 'HARMONY', 'COURAGE', 'BLOSSOM', 'TRANQUIL', 'RADIANT'];

const WordScrambleGame = () => {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const newWord = useCallback(() => {
    const w = positiveWords[Math.floor(Math.random() * positiveWords.length)];
    setWord(w);
    setScrambled(w.split('').sort(() => Math.random() - 0.5).join(''));
    setGuess('');
    setFeedback(null);
  }, []);

  useEffect(() => { newWord(); }, [newWord]);

  const checkGuess = () => {
    if (guess.toUpperCase() === word) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(newWord, 1000);
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Score: <span className="font-bold text-foreground">{score}</span></p>
      <div className="text-center py-6">
        <p className="text-3xl font-bold tracking-[0.3em] text-primary">{scrambled}</p>
        <p className="text-xs text-muted-foreground mt-2">Unscramble this positive word</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => { setGuess(e.target.value); setFeedback(null); }}
          onKeyDown={(e) => e.key === 'Enter' && checkGuess()}
          placeholder="Your guess..."
          className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button size="sm" onClick={checkGuess}>Check</Button>
      </div>
      {feedback === 'correct' && <p className="text-green-500 text-sm font-medium text-center">✨ Correct!</p>}
      {feedback === 'wrong' && <p className="text-red-500 text-sm text-center">Try again!</p>}
      <Button size="sm" variant="ghost" onClick={newWord} className="w-full">Skip word</Button>
    </div>
  );
};

// ========== Breathing Count Game ==========
const BreathingCountGame = () => {
  const [target, setTarget] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');

  const startGame = () => {
    const t = 5 + Math.floor(Math.random() * 11); // 5-15
    setTarget(t);
    setCount(0);
    setPhase('playing');
  };

  const breathe = () => {
    const next = count + 1;
    setCount(next);
    if (next >= target) setPhase('done');
  };

  return (
    <div className="space-y-4 text-center">
      {phase === 'idle' && (
        <>
          <p className="text-muted-foreground text-sm">Take slow, deep breaths. Count each one.</p>
          <Button onClick={startGame}>Start</Button>
        </>
      )}
      {phase === 'playing' && (
        <>
          <p className="text-muted-foreground text-sm">Take <span className="font-bold text-primary">{target}</span> deep breaths</p>
          <button
            onClick={breathe}
            className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto text-4xl font-bold text-primary hover:scale-105 transition-transform active:scale-95"
          >
            {count}
          </button>
          <p className="text-xs text-muted-foreground">Tap after each breath</p>
        </>
      )}
      {phase === 'done' && (
        <>
          <div className="py-4">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">Great job! {target} mindful breaths 🌿</p>
          </div>
          <Button variant="outline" onClick={startGame}><RotateCcw className="w-3 h-3 mr-1" /> Again</Button>
        </>
      )}
    </div>
  );
};

// ========== Game Definitions ==========
const gameComponents: Record<string, { title: string; description: string; emoji: string; component: React.FC }> = {
  'memory': { title: 'Memory Match', description: 'Find matching pairs to train focus', emoji: '🧠', component: MemoryGame },
  'reaction': { title: 'Reaction Time', description: 'Test your reflexes and stay sharp', emoji: '⚡', component: ReactionGame },
  'wordscramble': { title: 'Word Scramble', description: 'Unscramble positive words', emoji: '📝', component: WordScrambleGame },
  'breathing-count': { title: 'Mindful Breathing', description: 'Count your breaths mindfully', emoji: '🧘', component: BreathingCountGame },
};

const Games = () => {
  const { user } = useAuth();
  const [latestMood, setLatestMood] = useState<MoodType | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMood = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('mood_entries')
        .select('mood')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data?.[0]) setLatestMood(data[0].mood as MoodType);
      setLoading(false);
    };
    fetchMood();
  }, [user]);

  const mood = latestMood || 'neutral';
  const config = moodConfig[mood];
  const recommendedGames = config.games;
  const MoodIcon = config.icon;

  if (activeGame) {
    const game = gameComponents[activeGame];
    const GameComponent = game.component;
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActiveGame(null)}>← Back</Button>
            <h1 className="text-2xl font-bold text-foreground">{game.emoji} {game.title}</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <GameComponent />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mood <span className="text-gradient-primary">Games</span>
          </h1>
          <p className="text-muted-foreground">Interactive games tailored to how you're feeling</p>
        </div>

        {/* Current mood indicator */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-primary/20">
          <CardContent className="py-4 flex items-center gap-3">
            <MoodIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {loading ? 'Detecting your mood...' : `You're feeling ${config.label.toLowerCase()}`}
              </p>
              <p className="text-xs text-muted-foreground">Games recommended based on your latest mood</p>
            </div>
          </CardContent>
        </Card>

        {/* Recommended games */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recommended for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedGames.map(gameId => {
              const game = gameComponents[gameId];
              return (
                <Card
                  key={gameId}
                  className="cursor-pointer hover:scale-[1.02] transition-all hover:shadow-lg"
                  onClick={() => setActiveGame(gameId)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-xl">{game.emoji}</span> {game.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="text-xs">{game.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* All games */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">All Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(gameComponents).map(([id, game]) => (
              <Card
                key={id}
                className="cursor-pointer hover:scale-[1.02] transition-all hover:shadow-lg"
                onClick={() => setActiveGame(id)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-xl">{game.emoji}</span> {game.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription className="text-xs">{game.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Games;
