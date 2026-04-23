import { useState } from 'react';
import { Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client.js';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStreaks } from '@/hooks/useStreaks';
const moods = [
    { type: 'happy', icon: Smile, label: 'Happy', color: 'text-yellow-500' },
    { type: 'excited', icon: Zap, label: 'Excited', color: 'text-orange-500' },
    { type: 'calm', icon: Heart, label: 'Calm', color: 'text-green-500' },
    { type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gray-500' },
    { type: 'tired', icon: Moon, label: 'Tired', color: 'text-indigo-500' },
    { type: 'anxious', icon: Cloud, label: 'Anxious', color: 'text-purple-500' },
    { type: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-500' },
    { type: 'angry', icon: Flame, label: 'Angry', color: 'text-red-500' },
];
const MoodPicker = ({ onMoodSaved }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const { updateMoodStreak, checkTotalAchievements } = useStreaks();
    const handleSaveMood = async () => {
        if (!selectedMood || !user)
            return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from('mood_entries').insert({
                user_id: user.id,
                mood: selectedMood,
                note: note.trim() || null
            });
            if (error)
                throw error;
            // Update streaks and check achievements
            await updateMoodStreak();
            await checkTotalAchievements();
            toast({
                title: 'Mood saved!',
                description: 'Your mood has been recorded successfully.'
            });
            setSelectedMood(null);
            setNote('');
            onMoodSaved();
        }
        catch {
            toast({
                title: 'Error',
                description: 'Failed to save your mood. Please try again.',
                variant: 'destructive'
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="card-feature">
      <h3 className="text-xl font-semibold text-foreground mb-4">How are you feeling?</h3>
      
      <div className="grid grid-cols-4 gap-3 mb-6">
        {moods.map(({ type, icon: Icon, label, color }) => (<button key={type} onClick={() => setSelectedMood(type)} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${selectedMood === type
                ? 'bg-primary/10 ring-2 ring-primary'
                : 'bg-secondary/50 hover:bg-secondary'}`}>
            <Icon className={`w-8 h-8 ${color}`}/>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>))}
      </div>

      {selectedMood && (<div className="space-y-4 animate-fade-in">
          <Textarea placeholder="Add a note about how you're feeling... (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[100px] resize-none"/>
          
          <Button onClick={handleSaveMood} variant="hero" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Mood Entry'}
          </Button>
        </div>)}
    </div>);
};
export default MoodPicker;
