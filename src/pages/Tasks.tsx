import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useProjects, useProfiles } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Loader2,
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimated_hours: '',
    due_date: '',
  });

  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: profiles } = useProfiles();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const filteredTasks = (tasks || []).filter((task: any) =>
    task.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter((task: any) => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, any[]>);

  const handleCreateTask = async () => {
    if (!newTask.title) return;
    
    await createTask.mutateAsync({
      title: newTask.title,
      description: newTask.description || null,
      project_id: newTask.project_id || null,
      assigned_to: newTask.assigned_to || null,
      priority: newTask.priority,
      estimated_hours: newTask.estimated_hours ? parseInt(newTask.estimated_hours) : null,
      due_date: newTask.due_date || null,
      status: 'todo',
    });
    
    setNewTask({ title: '', description: '', project_id: '', assigned_to: '', priority: 'medium', estimated_hours: '', due_date: '' });
    setIsDialogOpen(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask.mutateAsync({
      id: taskId,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    });
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={newTask.project_id}
                    onValueChange={(value) => setNewTask({ ...newTask, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projects || []).map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned">Assign To</Label>
                  <Select
                    value={newTask.assigned_to}
                    onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {(profiles || []).map((profile: any) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Est. Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    placeholder="0"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due">Due Date</Label>
                  <Input
                    id="due"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                {createTask.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
      {isLoading ? (
        <div className="flex gap-4">
          {columns.map((column) => (
            <Skeleton key={column.id} className="flex-shrink-0 w-80 h-96" />
          ))}
        </div>
      ) : (
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
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {(tasksByStatus[column.id] || []).map((task: any, index: number) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index}
                    onStatusChange={handleStatusChange}
                  />
                ))}

                {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks
                  </div>
                )}

                {/* Add Task Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ 
  task, 
  index,
  onStatusChange 
}: { 
  task: any; 
  index: number;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
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
            className={cn('shrink-0 capitalize text-xs', priorityColors[task.priority as keyof typeof priorityColors])}
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
