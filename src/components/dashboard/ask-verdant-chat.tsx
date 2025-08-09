'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send, Sparkles, MessageCircle } from 'lucide-react';
import { handleAskVerdant } from '@/app/actions';
import type { Transaction, Insight } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

type AskVerdantChatProps = {
  transactions: Transaction[];
  insights: Insight[];
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const initialState = {
  answer: '',
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button type="submit" size="sm" disabled={pending} className="bg-primary hover:bg-primary/90">
        {pending ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
}

export default function AskVerdantChat({ transactions, insights }: AskVerdantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, formAction] = useActionState(handleAskVerdant, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Greet user on first load
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm Verdant, your personal financial assistant. How can I help you today?",
      },
    ]);
  }, []);

  // Handle form submission and response
  const handleFormSubmit = (formData: FormData) => {
    const question = formData.get('question') as string;
    if (!question.trim()) return;

    const newMessage: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, newMessage]);
    
    formAction(formData);
    formRef.current?.reset();
  };

  // Add AI response to messages
  useEffect(() => {
    if (state.answer || state.error) {
        const content = state.answer || `Sorry, an error occurred: ${state.error}`;
        const newMessage: Message = { role: 'assistant', content };
        setMessages((prev) => [...prev, newMessage]);
    }
  }, [state]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollableView) {
            scrollableView.scrollTo({
                top: scrollableView.scrollHeight,
                behavior: 'smooth',
            });
        }
    }
  }, [messages])

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background to-secondary/20 border-border/50 shadow-lg">
      <CardHeader className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="flex items-center gap-2 text-xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-primary/10 p-2 rounded-full"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
            </motion.div>
            Ask Verdant
          </CardTitle>
          <CardDescription className="text-base">
            Chat with AI about your spending patterns and get personalized insights.
          </CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Avatar className="h-9 w-9 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className={`
                      rounded-2xl p-4 text-sm max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] shadow-sm
                      ${message.role === 'user' 
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20' 
                        : 'bg-gradient-to-br from-muted to-muted/50 border border-border/50 backdrop-blur-sm'
                      }
                    `}
                  >
                    <div className="space-y-2">
                      {message.content.split('\n').map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`leading-relaxed ${message.role === 'assistant' ? 'text-foreground' : ''}`}
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                  
                  {message.role === 'user' && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Avatar className="h-9 w-9 border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-secondary/10">
                        <AvatarFallback className="bg-transparent">
                          <User className="h-5 w-5 text-accent" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
             
            {useFormStatus().pending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
                  <AvatarFallback className="bg-transparent">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Bot className="h-5 w-5 text-primary" />
                    </motion.div>
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl p-4 text-sm bg-gradient-to-br from-muted to-muted/50 border border-border/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary/60 rounded-full"
                          animate={{
                            y: [0, -8, 0],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t border-border/50 bg-background/50 backdrop-blur-sm p-4">
        <motion.form
          ref={formRef}
          action={handleFormSubmit}
          className="flex w-full items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative flex-1">
            <Input
              name="question"
              placeholder="Ask about your spending patterns, insights, or financial goals..."
              autoComplete="off"
              className="pr-4 pl-4 py-3 text-sm bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl backdrop-blur-sm"
            />
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
          </div>
          <input type="hidden" name="transactions" value={JSON.stringify(transactions)} />
          <input type="hidden" name="insights" value={JSON.stringify(insights)} />
          <SubmitButton />
        </motion.form>
      </CardFooter>
    </Card>
  );
}
