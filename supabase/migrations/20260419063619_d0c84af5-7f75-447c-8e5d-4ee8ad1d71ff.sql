
-- Make journal-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'journal-photos';

-- Drop any overly broad SELECT policies on journal-photos
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (qual ILIKE '%journal-photos%' OR with_check ILIKE '%journal-photos%')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Owner-only SELECT policy
CREATE POLICY "Users can view their own journal photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
