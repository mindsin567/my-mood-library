import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
const emojis = ['🌸', '🌊', '🌿', '☀️', '🦋', '🌙', '⭐', '🍃'];
const MemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);
    const initGame = useCallback(() => {
        const deck = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
        setCards(deck);
        setSelected([]);
        setMoves(0);
        setWon(false);
    }, []);
    useEffect(() => { initGame(); }, [initGame]);
    const flipCard = (id) => {
        if (selected.length === 2)
            return;
        const card = cards[id];
        if (card.flipped || card.matched)
            return;
        const newCards = cards.map((c, i) => i === id ? { ...c, flipped: true } : c);
        const newSelected = [...selected, id];
        setCards(newCards);
        setSelected(newSelected);
        if (newSelected.length === 2) {
            setMoves(m => m + 1);
            const [a, b] = newSelected;
            if (newCards[a].emoji === newCards[b].emoji) {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c));
                    setSelected([]);
                    const allMatched = newCards.every((c, i) => (i === a || i === b) ? true : c.matched);
                    if (allMatched)
                        setWon(true);
                }, 400);
            }
            else {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, flipped: false } : c));
                    setSelected([]);
                }, 800);
            }
        }
    };
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Moves: <span className="font-bold text-foreground">{moves}</span></p>
        <Button size="sm" variant="outline" onClick={initGame}><RotateCcw className="w-3 h-3 mr-1"/> Reset</Button>
      </div>
      {won && (<div className="text-center py-2 rounded-lg bg-primary/10">
          <p className="font-semibold text-primary flex items-center justify-center gap-1"><Trophy className="w-4 h-4"/> You won in {moves} moves!</p>
        </div>)}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (<button key={card.id} onClick={() => flipCard(card.id)} className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all duration-300 ${card.flipped || card.matched
                ? 'bg-primary/10 scale-100'
                : 'bg-secondary hover:bg-secondary/80 scale-95'} ${card.matched ? 'opacity-60' : ''}`}>
            {card.flipped || card.matched ? card.emoji : '?'}
          </button>))}
      </div>
    </div>);
};
export default MemoryGame;
