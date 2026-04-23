import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, PieChart as PieChartIcon, Calendar } from 'lucide-react';
const moodValues = {
    happy: 5,
    excited: 5,
    calm: 4,
    neutral: 3,
    tired: 2,
    anxious: 2,
    sad: 1,
    angry: 1,
};
const moodColors = {
    happy: '#eab308',
    excited: '#f97316',
    calm: '#22c55e',
    neutral: '#6b7280',
    tired: '#6366f1',
    anxious: '#a855f7',
    sad: '#3b82f6',
    angry: '#ef4444',
};
const MoodAnalytics = ({ moodEntries }) => {
    // Line chart data - mood over last 14 days
    const lineChartData = useMemo(() => {
        const last14Days = eachDayOfInterval({
            start: subDays(new Date(), 13),
            end: new Date(),
        });
        return last14Days.map((day) => {
            const dayEntries = moodEntries.filter((entry) => isSameDay(new Date(entry.created_at), day));
            const avgMood = dayEntries.length > 0
                ? dayEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / dayEntries.length
                : null;
            return {
                date: format(day, 'MMM d'),
                mood: avgMood,
                fullDate: format(day, 'EEEE, MMMM d'),
            };
        });
    }, [moodEntries]);
    // Pie chart data - mood distribution
    const pieChartData = useMemo(() => {
        const moodCounts = {};
        moodEntries.forEach((entry) => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        return Object.entries(moodCounts).map(([mood, count]) => ({
            name: mood.charAt(0).toUpperCase() + mood.slice(1),
            value: count,
            color: moodColors[mood],
        }));
    }, [moodEntries]);
    // Heatmap data - mood by day of week
    const heatmapData = useMemo(() => {
        const dayMoods = {
            Sun: { total: 0, count: 0 },
            Mon: { total: 0, count: 0 },
            Tue: { total: 0, count: 0 },
            Wed: { total: 0, count: 0 },
            Thu: { total: 0, count: 0 },
            Fri: { total: 0, count: 0 },
            Sat: { total: 0, count: 0 },
        };
        moodEntries.forEach((entry) => {
            const dayName = format(new Date(entry.created_at), 'EEE');
            if (dayMoods[dayName]) {
                dayMoods[dayName].total += moodValues[entry.mood];
                dayMoods[dayName].count += 1;
            }
        });
        return Object.entries(dayMoods).map(([day, data]) => ({
            day,
            avgMood: data.count > 0 ? data.total / data.count : 0,
            count: data.count,
        }));
    }, [moodEntries]);
    const getHeatmapColor = (avgMood) => {
        if (avgMood === 0)
            return 'bg-secondary';
        if (avgMood >= 4)
            return 'bg-green-500';
        if (avgMood >= 3)
            return 'bg-yellow-500';
        if (avgMood >= 2)
            return 'bg-orange-500';
        return 'bg-red-500';
    };
    const getHeatmapIntensity = (avgMood) => {
        if (avgMood === 0)
            return 'opacity-20';
        if (avgMood >= 4)
            return 'opacity-100';
        if (avgMood >= 3)
            return 'opacity-80';
        if (avgMood >= 2)
            return 'opacity-60';
        return 'opacity-80';
    };
    if (moodEntries.length === 0) {
        return (<Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Start logging your moods to see analytics!
        </CardContent>
      </Card>);
    }
    return (<div className="space-y-6">
      {/* Line Chart - Mood Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary"/>
            Mood Trend (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border"/>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground"/>
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} tickFormatter={(value) => {
            const labels = ['', 'Low', 'Fair', 'Good', 'Great', 'Best'];
            return labels[value] || '';
        }}/>
                <Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length && payload[0].value !== null) {
                return (<div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="font-medium">{payload[0].payload.fullDate}</p>
                          <p className="text-sm text-muted-foreground">
                            Mood Score: {Number(payload[0].value).toFixed(1)} / 5
                          </p>
                        </div>);
            }
            return null;
        }}/>
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} connectNulls/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary"/>
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (<div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} entries
                            </p>
                          </div>);
            }
            return null;
        }}/>
                  <Legend verticalAlign="bottom" formatter={(value) => <span className="text-sm">{value}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap - Mood by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary"/>
              Mood by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatmapData.map((item) => (<div key={item.day} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium">{item.day}</span>
                  <div className="flex-1 h-10 rounded-lg relative overflow-hidden bg-secondary">
                    <div className={`absolute inset-0 ${getHeatmapColor(item.avgMood)} ${getHeatmapIntensity(item.avgMood)} transition-all`} style={{ width: `${(item.avgMood / 5) * 100}%` }}/>
                  </div>
                  <span className="w-16 text-sm text-muted-foreground text-right">
                    {item.count > 0 ? `${item.avgMood.toFixed(1)}/5` : 'No data'}
                  </span>
                </div>))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"/> Low
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500"/> Fair
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500"/> Good
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"/> Great
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default MoodAnalytics;
