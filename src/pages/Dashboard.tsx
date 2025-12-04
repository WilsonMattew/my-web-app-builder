import { useAuthStore } from '@/store/authStore';
import { mockAnalytics, mockProjects, mockTasks } from '@/lib/mockData';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const isMarketing = profile?.role === 'marketing';

  // Filter tasks assigned to current user for non-admin roles
  const userTasks = isAdmin
    ? mockTasks.filter((t) => t.status !== 'completed').slice(0, 5)
    : mockTasks.filter((t) => t.assigned_to === profile?.id && t.status !== 'completed').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Good {getTimeOfDay()}, {profile?.full_name?.split(' ')[0]}
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
        {(isAdmin || isMarketing) && (
          <StatCard
            title="Monthly Revenue"
            value={`$${mockAnalytics.revenue.current.toLocaleString()}`}
            subtitle={`Target: $${mockAnalytics.revenue.target.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 29, isPositive: true }}
            variant="primary"
          />
        )}
        <StatCard
          title="Active Projects"
          value={mockAnalytics.projects.active}
          subtitle={`${mockAnalytics.projects.completed} completed this month`}
          icon={FolderKanban}
          variant="success"
        />
        {(isAdmin || isMarketing) && (
          <StatCard
            title="Total Clients"
            value={mockAnalytics.clients.total}
            subtitle={`${mockAnalytics.clients.leads} new leads`}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            variant="info"
          />
        )}
        <StatCard
          title="Tasks Completed"
          value={mockAnalytics.tasks.completed}
          subtitle={`${mockAnalytics.tasks.overdue} overdue`}
          icon={CheckSquare}
          variant={mockAnalytics.tasks.overdue > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Team Utilization"
          value={`${mockAnalytics.team.utilization}%`}
          subtitle="Avg. bandwidth"
          icon={TrendingUp}
          variant="default"
        />
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
            <div className="grid gap-4">
              {mockProjects
                .filter((p) => p.status === 'active')
                .slice(0, 3)
                .map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
            </div>
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
              {userTasks.length > 0 ? (
                userTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TaskItem task={task} />
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
