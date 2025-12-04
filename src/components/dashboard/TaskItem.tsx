import { Task } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle?: () => void;
}

const statusIcons = {
  todo: null,
  in_progress: Clock,
  review: AlertCircle,
  blocked: AlertCircle,
  completed: CheckCircle2,
};

const statusColors = {
  todo: 'text-muted-foreground',
  in_progress: 'text-info',
  review: 'text-warning',
  blocked: 'text-destructive',
  completed: 'text-success',
};

const priorityBadgeColors = {
  low: 'bg-muted/50 text-muted-foreground border-transparent',
  medium: 'bg-info/10 text-info border-info/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const StatusIcon = statusIcons[task.status];

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 transition-all duration-200',
        'hover:bg-card hover:shadow-sm',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={onToggle}
        className="h-5 w-5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-medium truncate',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h4>
          {StatusIcon && (
            <StatusIcon className={cn('h-4 w-4 shrink-0', statusColors[task.status])} />
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      <Badge variant="outline" className={cn('shrink-0 capitalize', priorityBadgeColors[task.priority])}>
        {task.priority}
      </Badge>
    </div>
  );
}
