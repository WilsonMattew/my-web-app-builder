import { useState } from 'react';
import { mockProjects, Project } from '@/lib/mockData';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusFilters = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectsByStatus = {
    active: filteredProjects.filter((p) => p.status === 'active'),
    pending: filteredProjects.filter((p) => p.status === 'pending'),
    review: filteredProjects.filter((p) => p.status === 'review'),
    completed: filteredProjects.filter((p) => p.status === 'completed'),
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
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
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({projectsByStatus.active.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            In Review ({projectsByStatus.review.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({projectsByStatus.pending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ProjectGrid projects={filteredProjects} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ProjectGrid projects={projectsByStatus.active} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <ProjectGrid projects={projectsByStatus.review} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <ProjectGrid projects={projectsByStatus.pending} viewMode={viewMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectGrid({
  projects,
  viewMode,
}: {
  projects: Project[];
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
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
