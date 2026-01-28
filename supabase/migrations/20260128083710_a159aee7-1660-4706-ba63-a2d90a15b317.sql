-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create journal_entries table for Digital Library
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood mood_type NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
ON public.journal_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
ON public.journal_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON public.journal_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON public.journal_entries FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on journal_entries
CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for avatars and journal photos
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-photos', 'journal-photos', true);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for journal-photos bucket
CREATE POLICY "Journal photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-photos');

CREATE POLICY "Users can upload their own journal photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own journal photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own journal photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);