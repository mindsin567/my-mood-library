import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MoodPicker from '@/components/MoodPicker';
import MoodHistory from '@/components/MoodHistory';
const MoodLog = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const handleMoodSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    return (<DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mood <span className="text-gradient-primary">Logging</span>
          </h1>
          <p className="text-muted-foreground">
            Track how you're feeling right now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodPicker onMoodSaved={handleMoodSaved}/>
          <MoodHistory refreshTrigger={refreshTrigger}/>
        </div>
      </div>
    </DashboardLayout>);
};
export default MoodLog;
