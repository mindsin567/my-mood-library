import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon, Image as ImageIcon, X, Sparkles, Tag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStreaks } from '@/hooks/useStreaks';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
const moods = [
    { type: 'happy', icon: Smile, label: '😊', color: 'text-yellow-500' },
    { type: 'excited', icon: Zap, label: '⚡', color: 'text-orange-500' },
    { type: 'calm', icon: Heart, label: '💚', color: 'text-green-500' },
    { type: 'neutral', icon: Meh, label: '😐', color: 'text-gray-500' },
    { type: 'tired', icon: Moon, label: '😴', color: 'text-indigo-500' },
    { type: 'anxious', icon: Cloud, label: '😰', color: 'text-purple-500' },
    { type: 'sad', icon: Frown, label: '😢', color: 'text-blue-500' },
    { type: 'angry', icon: Flame, label: '😠', color: 'text-red-500' },
];
const moodEmojis = {
    happy: '😊',
    excited: '⚡',
    calm: '💚',
    neutral: '😐',
    tired: '😴',
    anxious: '😰',
    sad: '😢',
    angry: '😠',
};
const Library = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { updateJournalStreak, checkTotalAchievements } = useStreaks();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('neutral');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiReflection, setAiReflection] = useState(null);
    const [emotionTags, setEmotionTags] = useState([]);
    const [signedPhotoUrls, setSignedPhotoUrls] = useState({});
    // Extract the storage path from either a stored path or a legacy public URL
    const getStoragePath = (value) => {
        if (!value)
            return null;
        if (value.includes('/journal-photos/')) {
            return value.split('/journal-photos/')[1] || null;
        }
        // Already a path like "<user_id>/<file>"
        return value;
    };
    const fetchEntries = async () => {
        if (!user)
            return;
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) {
            toast({ title: 'Error', description: 'Failed to load entries.', variant: 'destructive' });
        }
        else {
            const list = data || [];
            setEntries(list);
            // Resolve signed URLs for any entries with photos
            const urlMap = {};
            await Promise.all(list
                .filter((e) => e.photo_url)
                .map(async (e) => {
                const path = getStoragePath(e.photo_url);
                if (!path)
                    return;
                const { data: signed } = await supabase.storage
                    .from('journal-photos')
                    .createSignedUrl(path, 3600);
                if (signed?.signedUrl)
                    urlMap[e.id] = signed.signedUrl;
            }));
            setSignedPhotoUrls(urlMap);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchEntries();
    }, [user]);
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };
    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };
    const analyzeJournal = async () => {
        if (!content.trim() || content.length < 20)
            return;
        setIsAnalyzing(true);
        try {
            const response = await supabase.functions.invoke('ai-chat', {
                body: {
                    type: 'analyze_journal',
                    journalContent: content,
                }
            });
            if (response.error)
                throw response.error;
            setEmotionTags(response.data.emotion_tags || []);
            setAiReflection(response.data.reflection_questions || null);
        }
        catch (error) {
            console.error('Analysis error:', error);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const handleSave = async () => {
        if (!content.trim() || !user)
            return;
        setIsSaving(true);
        let photoPath = null;
        try {
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const filePath = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('journal-photos')
                    .upload(filePath, photoFile);
                if (uploadError)
                    throw uploadError;
                // Store the storage path; signed URLs are generated on read
                photoPath = filePath;
            }
            const { error } = await supabase.from('journal_entries').insert({
                user_id: user.id,
                title: title.trim() || null,
                content: content.trim(),
                mood: selectedMood,
                photo_url: photoPath,
                emotion_tags: emotionTags,
                ai_reflection: aiReflection,
            });
            if (error)
                throw error;
            // Update streaks and check achievements
            await updateJournalStreak();
            await checkTotalAchievements();
            toast({ title: 'Success!', description: 'Journal entry saved.' });
            setTitle('');
            setContent('');
            setSelectedMood('neutral');
            setPhotoFile(null);
            setPhotoPreview(null);
            setEmotionTags([]);
            setAiReflection(null);
            setIsDialogOpen(false);
            fetchEntries();
        }
        catch {
            toast({ title: 'Error', description: 'Failed to save entry.', variant: 'destructive' });
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async (id, photoUrl) => {
        try {
            if (photoUrl && user) {
                const path = getStoragePath(photoUrl);
                if (path) {
                    await supabase.storage.from('journal-photos').remove([path]);
                }
            }
            const { error } = await supabase.from('journal_entries').delete().eq('id', id);
            if (error)
                throw error;
            setEntries(entries.filter(e => e.id !== id));
            toast({ title: 'Deleted', description: 'Entry removed.' });
        }
        catch {
            toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
        }
    };
    if (loading) {
        return (<DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Digital <span className="text-gradient-primary">Library</span>
            </h1>
            <p className="text-muted-foreground">Write your daily story with emojis expressing your mood.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4"/>
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Write Your Story</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)}/>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (<button key={m.type} onClick={() => setSelectedMood(m.type)} className={`text-2xl p-2 rounded-lg transition-all ${selectedMood === m.type
                ? 'bg-primary/20 ring-2 ring-primary scale-110'
                : 'hover:bg-secondary'}`}>
                        {m.label}
                      </button>))}
                  </div>
                </div>

                <div>
                  <Textarea placeholder="Write about your day..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[150px]"/>
                  {content.length >= 20 && (<Button type="button" variant="outline" size="sm" onClick={analyzeJournal} disabled={isAnalyzing} className="mt-2 gap-2">
                      {isAnalyzing ? (<Loader2 className="w-4 h-4 animate-spin"/>) : (<Sparkles className="w-4 h-4"/>)}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Emotions'}
                    </Button>)}
                </div>

                {/* AI Emotion Tags */}
                {emotionTags.length > 0 && (<div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4"/>
                      Detected Emotions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {emotionTags.map((tag) => (<Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>))}
                    </div>
                  </div>)}

                {/* AI Reflection Questions */}
                {aiReflection && (<div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary"/>
                      Reflection Questions
                    </label>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {aiReflection}
                    </p>
                  </div>)}

                <div>
                  {photoPreview ? (<div className="relative inline-block">
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg"/>
                      <button onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>) : (<label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-secondary transition-colors">
                      <ImageIcon className="w-4 h-4"/>
                      <span className="text-sm">Add Photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden"/>
                    </label>)}
                </div>

                <Button onClick={handleSave} disabled={!content.trim() || isSaving} className="w-full">
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {entries.length === 0 ? (<Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No journal entries yet. Start writing your story!</p>
            </CardContent>
          </Card>) : (<div className="space-y-4">
            {entries.map((entry) => (<Card key={entry.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                      <CardTitle className="text-lg">{entry.title || 'Untitled'}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id, entry.photo_url)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 text-destructive"/>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
                  {entry.emotion_tags && entry.emotion_tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-3">
                      {entry.emotion_tags.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>))}
                    </div>)}
                  {entry.ai_reflection && (<div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3"/> Reflection Questions
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {entry.ai_reflection}
                      </p>
                    </div>)}
                  {entry.photo_url && signedPhotoUrls[entry.id] && (<img src={signedPhotoUrls[entry.id]} alt="Journal photo" className="mt-4 rounded-lg max-h-64 object-cover"/>)}
                </CardContent>
              </Card>))}
          </div>)}
      </div>
    </DashboardLayout>);
};
export default Library;
