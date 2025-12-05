import { useAuthStore } from '@/store/authStore';
import { useDashboardStats, useProjects, useUserTasks, useTasks } from '@/hooks/useSupabaseData';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import {
  DollarSign,
  FolderKanban,
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: allTasks } = useTasks();
  const { data: userTasks } = useUserTasks();
  
  const isAdmin = profile?.role === 'admin';
  const isMarketing = profile?.role === 'marketing';

  // Get active projects
  const activeProjects = projects?.filter((p: any) => p.status === 'in_progress').slice(0, 3) || [];

  // Get tasks to display
  const displayTasks = isAdmin 
    ? (allTasks?.filter((t: any) => t.status !== 'completed').slice(0, 5) || [])
    : (userTasks?.filter((t: any) => t.status !== 'completed').slice(0, 5) || []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Good {getTimeOfDay()}, {profile?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            {(isAdmin || isMarketing) && (
              <StatCard
                title="Pipeline Value"
                value={`$${(stats?.clients.pipelineValue || 0).toLocaleString()}`}
                subtitle={`Budget: $${(stats?.revenue.target || 0).toLocaleString()}`}
                icon={DollarSign}
                trend={{ value: 29, isPositive: true }}
                variant="primary"
              />
            )}
            <StatCard
              title="Active Projects"
              value={stats?.projects.active || 0}
              subtitle={`${stats?.projects.completed || 0} completed`}
              icon={FolderKanban}
              variant="success"
            />
            {(isAdmin || isMarketing) && (
              <StatCard
                title="Total Clients"
                value={stats?.clients.total || 0}
                subtitle={`${stats?.clients.leads || 0} new leads`}
                icon={Users}
                trend={{ value: 12, isPositive: true }}
                variant="info"
              />
            )}
            <StatCard
              title="Tasks Completed"
              value={stats?.tasks.completed || 0}
              subtitle={`${stats?.tasks.overdue || 0} blocked`}
              icon={CheckSquare}
              variant={(stats?.tasks.overdue || 0) > 0 ? 'warning' : 'default'}
            />
            <StatCard
              title="Team Utilization"
              value={`${stats?.team.utilization || 0}%`}
              subtitle="Avg. bandwidth"
              icon={TrendingUp}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Full width on smaller screens, 2/3 on large */}
        {(isAdmin || isMarketing) && (
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <RevenueChart />
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        <Card className={isAdmin || isMarketing ? '' : 'lg:col-span-2'}>
          <CardContent className="pt-6">
            <ActivityFeed />
          </CardContent>
        </Card>
      </div>

      {/* Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
            <button className="text-sm text-primary hover:underline">View all</button>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : activeProjects.length > 0 ? (
              <div className="grid gap-4">
                {activeProjects.map((project: any, index: number) => (
                  <div
                    key={project.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProjectCard project={{
                      id: project.id,
                      project_name: project.name,
                      status: project.status === 'in_progress' ? 'active' : project.status,
                      progress_percentage: project.progress || 0,
                      deadline: project.deadline,
                      budget: Number(project.budget) || 0,
                      client: project.clients ? {
                        company_name: project.clients.company || project.clients.name
                      } : undefined
                    }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No active projects</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              {isAdmin ? 'Recent Tasks' : 'My Tasks'}
            </CardTitle>
            <button className="text-sm text-primary hover:underline">View all</button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayTasks.length > 0 ? (
                displayTasks.map((task: any, index: number) => (
                  <div
                    key={task.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TaskItem task={{
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      priority: task.priority,
                      estimated_hours: task.estimated_hours,
                      actual_hours: task.actual_hours,
                      due_date: task.due_date,
                      assigned_to: task.assigned_to,
                      project_id: task.project_id,
                    }} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No pending tasks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
