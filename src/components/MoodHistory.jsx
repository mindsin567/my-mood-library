import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
const moodConfig = {
    happy: { icon: Smile, color: 'text-yellow-500 bg-yellow-50', label: 'Happy' },
    excited: { icon: Zap, color: 'text-orange-500 bg-orange-50', label: 'Excited' },
    calm: { icon: Heart, color: 'text-green-500 bg-green-50', label: 'Calm' },
    neutral: { icon: Meh, color: 'text-gray-500 bg-gray-50', label: 'Neutral' },
    tired: { icon: Moon, color: 'text-indigo-500 bg-indigo-50', label: 'Tired' },
    anxious: { icon: Cloud, color: 'text-purple-500 bg-purple-50', label: 'Anxious' },
    sad: { icon: Frown, color: 'text-blue-500 bg-blue-50', label: 'Sad' },
    angry: { icon: Flame, color: 'text-red-500 bg-red-50', label: 'Angry' },
};
const MoodHistory = ({ refreshTrigger }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();
    const fetchEntries = async () => {
        if (!user)
            return;
        try {
            const { data, error } = await supabase
                .from('mood_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error)
                throw error;
            setEntries(data || []);
        }
        catch {
            toast({
                title: 'Error',
                description: 'Failed to load mood history.',
                variant: 'destructive'
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchEntries();
    }, [user, refreshTrigger]);
    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('mood_entries')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            setEntries(entries.filter(e => e.id !== id));
            toast({
                title: 'Entry deleted',
                description: 'Mood entry has been removed.'
            });
        }
        catch {
            toast({
                title: 'Error',
                description: 'Failed to delete entry.',
                variant: 'destructive'
            });
        }
    };
    if (loading) {
        return (<div className="card-feature">
        <h3 className="text-xl font-semibold text-foreground mb-4">Your Mood Library</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>);
    }
    return (<div className="card-feature">
      <h3 className="text-xl font-semibold text-foreground mb-4">Your Mood Library</h3>
      
      {entries.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
          <p>No mood entries yet. Start tracking how you feel!</p>
        </div>) : (<div className="space-y-3">
          {entries.map((entry) => {
                const config = moodConfig[entry.mood];
                const Icon = config.icon;
                return (<div key={entry.id} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-6 h-6"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{config.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  {entry.note && (<p className="text-sm text-muted-foreground line-clamp-2">{entry.note}</p>)}
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive"/>
                </Button>
              </div>);
            })}
        </div>)}
    </div>);
};
export default MoodHistory;
