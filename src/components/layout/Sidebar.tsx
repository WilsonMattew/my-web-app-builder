import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore, UserRole } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Brain,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'developer', 'creative', 'marketing'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin', 'developer', 'creative', 'marketing'] },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['admin', 'developer', 'creative', 'marketing'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'marketing'] },
  { name: 'Communication', href: '/communication', icon: MessageSquare, roles: ['admin', 'developer', 'creative', 'marketing'] },
  { name: 'AI Assistants', href: '/ai', icon: Brain, roles: ['admin', 'developer', 'creative', 'marketing'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'marketing'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'developer', 'creative', 'marketing'] },
];

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const filteredNav = navigation.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold text-sidebar-foreground">
                SkyBeam
              </span>
              <span className="text-xs text-muted-foreground">Studio</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href;
            const NavLink = (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavLink;
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
