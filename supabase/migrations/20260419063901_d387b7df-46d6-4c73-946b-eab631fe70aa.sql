
-- Remove the public INSERT policy that lets users fabricate achievements
DROP POLICY IF EXISTS "Users can create their own achievements" ON public.user_achievements;

-- SECURITY DEFINER function: only awards badges the user has actually earned
CREATE OR REPLACE FUNCTION public.award_achievement(_achievement_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  ach_type text;
  threshold int;
  qualifies boolean := false;
  current_mood_streak_v int;
  current_journal_streak_v int;
  total_moods int;
  total_journals int;
  calm_moods int;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Map allowed achievements to their type and verification rule
  CASE _achievement_name
    WHEN 'Getting Started'    THEN ach_type := 'mood_streak';    threshold := 3;
    WHEN 'Week Warrior'       THEN ach_type := 'mood_streak';    threshold := 7;
    WHEN 'Consistency King'   THEN ach_type := 'mood_streak';    threshold := 30;
    WHEN 'Aspiring Writer'    THEN ach_type := 'journal_streak'; threshold := 3;
    WHEN 'Consistent Writer'  THEN ach_type := 'journal_streak'; threshold := 7;
    WHEN 'Self-Aware'         THEN ach_type := 'total_moods';    threshold := 20;
    WHEN 'Introspective'      THEN ach_type := 'total_journals'; threshold := 10;
    WHEN 'Calm Mind'          THEN ach_type := 'mood_count';     threshold := 5;
    ELSE
      RAISE EXCEPTION 'Unknown achievement';
  END CASE;

  -- Verify the user actually qualifies, based on real data
  IF ach_type = 'mood_streak' THEN
    SELECT COALESCE(current_mood_streak, 0) INTO current_mood_streak_v
      FROM public.user_streaks WHERE user_id = uid;
    qualifies := COALESCE(current_mood_streak_v, 0) >= threshold;
  ELSIF ach_type = 'journal_streak' THEN
    SELECT COALESCE(current_journal_streak, 0) INTO current_journal_streak_v
      FROM public.user_streaks WHERE user_id = uid;
    qualifies := COALESCE(current_journal_streak_v, 0) >= threshold;
  ELSIF ach_type = 'total_moods' THEN
    SELECT COUNT(*) INTO total_moods FROM public.mood_entries WHERE user_id = uid;
    qualifies := total_moods >= threshold;
  ELSIF ach_type = 'total_journals' THEN
    SELECT COUNT(*) INTO total_journals FROM public.journal_entries WHERE user_id = uid;
    qualifies := total_journals >= threshold;
  ELSIF ach_type = 'mood_count' THEN
    SELECT COUNT(*) INTO calm_moods
      FROM public.mood_entries WHERE user_id = uid AND mood = 'calm';
    qualifies := calm_moods >= threshold;
  END IF;

  IF NOT qualifies THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, metadata)
  VALUES (uid, ach_type, _achievement_name, jsonb_build_object('threshold', threshold))
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.award_achievement(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_achievement(text) TO authenticated;
