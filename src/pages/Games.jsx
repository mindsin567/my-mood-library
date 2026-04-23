import { useState, useEffect } from 'react';
import { Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MemoryGame from '@/components/games/MemoryGame';
import ReactionGame from '@/components/games/ReactionGame';
import WordScrambleGame from '@/components/games/WordScrambleGame';
import BreathingCountGame from '@/components/games/BreathingCountGame';
import ColorMatchGame from '@/components/games/ColorMatchGame';
import PatternGame from '@/components/games/PatternGame';
import GratitudeGame from '@/components/games/GratitudeGame';
import EmotionQuizGame from '@/components/games/EmotionQuizGame';
const moodConfig = {
    happy: { icon: Smile, label: 'Happy', games: ['memory', 'color-match', 'wordscramble'] },
    excited: { icon: Zap, label: 'Excited', games: ['reaction', 'color-match', 'pattern'] },
    calm: { icon: Heart, label: 'Calm', games: ['gratitude', 'wordscramble', 'breathing-count'] },
    neutral: { icon: Meh, label: 'Neutral', games: ['memory', 'emotion-quiz', 'pattern'] },
    tired: { icon: Moon, label: 'Tired', games: ['breathing-count', 'gratitude', 'wordscramble'] },
    anxious: { icon: Cloud, label: 'Anxious', games: ['breathing-count', 'gratitude', 'emotion-quiz'] },
    sad: { icon: Frown, label: 'Sad', games: ['gratitude', 'memory', 'wordscramble'] },
    angry: { icon: Flame, label: 'Angry', games: ['breathing-count', 'emotion-quiz', 'reaction'] },
};
const gameComponents = {
    'memory': { title: 'Memory Match', description: 'Find matching pairs to train focus', emoji: '🧠', component: MemoryGame },
    'reaction': { title: 'Reaction Time', description: 'Test your reflexes and stay sharp', emoji: '⚡', component: ReactionGame },
    'wordscramble': { title: 'Word Scramble', description: 'Unscramble positive words', emoji: '📝', component: WordScrambleGame },
    'breathing-count': { title: 'Mindful Breathing', description: 'Count your breaths mindfully', emoji: '🧘', component: BreathingCountGame },
    'color-match': { title: 'Color Match', description: 'Match colors quickly for focus', emoji: '🎨', component: ColorMatchGame },
    'pattern': { title: 'Pattern Finder', description: 'Spot the missing piece in patterns', emoji: '🧩', component: PatternGame },
    'gratitude': { title: 'Gratitude Journal', description: 'List things you are grateful for', emoji: '💛', component: GratitudeGame },
    'emotion-quiz': { title: 'Emotion Quiz', description: 'Test your emotional intelligence', emoji: '🧠', component: EmotionQuizGame },
};
const Games = () => {
    const { user } = useAuth();
    const [latestMood, setLatestMood] = useState(null);
    const [activeGame, setActiveGame] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchMood = async () => {
            if (!user)
                return;
            const { data } = await supabase
                .from('mood_entries')
                .select('mood')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);
            if (data?.[0])
                setLatestMood(data[0].mood);
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
        return (<DashboardLayout>
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
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mood <span className="text-gradient-primary">Games</span>
          </h1>
          <p className="text-muted-foreground">Interactive games tailored to how you're feeling</p>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-primary/20">
          <CardContent className="py-4 flex items-center gap-3">
            <MoodIcon className="w-6 h-6 text-primary"/>
            <div>
              <p className="text-sm font-medium text-foreground">
                {loading ? 'Detecting your mood...' : `You're feeling ${config.label.toLowerCase()}`}
              </p>
              <p className="text-xs text-muted-foreground">Games recommended based on your latest mood</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recommended for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedGames.map(gameId => {
            const game = gameComponents[gameId];
            return (<Card key={gameId} className="cursor-pointer hover:scale-[1.02] transition-all hover:shadow-lg" onClick={() => setActiveGame(gameId)}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-xl">{game.emoji}</span> {game.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="text-xs">{game.description}</CardDescription>
                  </CardContent>
                </Card>);
        })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">All Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(gameComponents).map(([id, game]) => (<Card key={id} className="cursor-pointer hover:scale-[1.02] transition-all hover:shadow-lg" onClick={() => setActiveGame(id)}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-xl">{game.emoji}</span> {game.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription className="text-xs">{game.description}</CardDescription>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </div>
    </DashboardLayout>);
};
export default Games;
