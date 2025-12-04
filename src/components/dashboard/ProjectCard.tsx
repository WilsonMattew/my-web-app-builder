import { Project } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const statusColors = {
  pending: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success border-success/20',
  on_hold: 'bg-warning/10 text-warning border-warning/20',
  review: 'bg-info/10 text-info border-info/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300',
        'hover:shadow-lg hover:border-primary/30 cursor-pointer'
      )}
    >
      {/* Priority indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 w-1 h-full',
          project.priority === 'urgent' && 'bg-destructive',
          project.priority === 'high' && 'bg-warning',
          project.priority === 'medium' && 'bg-info',
          project.priority === 'low' && 'bg-muted-foreground'
        )}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {project.project_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {project.client?.company_name}
            </p>
          </div>
          <Badge variant="outline" className={cn('capitalize shrink-0', statusColors[project.status])}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress_percentage}%</span>
          </div>
          <Progress value={project.progress_percentage} className="h-2" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(parseISO(project.deadline), 'MMM d')}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-success" />
            <span>{project.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
