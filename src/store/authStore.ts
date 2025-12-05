import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'developer' | 'creative' | 'marketing';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  external_persona?: string;
  avatar_url?: string;
  availability_status: 'available' | 'busy' | 'away' | 'offline';
  current_bandwidth: number;
  skills: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      profile: null,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),

      fetchProfile: async (userId: string) => {
        try {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (profileError) throw profileError;

          // Fetch user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

          if (roleError) throw roleError;

          if (profileData) {
            const profile: Profile = {
              id: profileData.id,
              email: profileData.email,
              full_name: profileData.full_name,
              role: (roleData?.role as UserRole) || 'developer',
              external_persona: profileData.external_persona || undefined,
              avatar_url: profileData.avatar_url || undefined,
              availability_status: profileData.availability_status || 'available',
              current_bandwidth: profileData.current_bandwidth || 0,
              skills: profileData.skills || [],
            };
            set({ profile });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Set up auth state listener
          supabase.auth.onAuthStateChange(
            (event, session) => {
              set({ 
                session, 
                user: session?.user ?? null,
                isAuthenticated: !!session?.user 
              });
              
              // Defer profile fetch to avoid deadlock
              if (session?.user) {
                setTimeout(() => {
                  get().fetchProfile(session.user.id);
                }, 0);
              } else {
                set({ profile: null });
              }
            }
          );

          // Check for existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
          }
          
          set({ 
            session: session ?? null, 
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            isLoading: false 
          });

          if (session?.user) {
            await get().fetchProfile(session.user.id);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          await get().fetchProfile(data.user.id);
        }
      },

      signup: async (email: string, password: string, fullName: string) => {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Update the profile with the full name
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', data.user.id);
            
          await get().fetchProfile(data.user.id);
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          isAuthenticated: false, 
          user: null, 
          session: null, 
          profile: null 
        });
      },
    }),
    {
      name: 'skybeam-auth',
      partialize: (state) => ({}), // Don't persist anything, rely on Supabase session
    }
  )
);
