import { useState } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BreathingCountGame = () => {
  const [target, setTarget] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');

  const startGame = () => {
    const t = 5 + Math.floor(Math.random() * 11);
    setTarget(t);
    setCount(0);
    setPhase('playing');
  };

  const breathe = () => {
    const next = count + 1;
    setCount(next);
    if (next >= target) setPhase('done');
  };

  return (
    <div className="space-y-4 text-center">
      {phase === 'idle' && (
        <>
          <p className="text-muted-foreground text-sm">Take slow, deep breaths. Count each one.</p>
          <Button onClick={startGame}>Start</Button>
        </>
      )}
      {phase === 'playing' && (
        <>
          <p className="text-muted-foreground text-sm">Take <span className="font-bold text-primary">{target}</span> deep breaths</p>
          <button
            onClick={breathe}
            className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto text-4xl font-bold text-primary hover:scale-105 transition-transform active:scale-95"
          >
            {count}
          </button>
          <p className="text-xs text-muted-foreground">Tap after each breath</p>
        </>
      )}
      {phase === 'done' && (
        <>
          <div className="py-4">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">Great job! {target} mindful breaths 🌿</p>
          </div>
          <Button variant="outline" onClick={startGame}><RotateCcw className="w-3 h-3 mr-1" /> Again</Button>
        </>
      )}
    </div>
  );
};

export default BreathingCountGame;
