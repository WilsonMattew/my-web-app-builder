import { useState } from 'react';
import { mockTasks, Task } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Pause,
} from 'lucide-react';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'blocked' | 'completed';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-muted-foreground' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-info' },
  { id: 'review', title: 'Review', icon: AlertCircle, color: 'text-warning' },
  { id: 'blocked', title: 'Blocked', icon: Pause, color: 'text-destructive' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-success' },
];

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState(mockTasks);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Organize and track your work with Kanban board
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-muted/30 rounded-xl p-4"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <column.icon className={cn('h-5 w-5', column.color)} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {tasksByStatus[column.id].length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {tasksByStatus[column.id].map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}

              {tasksByStatus[column.id].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks
                </div>
              )}

              {/* Add Task Button */}
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-primary/30 animate-slide-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          <Badge
            variant="outline"
            className={cn('shrink-0 capitalize text-xs', priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          {task.estimated_hours && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {task.actual_hours || 0}h / {task.estimated_hours}h
              </span>
            </div>
          )}
          {task.due_date && (
            <span className="text-xs text-muted-foreground">
              Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
