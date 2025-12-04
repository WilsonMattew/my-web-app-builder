import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Brain,
  Code,
  Palette,
  TrendingUp,
  Send,
  Sparkles,
  Lightbulb,
  Zap,
  MessageSquare,
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
  timestamp: Date;
}

export default function AIAssistants() {
  const [activeAssistant, setActiveAssistant] = useState<Assistant>(assistants[0]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const currentMessages = messages[activeAssistant.id] || [];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Simulate AI response
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I'm ${activeAssistant.name}, your ${activeAssistant.role}. This is a demo response to: "${input}"\n\nIn the full version, I would provide intelligent, contextual responses powered by Google Gemini AI. I can help you with ${activeAssistant.capabilities.join(', ').toLowerCase()}.`,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeAssistant.id]: [...(prev[activeAssistant.id] || []), userMessage, aiResponse],
    }));

    setInput('');
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
          <ScrollArea className="flex-1 p-4">
            {currentMessages.length === 0 ? (
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
                {currentMessages.map((message) => (
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
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
