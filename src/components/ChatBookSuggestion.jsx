import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
const ChatBookSuggestion = ({ books }) => {
    if (!books || books.length === 0)
        return null;
    return (<div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <BookOpen className="w-3 h-3"/> Reading suggestion
      </p>
      {books.map((book, index) => (<Card key={index} className="bg-background/50 border-border/50 p-3">
          <p className="font-medium text-sm">{book.title}</p>
          <p className="text-xs text-muted-foreground">by {book.author}</p>
          <p className="text-xs text-muted-foreground/80 mt-1 italic">{book.reason}</p>
        </Card>))}
    </div>);
};
export default ChatBookSuggestion;
