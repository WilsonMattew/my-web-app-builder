import { useState } from 'react';
import { useProjects, useClients, useCreateProject } from '@/hooks/useSupabaseData';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, LayoutGrid, List, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusFilters = [
  { value: 'all', label: 'All Projects' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'planning', label: 'Planning' },
  { value: 'review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client_id: '',
    budget: '',
    deadline: '',
  });

  const { data: projects, isLoading } = useProjects();
  const { data: clients } = useClients();
  const createProject = useCreateProject();

  const filteredProjects = (projects || []).filter((project: any) => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clients?.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectsByStatus = {
    in_progress: filteredProjects.filter((p: any) => p.status === 'in_progress'),
    planning: filteredProjects.filter((p: any) => p.status === 'planning'),
    review: filteredProjects.filter((p: any) => p.status === 'review'),
    completed: filteredProjects.filter((p: any) => p.status === 'completed'),
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;
    
    await createProject.mutateAsync({
      name: newProject.name,
      description: newProject.description || null,
      client_id: newProject.client_id || null,
      budget: newProject.budget ? parseFloat(newProject.budget) : null,
      deadline: newProject.deadline || null,
      status: 'planning',
      progress: 0,
    });
    
    setNewProject({ name: '', description: '', client_id: '', budget: '', deadline: '' });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects in one place
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={newProject.client_id}
                  onValueChange={(value) => setNewProject({ ...newProject, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients || []).map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={createProject.isPending}>
                {createProject.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Tabs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredProjects.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({projectsByStatus.in_progress.length})
            </TabsTrigger>
            <TabsTrigger value="review">
              In Review ({projectsByStatus.review.length})
            </TabsTrigger>
            <TabsTrigger value="planning">
              Planning ({projectsByStatus.planning.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ProjectGrid projects={filteredProjects} viewMode={viewMode} />
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            <ProjectGrid projects={projectsByStatus.in_progress} viewMode={viewMode} />
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <ProjectGrid projects={projectsByStatus.review} viewMode={viewMode} />
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <ProjectGrid projects={projectsByStatus.planning} viewMode={viewMode} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ProjectGrid({
  projects,
  viewMode,
}: {
  projects: any[];
  viewMode: 'grid' | 'list';
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      )}
    >
      {projects.map((project: any, index: number) => (
        <div
          key={project.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProjectCard project={{
            id: project.id,
            project_name: project.name,
            status: project.status === 'in_progress' ? 'active' : project.status,
            progress: project.progress,
            deadline: project.deadline,
            budget: Number(project.budget) || 0,
            client: project.clients ? {
              company_name: project.clients.company || project.clients.name
            } : undefined
          }} />
        </div>
      ))}
    </div>
  );
}
