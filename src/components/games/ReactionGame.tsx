import { useState, useEffect, useRef } from 'react';

const ReactionGame = () => {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result' | 'early'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRound = () => {
    setState('ready');
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting' || state === 'result' || state === 'early') {
      startRound();
    } else if (state === 'ready') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('early');
    } else if (state === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      if (!best || time < best) setBest(time);
      setState('result');
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const bgColor = state === 'go' ? 'bg-green-500/20 border-green-500/40' : state === 'ready' ? 'bg-red-500/10 border-red-500/30' : 'bg-secondary';

  return (
    <div className="space-y-4">
      {best && <p className="text-sm text-muted-foreground">Best: <span className="font-bold text-primary">{best}ms</span></p>}
      <button
        onClick={handleClick}
        className={`w-full h-48 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${bgColor}`}
      >
        {state === 'waiting' && <p className="text-foreground font-medium">Click to start</p>}
        {state === 'ready' && <p className="text-red-500 font-medium text-lg">Wait for green...</p>}
        {state === 'go' && <p className="text-green-600 font-bold text-2xl">CLICK NOW!</p>}
        {state === 'result' && (
          <>
            <p className="text-primary font-bold text-3xl">{reactionTime}ms</p>
            <p className="text-muted-foreground text-sm mt-1">Click to try again</p>
          </>
        )}
        {state === 'early' && (
          <>
            <p className="text-red-500 font-medium">Too early!</p>
            <p className="text-muted-foreground text-sm mt-1">Click to try again</p>
          </>
        )}
      </button>
    </div>
  );
};

export default ReactionGame;
