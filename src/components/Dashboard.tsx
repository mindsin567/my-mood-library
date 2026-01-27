import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import MoodPicker from './MoodPicker';
import MoodHistory from './MoodHistory';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMoodSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Mood <span className="text-gradient-primary">Digital Library</span>
          </h1>
          <p className="text-muted-foreground">
            Track your emotions and reflect on your mental wellness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodPicker onMoodSaved={handleMoodSaved} />
          <MoodHistory refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
