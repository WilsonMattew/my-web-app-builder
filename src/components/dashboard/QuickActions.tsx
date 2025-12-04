import { Button } from '@/components/ui/button';
import { Plus, FolderPlus, UserPlus, MessageSquare, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'primary' | 'success' | 'info' | 'warning';
  onClick?: () => void;
}

const actions: QuickAction[] = [
  { label: 'New Task', icon: Plus, variant: 'primary' },
  { label: 'New Project', icon: FolderPlus, variant: 'success' },
  { label: 'Add Client', icon: UserPlus, variant: 'info' },
  { label: 'Ask AI', icon: Brain, variant: 'warning' },
];

const variantStyles = {
  primary: 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20',
  success: 'bg-success/10 hover:bg-success/20 text-success border-success/20',
  info: 'bg-info/10 hover:bg-info/20 text-info border-info/20',
  warning: 'bg-oracle/10 hover:bg-oracle/20 text-oracle border-oracle/20',
};

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className={cn(
            'h-auto py-4 flex-col gap-2 transition-all duration-200',
            variantStyles[action.variant]
          )}
          onClick={action.onClick}
        >
          <action.icon className="h-5 w-5" />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
