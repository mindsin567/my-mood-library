
-- Explicit deny policies so scanners can see write access is closed.
-- The award_achievement() SECURITY DEFINER function bypasses these and
-- remains the only path to grant an achievement.
CREATE POLICY "No direct inserts on achievements"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct updates on achievements"
ON public.user_achievements
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct deletes on achievements"
ON public.user_achievements
FOR DELETE
TO authenticated
USING (false);
