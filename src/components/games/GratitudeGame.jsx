import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
const prompts = [
    'Something that made you smile today',
    'A person you appreciate',
    'A place that brings you peace',
    'A skill you are proud of',
    'A memory that warms your heart',
    'Something in nature you love',
    'A challenge that made you stronger',
    'A simple pleasure you enjoy',
    'Something kind someone did for you',
    'A quality you like about yourself',
];
const GratitudeGame = () => {
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [input, setInput] = useState('');
    const [entries, setEntries] = useState([]);
    const [done, setDone] = useState(false);
    const inputRef = useRef(null);
    const goal = 5;
    const nextPrompt = () => {
        const unused = prompts.filter((_, i) => !entries[i]);
        setCurrentPrompt(unused[Math.floor(Math.random() * unused.length)] || prompts[Math.floor(Math.random() * prompts.length)]);
        setInput('');
    };
    useEffect(() => { nextPrompt(); }, []);
    const submit = () => {
        if (!input.trim())
            return;
        const newEntries = [...entries, input.trim()];
        setEntries(newEntries);
        if (newEntries.length >= goal) {
            setDone(true);
        }
        else {
            nextPrompt();
        }
        setTimeout(() => inputRef.current?.focus(), 100);
    };
    const restart = () => {
        setEntries([]);
        setDone(false);
        nextPrompt();
    };
    if (done) {
        return (<div className="space-y-4 text-center">
        <Trophy className="w-10 h-10 text-primary mx-auto"/>
        <p className="text-lg font-bold text-foreground">Beautiful! 🌟</p>
        <p className="text-sm text-muted-foreground">You listed {goal} things to be grateful for</p>
        <div className="text-left space-y-1 bg-secondary/50 rounded-lg p-4">
          {entries.map((e, i) => (<p key={i} className="text-sm text-foreground">💛 {e}</p>))}
        </div>
        <Button variant="outline" onClick={restart}><RotateCcw className="w-3 h-3 mr-1"/> Play Again</Button>
      </div>);
    }
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{entries.length}/{goal} gratitudes</p>
      </div>
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-1">Write about:</p>
        <p className="text-lg font-semibold text-foreground">{currentPrompt}</p>
      </div>
      <div className="flex gap-2">
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Type here..." className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
        <Button size="sm" onClick={submit}>Add</Button>
      </div>
      {entries.length > 0 && (<div className="space-y-1">
          {entries.map((e, i) => (<p key={i} className="text-xs text-muted-foreground">💛 {e}</p>))}
        </div>)}
    </div>);
};
export default GratitudeGame;
