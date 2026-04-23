import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Smile, Meh, Frown, Zap, Heart, Cloud, Flame, Moon, BookOpen, MessageCircle, BarChart3, Award } from 'lucide-react';
import ThoughtOfTheDay from '@/components/ThoughtOfTheDay';
import MoodHeatmap from '@/components/MoodHeatmap';
import QuickMoodCheckin from '@/components/QuickMoodCheckin';
import { supabase } from '@/integrations/supabase/client.js';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
const moodConfig = {
    happy: { icon: Smile, color: 'text-yellow-500', label: 'Happy' },
    excited: { icon: Zap, color: 'text-orange-500', label: 'Excited' },
    calm: { icon: Heart, color: 'text-green-500', label: 'Calm' },
    neutral: { icon: Meh, color: 'text-gray-500', label: 'Neutral' },
    tired: { icon: Moon, color: 'text-indigo-500', label: 'Tired' },
    anxious: { icon: Cloud, color: 'text-purple-500', label: 'Anxious' },
    sad: { icon: Frown, color: 'text-blue-500', label: 'Sad' },
    angry: { icon: Flame, color: 'text-red-500', label: 'Angry' },
};
const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recentMoods, setRecentMoods] = useState([]);
    const [recentJournals, setRecentJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [streaks, setStreaks] = useState(null);
    const [achievementCount, setAchievementCount] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            if (!user)
                return;
            const [moodsRes, journalsRes, profileRes, streaksRes, achievementsRes] = await Promise.all([
                supabase
                    .from('mood_entries')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('journal_entries')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('user_id', user.id)
                    .maybeSingle(),
                supabase
                    .from('user_streaks')
                    .select('current_mood_streak, current_journal_streak')
                    .eq('user_id', user.id)
                    .maybeSingle(),
                supabase
                    .from('user_achievements')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id),
            ]);
            if (moodsRes.data)
                setRecentMoods(moodsRes.data);
            if (journalsRes.data)
                setRecentJournals(journalsRes.data);
            if (profileRes.data)
                setProfile(profileRes.data);
            if (streaksRes.data)
                setStreaks(streaksRes.data);
            if (achievementsRes.count)
                setAchievementCount(achievementsRes.count);
            setLoading(false);
        };
        fetchData();
    }, [user]);
    const quickActions = [
        { title: 'Log Mood', icon: Smile, color: 'bg-yellow-500/10 text-yellow-600', path: '/mood' },
        { title: 'Write Journal', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600', path: '/library' },
        { title: 'Chat with AI', icon: MessageCircle, color: 'bg-purple-500/10 text-purple-600', path: '/chatbot' },
        { title: 'View Summary', icon: BarChart3, color: 'bg-green-500/10 text-green-600', path: '/summary' },
    ];
    if (loading) {
        return (<DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient-primary">{profile?.display_name || 'Friend'}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your emotions and reflect on your mental wellness journey.
          </p>
        </div>

        {/* Thought of the Day */}
        <ThoughtOfTheDay />

        {/* Quick Mood Check-in */}
        <QuickMoodCheckin />

        {/* Streaks Banner */}
        {(streaks?.current_mood_streak || streaks?.current_journal_streak || achievementCount > 0) && (<Card className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 border-0">
            <CardContent className="py-4">
              <div className="flex items-center justify-around text-center">
                {streaks?.current_mood_streak ? (<div>
                    <div className="flex items-center justify-center gap-1 text-orange-500 text-xl font-bold">
                      🔥 {streaks.current_mood_streak}
                    </div>
                    <p className="text-xs text-muted-foreground">Mood Streak</p>
                  </div>) : null}
                {streaks?.current_journal_streak ? (<div>
                    <div className="flex items-center justify-center gap-1 text-blue-500 text-xl font-bold">
                      ✍️ {streaks.current_journal_streak}
                    </div>
                    <p className="text-xs text-muted-foreground">Journal Streak</p>
                  </div>) : null}
                {achievementCount > 0 && (<div onClick={() => navigate('/summary')} className="cursor-pointer">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 text-xl font-bold">
                      <Award className="w-5 h-5"/> {achievementCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>)}
              </div>
            </CardContent>
          </Card>)}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (<Card key={action.title} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={() => navigate(action.path)}>
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-6 h-6"/>
                </div>
                <span className="font-medium text-sm">{action.title}</span>
              </CardContent>
            </Card>))}
        </div>

        {/* Mood Heatmap */}
        <MoodHeatmap />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Moods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary"/>
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMoods.length === 0 ? (<p className="text-muted-foreground text-sm">No mood entries yet. Start tracking!</p>) : (<div className="space-y-3">
                  {recentMoods.map((entry) => {
                const config = moodConfig[entry.mood];
                const Icon = config.icon;
                return (<div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                        <Icon className={`w-5 h-5 ${config.color}`}/>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{config.label}</span>
                          {entry.note && (<p className="text-xs text-muted-foreground truncate">{entry.note}</p>)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d')}
                        </span>
                      </div>);
            })}
                </div>)}
            </CardContent>
          </Card>

          {/* Recent Journal Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary"/>
                Recent Journal Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJournals.length === 0 ? (<p className="text-muted-foreground text-sm">No journal entries yet. Start writing!</p>) : (<div className="space-y-3">
                  {recentJournals.map((entry) => {
                const config = moodConfig[entry.mood];
                const Icon = config.icon;
                return (<div key={entry.id} className="p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${config.color}`}/>
                          <span className="font-medium text-sm">{entry.title || 'Untitled'}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(entry.created_at), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
                      </div>);
            })}
                </div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>);
};
export default Home;
