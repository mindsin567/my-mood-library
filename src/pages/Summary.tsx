import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Lightbulb, Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon } from 'lucide-react';
import { subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import MoodAnalytics from '@/components/MoodAnalytics';
import StreaksAndBadges from '@/components/StreaksAndBadges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';

type MoodType = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry' | 'excited' | 'tired';

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
  const [allMoods, setAllMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchAllMoods = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('mood_entries')
      .select('mood, note, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setAllMoods(data);
    }
    setDataLoading(false);
  };

  const fetchWeeklyData = async () => {
    if (!user) return;
    
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

    return { moods: moodsRes.data || [], journals: journalsRes.data || [] };
  };

  useEffect(() => {
    fetchAllMoods();
  }, [user]);

  // Auto-generate summary on page load when user has data
  useEffect(() => {
    if (!user || dataLoading) return;
    if (!summary && allMoods.length > 0) {
      generateSummary();
    }
  }, [user, dataLoading, allMoods.length]);

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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI <span className="text-gradient-primary">Summary</span>
            </h1>
            <p className="text-muted-foreground">
              Weekly insights, analytics, and achievements.
            </p>
          </div>
          <Button onClick={generateSummary} disabled={isLoading} variant="hero" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Weekly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating your weekly insights...</span>
                    </div>
                  ) : summary ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No mood data yet. Start tracking to get AI-powered insights!
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
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating suggestions...</span>
                    </div>
                  ) : suggestions ? (
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {dataLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading analytics...
                </CardContent>
              </Card>
            ) : (
              <MoodAnalytics moodEntries={allMoods} />
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <StreaksAndBadges />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Summary;
