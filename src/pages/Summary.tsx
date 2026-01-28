import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Lightbulb, Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

type MoodType = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry' | 'excited' | 'tired';

const moodConfig: Record<MoodType, { icon: typeof Smile; color: string; bgColor: string; label: string }> = {
  happy: { icon: Smile, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', label: 'Happy' },
  excited: { icon: Zap, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Excited' },
  calm: { icon: Heart, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Calm' },
  neutral: { icon: Meh, color: 'text-gray-500', bgColor: 'bg-gray-500/10', label: 'Neutral' },
  tired: { icon: Moon, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', label: 'Tired' },
  anxious: { icon: Cloud, color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Anxious' },
  sad: { icon: Frown, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Sad' },
  angry: { icon: Flame, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Angry' },
};

interface MoodEntry {
  mood: MoodType;
  note: string | null;
  created_at: string;
}

interface JournalEntry {
  content: string;
  mood: MoodType;
  created_at: string;
}

const Summary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [moodStats, setMoodStats] = useState<Record<MoodType, number>>({} as Record<MoodType, number>);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchWeeklyData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    const weekAgo = subDays(new Date(), 7);

    const [moodsRes, journalsRes] = await Promise.all([
      supabase
        .from('mood_entries')
        .select('mood, note, created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('journal_entries')
        .select('content, mood, created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false }),
    ]);

    // Calculate mood statistics
    const stats: Record<MoodType, number> = {} as Record<MoodType, number>;
    if (moodsRes.data) {
      moodsRes.data.forEach((entry: MoodEntry) => {
        stats[entry.mood] = (stats[entry.mood] || 0) + 1;
      });
    }
    setMoodStats(stats);
    setDataLoading(false);

    return { moods: moodsRes.data || [], journals: journalsRes.data || [] };
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  const generateSummary = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await fetchWeeklyData();
      if (!data) return;

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          type: 'summary',
          moods: data.moods,
          journals: data.journals
        }
      });

      if (response.error) throw response.error;

      setSummary(response.data.summary || 'No data available for summary.');
      setSuggestions(response.data.suggestions || 'Keep tracking your mood!');
    } catch (error) {
      console.error('Summary error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate summary.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalMoods = Object.values(moodStats).reduce((a, b) => a + b, 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI <span className="text-gradient-primary">Summary</span>
            </h1>
            <p className="text-muted-foreground">
              Weekly insights and personalized suggestions.
            </p>
          </div>
          <Button onClick={generateSummary} disabled={isLoading} variant="hero" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </div>

        {/* Mood Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              This Week's Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : totalMoods === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No mood entries this week. Start tracking!
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {Object.entries(moodConfig).map(([mood, config]) => {
                  const count = moodStats[mood as MoodType] || 0;
                  const percentage = totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0;
                  const Icon = config.icon;
                  
                  return (
                    <div key={mood} className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${config.bgColor}`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="mt-2 text-sm font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Click "Generate Summary" to get AI-powered insights about your week.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{suggestions}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Personalized wellness suggestions will appear here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Summary;
