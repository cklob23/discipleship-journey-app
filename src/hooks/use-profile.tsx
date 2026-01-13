import React, { createContext, useContext, useEffect, useState } from 'react';
import { blink } from '@/lib/blink';

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  role: 'leader' | 'learner';
  avatarUrl?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (userParam?: any) => {
    try {
      const user = userParam || (await blink.auth.me()).user;
      if (user) {
        const profiles = await blink.db.profiles.list({
          where: { userId: user.id }
        });
        if (profiles.length > 0) {
          setProfile(profiles[0] as unknown as Profile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      // Only log if it's not a "not authenticated" error
      if (!(error instanceof Error && error.message.includes('Not authenticated'))) {
        console.error('Error fetching profile:', error);
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.isLoading) return;
      
      if (state.user) {
        refreshProfile(state.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await blink.auth.signOut();
    setProfile(null);
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
