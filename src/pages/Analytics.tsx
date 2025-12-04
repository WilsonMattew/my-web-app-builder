import { mockAnalytics, mockProjects, mockClients } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  FolderKanban,
  Clock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const projectTypeData = [
  { name: 'Website', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Branding', value: 25, color: 'hsl(var(--success))' },
  { name: 'Social Media', value: 20, color: 'hsl(var(--warning))' },
  { name: 'SEO', value: 10, color: 'hsl(var(--info))' },
];

const teamPerformance = [
  { name: 'Alex', hours: 142, utilization: 85 },
  { name: 'Jordan', hours: 156, utilization: 92 },
  { name: 'Sam', hours: 138, utilization: 78 },
  { name: 'Taylor', hours: 124, utilization: 68 },
];

const monthlyProjects = [
  { month: 'Aug', completed: 3, started: 4 },
  { month: 'Sep', completed: 5, started: 3 },
  { month: 'Oct', completed: 4, started: 6 },
  { month: 'Nov', completed: 6, started: 4 },
  { month: 'Dec', completed: 5, started: 5 },
  { month: 'Jan', completed: 7, started: 8 },
];

export default function Analytics() {
  const totalRevenue = mockAnalytics.revenue.current;
  const targetRevenue = mockAnalytics.revenue.target;
  const revenueProgress = (totalRevenue / targetRevenue) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track performance metrics and business insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+29%</span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="rounded-lg bg-primary/20 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold mt-1">{mockAnalytics.projects.active}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {mockAnalytics.projects.completed} completed this month
                </p>
              </div>
              <div className="rounded-lg bg-success/20 p-3">
                <FolderKanban className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold mt-1">{mockClients.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+12%</span>
                </div>
              </div>
              <div className="rounded-lg bg-info/20 p-3">
                <Users className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Utilization</p>
                <p className="text-3xl font-bold mt-1">{mockAnalytics.team.utilization}%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Avg. bandwidth {mockAnalytics.team.avgBandwidth}%
                </p>
              </div>
              <div className="rounded-lg bg-warning/20 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Revenue Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">${totalRevenue.toLocaleString()}</span>
              <span className="text-muted-foreground">
                of ${targetRevenue.toLocaleString()} target
              </span>
            </div>
            <Progress value={revenueProgress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {revenueProgress.toFixed(0)}% of monthly goal achieved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardContent className="pt-6">
            <RevenueChart />
          </CardContent>
        </Card>

        {/* Project Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {projectTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProjects}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="started" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {member.hours}h · {member.utilization}% util.
                    </span>
                  </div>
                  <Progress
                    value={member.utilization}
                    className={cn(
                      'h-2',
                      member.utilization >= 90 && '[&>div]:bg-warning',
                      member.utilization >= 100 && '[&>div]:bg-destructive'
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
