import React, { useState, useRef, useEffect } from 'react';
import { useJourney } from '@/hooks/useJourney';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Prayer } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MessagesPage = () => {
  const { user, messages, sendMessage } = useJourney();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col border rounded-3xl overflow-hidden bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 md:p-6 border-b bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarFallback className="font-black italic bg-primary text-primary-foreground">
              {user.partnerName?.[0] || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-black uppercase italic tracking-tight">{user.partnerName}</h2>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Your {user.role === 'leader' ? 'Learner' : 'Leader'}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="hidden md:flex gap-2 uppercase italic font-bold text-xs" onClick={() => sendMessage("I am praying for you today! 🙏")}>
          <Prayer className="w-4 h-4" /> Send Prayer Prompt
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 md:p-6" viewportRef={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Journey Started
            </span>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col max-w-[80%] md:max-w-[70%]",
                msg.sender === 'me' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.sender === 'me' 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-muted text-foreground rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[9px] uppercase font-bold text-muted-foreground mt-1 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t bg-secondary/10">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input 
            placeholder="Type your message..." 
            className="h-12 rounded-xl bg-background border-2 focus-visible:ring-primary"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            className="h-12 w-12 rounded-xl shrink-0" 
            onClick={handleSend}
            disabled={!inputText.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Prayer = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m13 10 3.5 2.2a2.4 2.4 0 0 1 .8 3.5l-1 1.5c-.6.8-1.7 1-2.5.5L10 16l-3.8 2.3a2.4 2.4 0 0 1-3.5-.8l-1.5-1c-.5-.8-.3-1.9.5-2.5L10 11l3-1Z"/><path d="M10 11V6"/><path d="M10 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path d="M10 11h2.5"/><path d="M10 16v5"/></svg>
);
