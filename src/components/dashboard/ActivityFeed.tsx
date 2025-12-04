import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, MessageSquare, FolderPlus, UserPlus, Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: 'task_completed' | 'message' | 'project_created' | 'client_added' | 'time_logged';
  user: string;
  description: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    user: 'Jordan Chen',
    description: 'completed "Implement responsive navigation"',
    timestamp: '10 min ago',
  },
  {
    id: '2',
    type: 'message',
    user: 'Taylor Kim',
    description: 'replied to TechFlow Solutions on WhatsApp',
    timestamp: '25 min ago',
  },
  {
    id: '3',
    type: 'project_created',
    user: 'Alex Morgan',
    description: 'created new project "Nordic Design Rebrand"',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'client_added',
    user: 'Taylor Kim',
    description: 'added new lead "Vertex Labs"',
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    type: 'time_logged',
    user: 'Sam Rivera',
    description: 'logged 4h on "Logo concepts - Round 1"',
    timestamp: '3 hours ago',
  },
];

const activityIcons = {
  task_completed: CheckCircle,
  message: MessageSquare,
  project_created: FolderPlus,
  client_added: UserPlus,
  time_logged: Clock,
};

const activityColors = {
  task_completed: 'bg-success/10 text-success',
  message: 'bg-info/10 text-info',
  project_created: 'bg-primary/10 text-primary',
  client_added: 'bg-ascend/10 text-ascend',
  time_logged: 'bg-warning/10 text-warning',
};

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-1">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={cn('rounded-full p-2', activityColors[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.description}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
