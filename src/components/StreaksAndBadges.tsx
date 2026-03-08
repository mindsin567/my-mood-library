import { useState, useEffect } from 'react';
import { Flame, Award, Trophy, Star, Brain, BookOpen, Heart, Sparkles, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShareCard from '@/components/ShareCard';

interface Streak {
  current_mood_streak: number;
  longest_mood_streak: number;
  current_journal_streak: number;
  longest_journal_streak: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  earned_at: string;
}

const achievementDefinitions = [
  { 
    id: 'mood_streak_3', 
    name: 'Getting Started', 
    description: 'Log mood 3 days in a row',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    threshold: 3,
    type: 'mood_streak'
  },
  { 
    id: 'mood_streak_7', 
    name: 'Week Warrior', 
    description: 'Log mood 7 days in a row',
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    threshold: 7,
    type: 'mood_streak'
  },
  { 
    id: 'mood_streak_30', 
    name: 'Consistency King', 
    description: 'Log mood 30 days in a row',
    icon: Award,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    threshold: 30,
    type: 'mood_streak'
  },
  { 
    id: 'journal_streak_3', 
    name: 'Aspiring Writer', 
    description: 'Journal 3 days in a row',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    threshold: 3,
    type: 'journal_streak'
  },
  { 
    id: 'journal_streak_7', 
    name: 'Consistent Writer', 
    description: 'Journal 7 days in a row',
    icon: Star,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    threshold: 7,
    type: 'journal_streak'
  },
  { 
    id: 'calm_mind', 
    name: 'Calm Mind', 
    description: 'Log 5 calm moods',
    icon: Brain,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    threshold: 5,
    type: 'mood_count'
  },
  { 
    id: 'self_aware', 
    name: 'Self-Aware', 
    description: 'Log 20 total moods',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    threshold: 20,
    type: 'total_moods'
  },
  { 
    id: 'introspective', 
    name: 'Introspective', 
    description: 'Write 10 journal entries',
    icon: Sparkles,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    threshold: 10,
    type: 'total_journals'
  },
  { 
    id: 'goal_setter', 
    name: 'Goal Setter', 
    description: 'Complete your profile',
    icon: Target,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    threshold: 1,
    type: 'profile_complete'
  },
];

const StreaksAndBadges = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streak | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [streaksRes, achievementsRes] = await Promise.all([
        supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false }),
      ]);

      if (streaksRes.data) {
        setStreaks(streaksRes.data);
      }
      if (achievementsRes.data) {
        setEarnedAchievements(achievementsRes.data);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const isAchievementEarned = (achievementName: string) => {
    return earnedAchievements.some(a => a.achievement_name === achievementName);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading achievements...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Mood Logging</span>
              </div>
              <div className="text-3xl font-bold text-orange-500">
                {streaks?.current_mood_streak || 0}
                <span className="text-lg ml-1">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Best: {streaks?.longest_mood_streak || 0} days
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Journaling</span>
              </div>
              <div className="text-3xl font-bold text-blue-500">
                {streaks?.current_journal_streak || 0}
                <span className="text-lg ml-1">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Best: {streaks?.longest_journal_streak || 0} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
            <Badge variant="secondary" className="ml-2">
              {earnedAchievements.length}/{achievementDefinitions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievementDefinitions.map((achievement) => {
              const earned = isAchievementEarned(achievement.name);
              const Icon = achievement.icon;
              
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl border transition-all ${
                    earned 
                      ? `${achievement.bgColor} border-transparent shadow-sm` 
                      : 'bg-secondary/30 border-border opacity-50 grayscale'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${earned ? achievement.color : 'text-muted-foreground'}`} />
                    <span className={`font-medium text-sm ${earned ? '' : 'text-muted-foreground'}`}>
                      {achievement.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                  {earned && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      ✓ Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreaksAndBadges;
