'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { handleAskVerdant } from '@/app/actions';
import type { Transaction, Insight } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useAnimate, stagger } from 'framer-motion';

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
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Thinking...' : 'Ask'}
    </Button>
  );
}

export default function AskVerdantChat({ transactions, insights }: AskVerdantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, formAction] = useActionState(handleAskVerdant, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();

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

    // Animate the new user message
    // A short delay ensures the element is in the DOM before animating
    setTimeout(() => {
        if (scope.current) {
            const messageElements = scope.current.querySelectorAll('.message-container');
            const lastMessage = messageElements[messageElements.length - 1];
            if (lastMessage) {
                animate(lastMessage, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 });
            }
        }
    }, 10);
    
    formAction(formData);
    formRef.current?.reset();
  };

  // Add AI response to messages
  useEffect(() => {
    if (state.answer || state.error) {
        const content = state.answer || `Sorry, an error occurred: ${state.error}`;
        const newMessage: Message = { role: 'assistant', content };
        setMessages((prev) => [...prev, newMessage]);

        // Animate the new AI message
        setTimeout(() => {
            if (scope.current) {
                const messageElements = scope.current.querySelectorAll('.message-container');
                const lastMessage = messageElements[messageElements.length - 1];
                if (lastMessage) {
                    animate(lastMessage, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 });
                }
            }
        }, 10);
    }
  }, [state, animate]);

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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Ask Verdant</CardTitle>
        <CardDescription>Chat with an AI about your spending.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4" ref={scope}>
            {messages.map((message, index) => (
              <div key={index} className={`message-container flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg p-3 text-sm max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {useFormStatus().pending && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-muted">
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form ref={formRef} action={handleFormSubmit} className="flex w-full items-center gap-2">
          <Input name="question" placeholder="Ask about your spending..." autoComplete="off" />
          <input type="hidden" name="transactions" value={JSON.stringify(transactions)} />
          <input type="hidden" name="insights" value={JSON.stringify(insights)} />
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
