import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client.js';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import ChatMusicPlayer from '@/components/ChatMusicPlayer';
const Chatbot = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Mindi, your wellness companion. 💚 How are you feeling today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    const sendMessage = async () => {
        if (!input.trim() || isLoading || !user)
            return;
        const userMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        try {
            const response = await supabase.functions.invoke('ai-chat', {
                body: {
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    type: 'chat'
                }
            });
            if (response.error)
                throw response.error;
            let assistantMessage = {
                role: 'assistant',
                content: response.data.message || "I'm here to help. Could you tell me more?"
            };
            if (response.data.includeSuggestions && response.data.songs?.length > 0) {
                try {
                    const musicRes = await supabase.functions.invoke('music-search', {
                        body: { songs: response.data.songs }
                    });
                    if (musicRes.data?.songs) {
                        assistantMessage.songs = musicRes.data.songs;
                    }
                    else {
                        assistantMessage.songs = response.data.songs;
                    }
                }
                catch {
                    assistantMessage.songs = response.data.songs;
                }
            }
            setMessages(prev => [...prev, assistantMessage]);
        }
        catch (error) {
            console.error('Chat error:', error);
            toast({
                title: 'Error',
                description: 'Failed to get response. Please try again.',
                variant: 'destructive'
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const quickPrompts = [
        "I'm feeling stressed 😰",
        "I need motivation 💪",
        "Play something calming 🎵",
        "I'm feeling great! 🌟",
    ];
    return (<DashboardLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col relative">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-20 -left-32 w-72 h-72 rounded-full bg-primary/5 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-16 -right-24 w-64 h-64 rounded-full bg-primary/8 blur-3xl"/>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/3 blur-[100px]"/>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mindi <span className="text-gradient-primary">AI Chat</span>
            </h1>
            <p className="text-sm text-muted-foreground">Your personal wellness companion</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card/80 backdrop-blur-md shadow-card">
          <ScrollArea className="flex-1 p-5" ref={scrollRef}>
            <div className="space-y-5">
              {messages.map((message, index) => (<div key={index} className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-primary"/>
                    </div>)}
                  <div className={`max-w-[80%]`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md shadow-md'
                : 'bg-secondary/70 text-foreground rounded-bl-md border border-border/50'}`}>
                      {message.role === 'assistant' ? (<div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>) : (<p>{message.content}</p>)}
                    </div>
                    
                    {message.role === 'assistant' && message.songs && message.songs.length > 0 && (<ChatMusicPlayer songs={message.songs}/>)}
                  </div>
                  {message.role === 'user' && (<div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <User className="w-5 h-5 text-primary-foreground"/>
                    </div>)}
                </div>))}

              {/* Loading indicator */}
              {isLoading && (<div className="flex gap-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary animate-pulse"/>
                  </div>
                  <div className="bg-secondary/70 rounded-2xl rounded-bl-md px-5 py-4 border border-border/50">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                  </div>
                </div>)}

              {/* Quick prompts - only show at start */}
              {messages.length === 1 && !isLoading && (<div className="flex flex-wrap gap-2 pt-2">
                  {quickPrompts.map((prompt) => (<button key={prompt} onClick={() => { setInput(prompt); }} className="px-3 py-1.5 text-xs rounded-full border border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all">
                      {prompt}
                    </button>))}
                </div>)}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2 items-center">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Share how you're feeling..." disabled={isLoading} className="flex-1 rounded-xl border-border/50 bg-background focus-visible:ring-primary/30"/>
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="rounded-xl h-10 w-10 shrink-0 shadow-sm">
                <Send className="w-4 h-4"/>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>);
};
export default Chatbot;
