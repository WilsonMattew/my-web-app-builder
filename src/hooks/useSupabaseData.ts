import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Client = Tables['clients']['Row'];
type Project = Tables['projects']['Row'];
type Task = Tables['tasks']['Row'];
type Profile = Tables['profiles']['Row'];
type Conversation = Tables['conversations']['Row'];
type Message = Tables['messages']['Row'];

// ==================== CLIENTS ====================
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: Tables['clients']['Insert']) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables['clients']['Update']>) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
}

// ==================== PROJECTS ====================
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            id,
            name,
            company
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (project: Omit<Tables['projects']['Insert'], 'created_by'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, created_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables['projects']['Update']>) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });
}

// ==================== TASKS ====================
export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name
          ),
          assigned_user:profiles!tasks_assigned_to_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUserTasks() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['tasks', 'user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name
          )
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (task: Omit<Tables['tasks']['Insert'], 'created_by'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, created_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables['tasks']['Update']>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}

// ==================== PROFILES ====================
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables['profiles']['Update']>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

// ==================== AI CONVERSATIONS ====================
type AssistantType = 'oracle' | 'aether' | 'muse' | 'ascend';

export function useConversations(assistantType?: AssistantType) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['conversations', assistantType, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (assistantType) {
        query = query.eq('assistant_type', assistantType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user?.id,
  });
}

export function useConversationMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ assistant_type, title }: { assistant_type: 'oracle' | 'aether' | 'muse' | 'ascend'; title?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          assistant_type,
          title: title || `New conversation with ${assistant_type}`,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create conversation: ${error.message}`);
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversation_id, role, content }: { conversation_id: string; role: 'user' | 'assistant'; content: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id,
          role,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversation_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}

// ==================== DASHBOARD STATS ====================
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [projectsResult, tasksResult, clientsResult] = await Promise.all([
        supabase.from('projects').select('id, status, budget, spent'),
        supabase.from('tasks').select('id, status'),
        supabase.from('clients').select('id, status, total_value'),
      ]);
      
      if (projectsResult.error) throw projectsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (clientsResult.error) throw clientsResult.error;
      
      const projects = projectsResult.data || [];
      const tasks = tasksResult.data || [];
      const clients = clientsResult.data || [];
      
      const activeProjects = projects.filter(p => p.status === 'in_progress').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (Number(p.spent) || 0), 0);
      
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = tasks.filter(t => t.status === 'blocked').length;
      
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      const leads = clients.filter(c => c.status === 'lead').length;
      const pipelineValue = clients.reduce((sum, c) => sum + (Number(c.total_value) || 0), 0);
      
      return {
        revenue: {
          current: totalSpent,
          target: totalBudget,
        },
        projects: {
          total: projects.length,
          active: activeProjects,
          completed: completedProjects,
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          overdue: overdueTasks,
        },
        clients: {
          total: totalClients,
          active: activeClients,
          leads,
          pipelineValue,
        },
        team: {
          utilization: 72,
        },
      };
    },
  });
}
