import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarHeart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client.js';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
const moodColors = {
    happy: 'bg-yellow-400',
    excited: 'bg-orange-400',
    calm: 'bg-green-400',
    neutral: 'bg-gray-400',
    tired: 'bg-indigo-400',
    anxious: 'bg-purple-400',
    sad: 'bg-blue-400',
    angry: 'bg-red-400',
};
const moodLabels = {
    happy: '😊 Happy',
    excited: '⚡ Excited',
    calm: '💚 Calm',
    neutral: '😐 Neutral',
    tired: '🌙 Tired',
    anxious: '☁️ Anxious',
    sad: '😢 Sad',
    angry: '🔥 Angry',
};
const MoodHeatmap = () => {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [moodData, setMoodData] = useState([]);
    useEffect(() => {
        const fetchMoods = async () => {
            if (!user)
                return;
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);
            const { data } = await supabase
                .from('mood_entries')
                .select('mood, created_at')
                .eq('user_id', user.id)
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString())
                .order('created_at', { ascending: false });
            if (data) {
                // Keep only the latest mood per day
                const seen = new Map();
                data.forEach((entry) => {
                    const day = format(new Date(entry.created_at), 'yyyy-MM-dd');
                    if (!seen.has(day))
                        seen.set(day, entry.mood);
                });
                setMoodData(Array.from(seen.entries()).map(([date, mood]) => ({ date, mood })));
            }
        };
        fetchMoods();
    }, [user, currentMonth]);
    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const startPadding = getDay(startOfMonth(currentMonth));
    const getMoodForDay = (day) => {
        const key = format(day, 'yyyy-MM-dd');
        return moodData.find((m) => m.date === key)?.mood ?? null;
    };
    return (<Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-primary"/>
            Mood Heatmap
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}>
              <ChevronLeft className="w-4 h-4"/>
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">{format(currentMonth, 'MMMM yyyy')}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}>
              <ChevronRight className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (<div key={d} className="text-[10px] text-muted-foreground text-center font-medium">{d}</div>))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPadding }).map((_, i) => (<div key={`pad-${i}`} className="aspect-square"/>))}
          {days.map((day) => {
            const mood = getMoodForDay(day);
            const today = isToday(day);
            return (<Tooltip key={day.toISOString()}>
                <TooltipTrigger asChild>
                  <div className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all ${mood
                    ? `${moodColors[mood]} text-white shadow-sm`
                    : 'bg-secondary/40 text-muted-foreground'} ${today ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {format(day, 'MMM d')} — {mood ? moodLabels[mood] : 'No mood logged'}
                </TooltipContent>
              </Tooltip>);
        })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
          {Object.entries(moodColors).map(([mood, color]) => (<div key={mood} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${color}`}/>
              <span className="text-[10px] text-muted-foreground capitalize">{mood}</span>
            </div>))}
        </div>
      </CardContent>
    </Card>);
};
export default MoodHeatmap;
