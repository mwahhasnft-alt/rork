import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContextType, User, SignInData, SignUpData } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export const [AuthProvider, useAuth] = createContextHook((): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  const isAuthenticated = user !== null && session !== null;

  const loadUserProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Load profile error:', error);
        return;
      }
      
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Load profile error:', error);
    }
  }, []);

  const signIn = useCallback(async (data: SignInData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (authData.user) {
        await loadUserProfile(authData.user.id);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const signUp = useCallback(async (data: SignUpData): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || data.email.split('@')[0],
          },
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (authData.user) {
        // Create profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name || data.email.split('@')[0],
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
        
        await loadUserProfile(authData.user.id);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      await loadUserProfile(user.id);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [user, loadUserProfile]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password',
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }, []);



  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  return useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  }), [user, isAuthenticated, isLoading, signIn, signUp, signOut, updateProfile, resetPassword]);
});

// Hook to get the current session
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  return session;
};