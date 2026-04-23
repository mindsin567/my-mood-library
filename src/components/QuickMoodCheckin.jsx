import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
const moods = [
    { type: 'happy', icon: Smile, label: 'Happy', emoji: '😊' },
    { type: 'excited', icon: Zap, label: 'Excited', emoji: '⚡' },
    { type: 'calm', icon: Heart, label: 'Calm', emoji: '💚' },
    { type: 'neutral', icon: Meh, label: 'Neutral', emoji: '😐' },
    { type: 'tired', icon: Moon, label: 'Tired', emoji: '🌙' },
    { type: 'anxious', icon: Cloud, label: 'Anxious', emoji: '☁️' },
    { type: 'sad', icon: Frown, label: 'Sad', emoji: '😢' },
    { type: 'angry', icon: Flame, label: 'Angry', emoji: '🔥' },
];
const QuickMoodCheckin = ({ onLogged }) => {
    const { user } = useAuth();
    const [selected, setSelected] = useState(null);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const handleSave = async () => {
        if (!user || !selected)
            return;
        setSaving(true);
        const { error } = await supabase.from('mood_entries').insert({
            user_id: user.id,
            mood: selected,
            note: note.trim() || null,
        });
        setSaving(false);
        if (error) {
            toast({ title: 'Error', description: 'Could not save mood.', variant: 'destructive' });
        }
        else {
            toast({ title: 'Mood logged! ✨', description: `You're feeling ${selected} today.` });
            setDone(true);
            onLogged?.();
        }
    };
    if (done) {
        return (<Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <CardContent className="py-6 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2"/>
          <p className="font-semibold text-foreground">Mood logged!</p>
          <p className="text-sm text-muted-foreground mt-1">Great job checking in with yourself today 💛</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setDone(false); setSelected(null); setNote(''); }}>
            Log another
          </Button>
        </CardContent>
      </Card>);
    }
    return (<Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary"/>
          How are you feeling right now?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {moods.map((m) => (<button key={m.type} onClick={() => setSelected(m.type)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-xs font-medium ${selected === m.type
                ? 'bg-primary/15 text-primary scale-105 shadow-sm'
                : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/70'}`}>
              <span className="text-lg">{m.emoji}</span>
              <span>{m.label}</span>
            </button>))}
        </div>
        {selected && (<div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea placeholder="Add a quick note (optional)..." value={note} onChange={(e) => setNote(e.target.value)} className="resize-none h-16 text-sm"/>
            <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
              {saving ? 'Saving...' : 'Log Mood'}
            </Button>
          </div>)}
      </CardContent>
    </Card>);
};
export default QuickMoodCheckin;
