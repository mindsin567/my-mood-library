import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
const positiveWords = ['GRATITUDE', 'PEACEFUL', 'SERENITY', 'JOYFUL', 'KINDNESS', 'HARMONY', 'COURAGE', 'BLOSSOM', 'TRANQUIL', 'RADIANT'];
const WordScrambleGame = () => {
    const [word, setWord] = useState('');
    const [scrambled, setScrambled] = useState('');
    const [guess, setGuess] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const newWord = useCallback(() => {
        const w = positiveWords[Math.floor(Math.random() * positiveWords.length)];
        setWord(w);
        setScrambled(w.split('').sort(() => Math.random() - 0.5).join(''));
        setGuess('');
        setFeedback(null);
    }, []);
    useEffect(() => { newWord(); }, [newWord]);
    const checkGuess = () => {
        if (guess.toUpperCase() === word) {
            setScore(s => s + 1);
            setFeedback('correct');
            setTimeout(newWord, 1000);
        }
        else {
            setFeedback('wrong');
        }
    };
    return (<div className="space-y-4">
      <p className="text-sm text-muted-foreground">Score: <span className="font-bold text-foreground">{score}</span></p>
      <div className="text-center py-6">
        <p className="text-3xl font-bold tracking-[0.3em] text-primary">{scrambled}</p>
        <p className="text-xs text-muted-foreground mt-2">Unscramble this positive word</p>
      </div>
      <div className="flex gap-2">
        <input type="text" value={guess} onChange={(e) => { setGuess(e.target.value); setFeedback(null); }} onKeyDown={(e) => e.key === 'Enter' && checkGuess()} placeholder="Your guess..." className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
        <Button size="sm" onClick={checkGuess}>Check</Button>
      </div>
      {feedback === 'correct' && <p className="text-green-500 text-sm font-medium text-center">✨ Correct!</p>}
      {feedback === 'wrong' && <p className="text-red-500 text-sm text-center">Try again!</p>}
      <Button size="sm" variant="ghost" onClick={newWord} className="w-full">Skip word</Button>
    </div>);
};
export default WordScrambleGame;
