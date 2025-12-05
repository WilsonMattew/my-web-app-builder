import { useState, useRef, useEffect } from 'react';
import { useConversations, useConversationMessages, useCreateConversation, useAddMessage } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Brain,
  Code,
  Palette,
  TrendingUp,
  Send,
  Sparkles,
  Lightbulb,
  Loader2,
} from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  capabilities: string[];
  suggestions: string[];
}

const assistants: Assistant[] = [
  {
    id: 'oracle',
    name: 'Oracle',
    role: 'Strategic Advisor',
    description: 'Executive insights, data analysis, and strategic decision support',
    icon: Brain,
    color: 'text-oracle',
    bgColor: 'bg-oracle/10',
    capabilities: ['Executive summaries', 'Data analysis', 'Strategic recommendations', 'Risk assessment'],
    suggestions: [
      'Generate a weekly executive summary',
      'Analyze our Q4 performance',
      'What are our top priorities this month?',
    ],
  },
  {
    id: 'aether',
    name: 'Aether',
    role: 'Technical Expert',
    description: 'Code review, technical guidance, and development best practices',
    icon: Code,
    color: 'text-aether',
    bgColor: 'bg-aether/10',
    capabilities: ['Code review', 'Architecture advice', 'Bug analysis', 'Performance optimization'],
    suggestions: [
      'Review my React component for best practices',
      'How should I structure this API endpoint?',
      'Optimize this database query',
    ],
  },
  {
    id: 'muse',
    name: 'Muse',
    role: 'Creative Director',
    description: 'Campaign ideas, content creation, and brand voice guidance',
    icon: Palette,
    color: 'text-muse',
    bgColor: 'bg-muse/10',
    capabilities: ['Campaign concepts', 'Content writing', 'Visual direction', 'Brand consistency'],
    suggestions: [
      'Generate 5 Instagram post ideas for our client',
      'Write engaging captions for a product launch',
      'Create a content calendar for February',
    ],
  },
  {
    id: 'ascend',
    name: 'Ascend',
    role: 'Growth Strategist',
    description: 'Lead analysis, sales optimization, and conversion strategies',
    icon: TrendingUp,
    color: 'text-ascend',
    bgColor: 'bg-ascend/10',
    capabilities: ['Lead scoring', 'Sales outreach', 'Funnel optimization', 'Conversion analysis'],
    suggestions: [
      'Analyze this lead for conversion potential',
      'Draft a follow-up email for a warm prospect',
      'What can we improve in our sales funnel?',
    ],
  },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistants() {
  const [activeAssistant, setActiveAssistant] = useState<Assistant>(assistants[0]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useConversations(activeAssistant.id);
  const { data: dbMessages } = useConversationMessages(currentConversationId || undefined);
  const createConversation = useCreateConversation();
  const addMessage = useAddMessage();

  // Use local messages for real-time updates, sync with DB messages
  useEffect(() => {
    if (dbMessages) {
      setLocalMessages(dbMessages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content
      })));
    }
  }, [dbMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  // Reset conversation when assistant changes
  useEffect(() => {
    setCurrentConversationId(null);
    setLocalMessages([]);
  }, [activeAssistant.id]);

  const streamChat = async (messages: { role: string; content: string }[]) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages, 
        assistant_type: activeAssistant.id 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response');
    }

    return response;
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      // Create conversation if needed
      let conversationId = currentConversationId;
      if (!conversationId) {
        const newConversation = await createConversation.mutateAsync({
          assistant_type: activeAssistant.id,
          title: input.slice(0, 50),
        });
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }

      // Save user message to DB
      await addMessage.mutateAsync({
        conversation_id: conversationId,
        role: 'user',
        content: input,
      });

      // Prepare messages for AI
      const chatMessages = localMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      chatMessages.push({ role: 'user', content: input });

      // Stream response
      const response = await streamChat(chatMessages);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let assistantContent = '';
      const assistantId = `assistant-${Date.now()}`;

      // Add placeholder for assistant message
      setLocalMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
      }]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setLocalMessages(prev => 
                    prev.map(m => 
                      m.id === assistantId 
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Save assistant message to DB
      if (assistantContent) {
        await addMessage.mutateAsync({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">AI Assistants</h1>
          <p className="text-muted-foreground mt-1">
            Get intelligent help from your AI team members
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Assistant Selector */}
        <div className="w-72 flex flex-col gap-4">
          {assistants.map((assistant) => {
            const isActive = activeAssistant.id === assistant.id;
            return (
              <Card
                key={assistant.id}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  isActive
                    ? 'border-primary/50 shadow-md ring-1 ring-primary/20'
                    : 'hover:border-border hover:shadow-sm'
                )}
                onClick={() => setActiveAssistant(assistant)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-lg p-2', assistant.bgColor)}>
                      <assistant.icon className={cn('h-5 w-5', assistant.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{assistant.name}</h3>
                      <p className="text-sm text-muted-foreground">{assistant.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col border border-border rounded-xl bg-card overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <div className={cn('rounded-lg p-2.5', activeAssistant.bgColor)}>
              <activeAssistant.icon className={cn('h-6 w-6', activeAssistant.color)} />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{activeAssistant.name}</h2>
              <p className="text-sm text-muted-foreground">{activeAssistant.description}</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {localMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className={cn('rounded-full p-4 mb-4', activeAssistant.bgColor)}>
                  <activeAssistant.icon className={cn('h-8 w-8', activeAssistant.color)} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Start a conversation with {activeAssistant.name}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {activeAssistant.description}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {activeAssistant.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="space-y-2 w-full max-w-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                    <Lightbulb className="h-4 w-4" />
                    Try these suggestions:
                  </p>
                  {activeAssistant.suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Sparkles className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                      <span className="truncate">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {localMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isStreaming && localMessages[localMessages.length - 1]?.content === '' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder={`Ask ${activeAssistant.name} anything...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isStreaming}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isStreaming}>
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
