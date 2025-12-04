import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Mock users for demonstration
const MOCK_USERS: Record<string, Profile> = {
  'admin@skybeam.studio': {
    id: '1',
    email: 'admin@skybeam.studio',
    full_name: 'Alex Morgan',
    role: 'admin',
    external_persona: 'SkyBeam Founder',
    avatar_url: '',
    availability_status: 'available',
    current_bandwidth: 65,
    skills: ['Strategy', 'Leadership', 'Business Development'],
  },
  'dev@skybeam.studio': {
    id: '2',
    email: 'dev@skybeam.studio',
    full_name: 'Jordan Chen',
    role: 'developer',
    external_persona: 'SkyBeam Developer Head',
    avatar_url: '',
    availability_status: 'available',
    current_bandwidth: 80,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  },
  'creative@skybeam.studio': {
    id: '3',
    email: 'creative@skybeam.studio',
    full_name: 'Sam Rivera',
    role: 'creative',
    external_persona: 'SkyBeam Creative Director',
    avatar_url: '',
    availability_status: 'busy',
    current_bandwidth: 90,
    skills: ['UI/UX Design', 'Branding', 'Motion Graphics'],
  },
  'marketing@skybeam.studio': {
    id: '4',
    email: 'marketing@skybeam.studio',
    full_name: 'Taylor Kim',
    role: 'marketing',
    external_persona: 'SkyBeam Marketing Lead',
    avatar_url: '',
    availability_status: 'available',
    current_bandwidth: 45,
    skills: ['Social Media', 'SEO', 'Content Strategy', 'Analytics'],
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      profile: null,
      setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const user = MOCK_USERS[email.toLowerCase()];
        if (user && password === 'demo123') {
          set({ isAuthenticated: true, profile: user });
        } else {
          throw new Error('Invalid credentials. Try admin@skybeam.studio with password demo123');
        }
      },
      logout: () => set({ isAuthenticated: false, profile: null }),
    }),
    {
      name: 'skybeam-auth',
    }
  )
);
