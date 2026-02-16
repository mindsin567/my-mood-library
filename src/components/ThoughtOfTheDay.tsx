import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const thoughts = [
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
  { text: "Feelings are just visitors. Let them come and go.", author: "Mooji" },
  { text: "You are not your thoughts. You are the observer of your thoughts.", author: "Eckhart Tolle" },
  { text: "Be where you are, not where you think you should be.", author: "Unknown" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" },
  { text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Rest is not idleness, and to lie sometimes on the grass on a summer day is by no means a waste of time.", author: "John Lubbock" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The mind is everything. What you think, you become.", author: "Buddha" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Every day may not be good, but there is something good in every day.", author: "Alice Morse Earle" },
  { text: "Inhale courage, exhale fear.", author: "Unknown" },
  { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss" },
  { text: "Peace begins with a smile.", author: "Mother Teresa" },
  { text: "You don't have to see the whole staircase. Just take the first step.", author: "Martin Luther King Jr." },
  { text: "Wellness is the complete integration of body, mind, and spirit.", author: "Greg Anderson" },
  { text: "A flower does not think of competing with the flower next to it. It just blooms.", author: "Zen Shin" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
];

const ThoughtOfTheDay = () => {
  const today = useMemo(() => {
    // Use date as seed so it changes daily
    const now = new Date();
    const dayIndex = (now.getFullYear() * 366 + now.getMonth() * 31 + now.getDate()) % thoughts.length;
    return thoughts[dayIndex];
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-primary/20">
      <CardContent className="py-5 px-6">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Thought of the Day
            </p>
            <blockquote className="text-foreground font-medium italic leading-relaxed">
              "{today.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground mt-2">— {today.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThoughtOfTheDay;
