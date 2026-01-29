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

  const checkAndAwardAchievements = async (userId: string, type: string, value: number) => {
    const achievements: { name: string; threshold: number }[] = [];

    if (type === 'mood_streak') {
      if (value >= 3) achievements.push({ name: 'Getting Started', threshold: 3 });
      if (value >= 7) achievements.push({ name: 'Week Warrior', threshold: 7 });
      if (value >= 30) achievements.push({ name: 'Consistency King', threshold: 30 });
    }

    if (type === 'journal_streak') {
      if (value >= 3) achievements.push({ name: 'Aspiring Writer', threshold: 3 });
      if (value >= 7) achievements.push({ name: 'Consistent Writer', threshold: 7 });
    }

    for (const achievement of achievements) {
      // Check if already earned
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_name', achievement.name)
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_type: type,
          achievement_name: achievement.name,
          metadata: { threshold: achievement.threshold }
        });
      }
    }
  };

  const checkTotalAchievements = async () => {
    if (!user) return;

    // Check total moods
    const { count: moodCount } = await supabase
      .from('mood_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (moodCount && moodCount >= 20) {
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_name', 'Self-Aware')
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_type: 'total_moods',
          achievement_name: 'Self-Aware',
        });
      }
    }

    // Check total journals
    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (journalCount && journalCount >= 10) {
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_name', 'Introspective')
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_type: 'total_journals',
          achievement_name: 'Introspective',
        });
      }
    }

    // Check calm moods
    const { count: calmCount } = await supabase
      .from('mood_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('mood', 'calm');

    if (calmCount && calmCount >= 5) {
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_name', 'Calm Mind')
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_type: 'mood_count',
          achievement_name: 'Calm Mind',
        });
      }
    }
  };

  return {
    updateMoodStreak,
    updateJournalStreak,
    checkTotalAchievements,
  };
};
