import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
const colors = [
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Yellow', class: 'bg-yellow-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Orange', class: 'bg-orange-500' },
];
const ColorMatchGame = () => {
    const [targetColor, setTargetColor] = useState(colors[0]);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [round, setRound] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const totalRounds = 10;
    const newRound = useCallback(() => {
        const target = colors[Math.floor(Math.random() * colors.length)];
        const shuffled = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);
        if (!shuffled.find(c => c.name === target.name)) {
            shuffled[Math.floor(Math.random() * shuffled.length)] = target;
        }
        setTargetColor(target);
        setOptions(shuffled.sort(() => Math.random() - 0.5));
        setFeedback(null);
    }, []);
    useEffect(() => { newRound(); }, [newRound]);
    const handlePick = (color) => {
        if (feedback)
            return;
        if (color.name === targetColor.name) {
            setScore(s => s + 1 + streak);
            setStreak(s => s + 1);
            setFeedback('correct');
        }
        else {
            setStreak(0);
            setFeedback('wrong');
        }
        setTimeout(() => {
            const next = round + 1;
            if (next >= totalRounds) {
                setGameOver(true);
            }
            else {
                setRound(next);
                newRound();
            }
        }, 600);
    };
    const restart = () => {
        setScore(0);
        setStreak(0);
        setRound(0);
        setGameOver(false);
        newRound();
    };
    if (gameOver) {
        return (<div className="space-y-4 text-center py-6">
        <Trophy className="w-10 h-10 text-primary mx-auto"/>
        <p className="text-2xl font-bold text-foreground">Score: {score}</p>
        <p className="text-sm text-muted-foreground">You completed {totalRounds} rounds!</p>
        <Button onClick={restart}><RotateCcw className="w-3 h-3 mr-1"/> Play Again</Button>
      </div>);
    }
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Score: <span className="font-bold text-foreground">{score}</span></p>
        <p className="text-sm text-muted-foreground">Round: <span className="font-bold text-foreground">{round + 1}/{totalRounds}</span></p>
      </div>
      {streak > 1 && <p className="text-xs text-primary text-center font-medium">🔥 {streak} streak!</p>}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-3">Tap the color:</p>
        <p className="text-2xl font-bold text-foreground">{targetColor.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((color) => (<button key={color.name} onClick={() => handlePick(color)} className={`h-20 rounded-xl ${color.class} transition-all hover:scale-105 active:scale-95 ${feedback === 'correct' && color.name === targetColor.name ? 'ring-4 ring-green-300' : ''} ${feedback === 'wrong' && color.name === targetColor.name ? 'ring-4 ring-primary' : ''}`}/>))}
      </div>
    </div>);
};
export default ColorMatchGame;
