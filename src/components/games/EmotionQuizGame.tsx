import { useState, useCallback } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const scenarios = [
  { situation: 'A friend cancels plans last minute', best: 'Express understanding', options: ['Express understanding', 'Ignore them forever', 'Get angry', 'Blame yourself'] },
  { situation: 'You made a mistake at work', best: 'Acknowledge and learn from it', options: ['Acknowledge and learn from it', 'Pretend it didn\'t happen', 'Blame others', 'Give up entirely'] },
  { situation: 'Someone criticizes your work', best: 'Listen and reflect calmly', options: ['Listen and reflect calmly', 'Argue back immediately', 'Shut down emotionally', 'Take it very personally'] },
  { situation: 'You feel overwhelmed with tasks', best: 'Prioritize and take breaks', options: ['Prioritize and take breaks', 'Do everything at once', 'Avoid all tasks', 'Complain to everyone'] },
  { situation: 'A stranger is rude to you', best: 'Let it go and move on', options: ['Let it go and move on', 'Be rude back', 'Dwell on it all day', 'Confront them aggressively'] },
  { situation: 'You receive unexpected good news', best: 'Share joy with loved ones', options: ['Share joy with loved ones', 'Downplay it immediately', 'Worry it won\'t last', 'Brag to everyone'] },
  { situation: 'You feel lonely on a weekend', best: 'Reach out to someone', options: ['Reach out to someone', 'Scroll social media all day', 'Stay in bed', 'Feel sorry for yourself'] },
  { situation: 'You see someone struggling', best: 'Offer help kindly', options: ['Offer help kindly', 'Walk past quickly', 'Film it for social media', 'Assume they don\'t need help'] },
];

const EmotionQuizGame = () => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const loadQuestion = useCallback((idx: number) => {
    setShuffledOptions([...scenarios[idx].options].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, []);

  useState(() => { loadQuestion(0); });

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const scenario = scenarios[questionIdx];
    const correct = answer === scenario.best;
    if (correct) {
      setScore(s => s + 1);
      setFeedback('✅ Great emotional intelligence!');
    } else {
      setFeedback(`💡 Better response: "${scenario.best}"`);
    }
    setTimeout(() => {
      const next = questionIdx + 1;
      if (next >= scenarios.length) {
        setDone(true);
      } else {
        setQuestionIdx(next);
        loadQuestion(next);
      }
    }, 1500);
  };

  const restart = () => {
    setQuestionIdx(0);
    setScore(0);
    setDone(false);
    loadQuestion(0);
  };

  if (done) {
    return (
      <div className="space-y-4 text-center py-6">
        <Trophy className="w-10 h-10 text-primary mx-auto" />
        <p className="text-2xl font-bold text-foreground">{score}/{scenarios.length}</p>
        <p className="text-sm text-muted-foreground">
          {score >= 6 ? 'Amazing emotional awareness! 🌟' : score >= 4 ? 'Good insight! Keep growing 💪' : 'Room to grow — that\'s okay! 🌱'}
        </p>
        <Button onClick={restart}><RotateCcw className="w-3 h-3 mr-1" /> Play Again</Button>
      </div>
    );
  }

  const scenario = scenarios[questionIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Score: <span className="font-bold text-foreground">{score}</span></p>
        <p className="text-sm text-muted-foreground">{questionIdx + 1}/{scenarios.length}</p>
      </div>
      <div className="text-center py-4 bg-secondary/50 rounded-lg px-4">
        <p className="text-sm text-muted-foreground mb-1">Scenario:</p>
        <p className="font-semibold text-foreground">{scenario.situation}</p>
      </div>
      <p className="text-sm text-muted-foreground text-center">What's the healthiest response?</p>
      <div className="space-y-2">
        {shuffledOptions.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {option}
          </button>
        ))}
      </div>
      {feedback && <p className="text-sm text-center font-medium text-primary">{feedback}</p>}
    </div>
  );
};

export default EmotionQuizGame;
