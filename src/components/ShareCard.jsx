import { useRef, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
const ShareCard = ({ moodStreak, journalStreak, achievementCount, totalAchievements, displayName }) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const cardRef = useRef(null);
    const shareText = `🌿 My Mindi Wellness Progress\n\n🔥 ${moodStreak}-day mood streak\n✍️ ${journalStreak}-day journal streak\n🏆 ${achievementCount}/${totalAchievements} achievements unlocked\n\nTracking my mental wellness journey with Mindi! 💚`;
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Mindi Wellness Progress',
                    text: shareText,
                });
            }
            catch (err) {
                if (err.name !== 'AbortError') {
                    handleCopy();
                }
            }
        }
        else {
            handleCopy();
        }
    };
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast({ title: 'Copied!', description: 'Share text copied to clipboard.' });
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            toast({ title: 'Error', description: 'Failed to copy.', variant: 'destructive' });
        }
    };
    return (<Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4"/>
          Share Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
        </DialogHeader>

        {/* Visual share card */}
        <div ref={cardRef} className="rounded-2xl p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary border border-border overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl"/>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-accent/10 blur-2xl"/>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="font-bold text-foreground text-lg">Mindi</p>
                <p className="text-xs text-muted-foreground">Wellness Journey</p>
              </div>
            </div>

            {displayName && (<p className="text-sm text-muted-foreground mb-3">{displayName}'s progress</p>)}

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-2xl font-bold text-foreground">🔥 {moodStreak}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Mood Streak</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-2xl font-bold text-foreground">✍️ {journalStreak}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Journal Streak</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-2xl font-bold text-foreground">🏆 {achievementCount}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Badges</p>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground/70">
              Tracking my mental wellness with Mindi 💚
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <Button onClick={handleShare} className="flex-1 gap-2">
            <Share2 className="w-4 h-4"/>
            Share
          </Button>
          <Button onClick={handleCopy} variant="outline" className="gap-2">
            {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>);
};
export default ShareCard;
