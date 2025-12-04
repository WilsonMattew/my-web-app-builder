// Mock data for demonstration purposes

export interface Client {
  id: string;
  company_name: string;
  industry: string;
  status: 'lead' | 'prospect' | 'active' | 'retainer' | 'churned' | 'paused';
  acquisition_source: string;
  estimated_value: number;
  logo_url?: string;
}

export interface Project {
  id: string;
  client_id: string;
  project_name: string;
  project_type: string;
  status: 'pending' | 'active' | 'on_hold' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress_percentage: number;
  deadline: string;
  budget: number;
  client?: Client;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface Conversation {
  id: string;
  client_id: string;
  platform_type: 'whatsapp' | 'instagram' | 'email';
  status: 'open' | 'pending' | 'resolved';
  last_message: string;
  last_message_at: string;
  unread_count: number;
  client?: Client;
}

export const mockClients: Client[] = [
  {
    id: '1',
    company_name: 'TechFlow Solutions',
    industry: 'Technology',
    status: 'active',
    acquisition_source: 'referral',
    estimated_value: 25000,
  },
  {
    id: '2',
    company_name: 'Green Earth Co.',
    industry: 'Sustainability',
    status: 'active',
    acquisition_source: 'instagram',
    estimated_value: 15000,
  },
  {
    id: '3',
    company_name: 'Urban Fitness',
    industry: 'Health & Fitness',
    status: 'retainer',
    acquisition_source: 'whatsapp',
    estimated_value: 8000,
  },
  {
    id: '4',
    company_name: 'Artisan Coffee',
    industry: 'Food & Beverage',
    status: 'prospect',
    acquisition_source: 'website',
    estimated_value: 12000,
  },
  {
    id: '5',
    company_name: 'Nordic Design Studio',
    industry: 'Design',
    status: 'lead',
    acquisition_source: 'instagram',
    estimated_value: 20000,
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    client_id: '1',
    project_name: 'Website Redesign',
    project_type: 'website',
    status: 'active',
    priority: 'high',
    progress_percentage: 65,
    deadline: '2024-02-15',
    budget: 18000,
    client: mockClients[0],
  },
  {
    id: '2',
    client_id: '2',
    project_name: 'Brand Identity',
    project_type: 'branding',
    status: 'active',
    priority: 'medium',
    progress_percentage: 40,
    deadline: '2024-02-28',
    budget: 12000,
    client: mockClients[1],
  },
  {
    id: '3',
    client_id: '3',
    project_name: 'Social Media Management',
    project_type: 'social_media',
    status: 'active',
    priority: 'medium',
    progress_percentage: 80,
    deadline: '2024-01-31',
    budget: 5000,
    client: mockClients[2],
  },
  {
    id: '4',
    client_id: '1',
    project_name: 'SEO Optimization',
    project_type: 'seo',
    status: 'pending',
    priority: 'low',
    progress_percentage: 0,
    deadline: '2024-03-15',
    budget: 7000,
    client: mockClients[0],
  },
  {
    id: '5',
    client_id: '4',
    project_name: 'E-commerce Platform',
    project_type: 'website',
    status: 'review',
    priority: 'urgent',
    progress_percentage: 95,
    deadline: '2024-01-20',
    budget: 22000,
    client: mockClients[3],
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Design homepage wireframes',
    description: 'Create low-fidelity wireframes for the new homepage layout',
    status: 'completed',
    priority: 'high',
    assigned_to: '3',
    due_date: '2024-01-10',
    estimated_hours: 8,
    actual_hours: 10,
  },
  {
    id: '2',
    project_id: '1',
    title: 'Implement responsive navigation',
    description: 'Build the responsive navigation component with mobile menu',
    status: 'in_progress',
    priority: 'high',
    assigned_to: '2',
    due_date: '2024-01-15',
    estimated_hours: 12,
    actual_hours: 6,
  },
  {
    id: '3',
    project_id: '1',
    title: 'Setup CI/CD pipeline',
    status: 'todo',
    priority: 'medium',
    assigned_to: '2',
    due_date: '2024-01-20',
    estimated_hours: 4,
  },
  {
    id: '4',
    project_id: '2',
    title: 'Logo concepts - Round 1',
    status: 'review',
    priority: 'high',
    assigned_to: '3',
    due_date: '2024-01-12',
    estimated_hours: 16,
    actual_hours: 14,
  },
  {
    id: '5',
    project_id: '3',
    title: 'January content calendar',
    status: 'completed',
    priority: 'medium',
    assigned_to: '4',
    due_date: '2024-01-05',
    estimated_hours: 6,
    actual_hours: 5,
  },
  {
    id: '6',
    project_id: '5',
    title: 'Payment integration testing',
    status: 'blocked',
    priority: 'urgent',
    assigned_to: '2',
    due_date: '2024-01-18',
    estimated_hours: 8,
    actual_hours: 4,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    client_id: '1',
    platform_type: 'whatsapp',
    status: 'open',
    last_message: 'When can we expect the first design mockups?',
    last_message_at: '2024-01-14T10:30:00Z',
    unread_count: 2,
    client: mockClients[0],
  },
  {
    id: '2',
    client_id: '4',
    platform_type: 'instagram',
    status: 'open',
    last_message: 'Love the e-commerce design! Just a few tweaks needed',
    last_message_at: '2024-01-14T09:15:00Z',
    unread_count: 1,
    client: mockClients[3],
  },
  {
    id: '3',
    client_id: '2',
    platform_type: 'email',
    status: 'pending',
    last_message: 'Please review the attached brand guidelines document',
    last_message_at: '2024-01-13T16:45:00Z',
    unread_count: 0,
    client: mockClients[1],
  },
];

export const mockAnalytics = {
  revenue: {
    current: 67500,
    previous: 52000,
    target: 75000,
  },
  projects: {
    active: 5,
    completed: 12,
    onHold: 2,
  },
  clients: {
    total: 18,
    active: 12,
    leads: 6,
  },
  team: {
    utilization: 78,
    avgBandwidth: 70,
  },
  tasks: {
    completed: 45,
    inProgress: 12,
    overdue: 3,
  },
};
