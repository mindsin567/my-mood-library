import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useStreaks = () => {
  const { user } = useAuth();

  const updateMoodStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get current streak data
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingStreak) {
      // Create new streak record
      await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_mood_streak: 1,
        longest_mood_streak: 1,
        last_mood_date: today,
      });
      await checkAndAwardAchievements(user.id, 'mood_streak', 1);
      return;
    }

    // Already logged today
    if (existingStreak.last_mood_date === today) {
      return;
    }

    let newStreak = 1;
    if (existingStreak.last_mood_date === yesterday) {
      newStreak = existingStreak.current_mood_streak + 1;
    }

    const longestStreak = Math.max(newStreak, existingStreak.longest_mood_streak || 0);

    await supabase
      .from('user_streaks')
      .update({
        current_mood_streak: newStreak,
        longest_mood_streak: longestStreak,
        last_mood_date: today,
      })
      .eq('user_id', user.id);

    await checkAndAwardAchievements(user.id, 'mood_streak', newStreak);
  };

  const updateJournalStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingStreak) {
      await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_journal_streak: 1,
        longest_journal_streak: 1,
        last_journal_date: today,
      });
      await checkAndAwardAchievements(user.id, 'journal_streak', 1);
      return;
    }

    if (existingStreak.last_journal_date === today) {
      return;
    }

    let newStreak = 1;
    if (existingStreak.last_journal_date === yesterday) {
      newStreak = existingStreak.current_journal_streak + 1;
    }

    const longestStreak = Math.max(newStreak, existingStreak.longest_journal_streak || 0);

    await supabase
      .from('user_streaks')
      .update({
        current_journal_streak: newStreak,
        longest_journal_streak: longestStreak,
        last_journal_date: today,
      })
      .eq('user_id', user.id);

    await checkAndAwardAchievements(user.id, 'journal_streak', newStreak);
  };

  const awardIfEarned = async (name: string) => {
    // Server-side function verifies the user actually qualifies before inserting
    await supabase.rpc('award_achievement', { _achievement_name: name });
  };

  const checkAndAwardAchievements = async (_userId: string, type: string, value: number) => {
    const candidates: string[] = [];

    if (type === 'mood_streak') {
      if (value >= 3) candidates.push('Getting Started');
      if (value >= 7) candidates.push('Week Warrior');
      if (value >= 30) candidates.push('Consistency King');
    }

    if (type === 'journal_streak') {
      if (value >= 3) candidates.push('Aspiring Writer');
      if (value >= 7) candidates.push('Consistent Writer');
    }

    for (const name of candidates) {
      await awardIfEarned(name);
    }
  };

  const checkTotalAchievements = async () => {
    if (!user) return;
    // The server function checks the real counts; we can just attempt all eligible badges
    await Promise.all([
      awardIfEarned('Self-Aware'),
      awardIfEarned('Introspective'),
      awardIfEarned('Calm Mind'),
    ]);
  };

  return {
    updateMoodStreak,
    updateJournalStreak,
    checkTotalAchievements,
  };
};
