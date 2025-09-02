import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role key for admin operations)
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const getUserProfileProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', input.userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        profile,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  });

export const updateUserProfileProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    name: z.string().optional(),
    avatar_url: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .update({
          name: input.name,
          avatar_url: input.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        profile,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  });

export const getAllUsersProcedure = publicProcedure
  .query(async () => {
    try {
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        profiles: profiles || [],
        count: profiles?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        profiles: [],
        count: 0,
      };
    }
  });