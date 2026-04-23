import { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
const symbols = ['🌸', '🌊', '🌿', '☀️', '🦋', '🌙', '⭐', '🍃', '🔥'];
const PatternGame = () => {
    const [pattern, setPattern] = useState([]);
    const [options, setOptions] = useState([]);
    const [answer, setAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [level, setLevel] = useState(1);
    const newRound = useCallback(() => {
        const len = 3 + Math.min(level, 5);
        const base = symbols[Math.floor(Math.random() * symbols.length)];
        const alt = symbols.filter(s => s !== base)[Math.floor(Math.random() * (symbols.length - 1))];
        // Create a repeating pattern with one missing
        const full = [];
        for (let i = 0; i < len; i++) {
            full.push(i % 2 === 0 ? base : alt);
        }
        const missingIdx = Math.floor(Math.random() * len);
        const correct = full[missingIdx];
        const display = full.map((s, i) => i === missingIdx ? '❓' : s);
        setPattern(display);
        setAnswer(correct);
        const opts = [correct, ...symbols.filter(s => s !== correct).sort(() => Math.random() - 0.5).slice(0, 3)];
        setOptions(opts.sort(() => Math.random() - 0.5));
        setFeedback(null);
    }, [level]);
    useEffect(() => { newRound(); }, [newRound]);
    const handlePick = (symbol) => {
        if (feedback)
            return;
        if (symbol === answer) {
            setScore(s => s + level);
            setFeedback('correct');
            setTimeout(() => {
                setLevel(l => l + 1);
                newRound();
            }, 800);
        }
        else {
            setFeedback('wrong');
            setTimeout(() => {
                setFeedback(null);
            }, 600);
        }
    };
    const restart = () => {
        setScore(0);
        setLevel(1);
        newRound();
    };
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Score: <span className="font-bold text-foreground">{score}</span></p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Level: <span className="font-bold text-primary">{level}</span></p>
          <Button size="sm" variant="outline" onClick={restart}><RotateCcw className="w-3 h-3"/></Button>
        </div>
      </div>
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground mb-3">Find the missing piece in the pattern</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {pattern.map((s, i) => (<span key={i} className={`text-3xl ${s === '❓' ? 'animate-pulse' : ''}`}>{s}</span>))}
        </div>
      </div>
      {feedback === 'correct' && <p className="text-green-500 text-sm font-medium text-center">✨ Correct! Level up!</p>}
      {feedback === 'wrong' && <p className="text-red-500 text-sm text-center">Not quite, try again!</p>}
      <div className="grid grid-cols-4 gap-2">
        {options.map((symbol, i) => (<button key={i} onClick={() => handlePick(symbol)} className="aspect-square rounded-lg bg-secondary hover:bg-secondary/80 text-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95">
            {symbol}
          </button>))}
      </div>
    </div>);
};
export default PatternGame;
