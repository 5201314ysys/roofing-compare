'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User, SubscriptionTier } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscription: SubscriptionTier;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  updateSubscription: (tier: SubscriptionTier) => void;
  canUnlockPrices: () => boolean;
  canExportData: () => boolean;
  canAccessApi: () => boolean;
  hasSearchesRemaining: () => boolean;
  incrementSearchCount: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Subscription limits configuration
const SUBSCRIPTION_LIMITS = {
  free: {
    searches_per_month: 10,
    price_unlocks: 0,
    saved_companies: 5,
    export_enabled: false,
    api_access: false,
  },
  basic: {
    searches_per_month: 100,
    price_unlocks: 20,
    saved_companies: 50,
    export_enabled: false,
    api_access: false,
  },
  pro: {
    searches_per_month: 1000,
    price_unlocks: -1, // unlimited
    saved_companies: 500,
    export_enabled: true,
    api_access: false,
  },
  enterprise: {
    searches_per_month: -1, // unlimited
    price_unlocks: -1,
    saved_companies: -1,
    export_enabled: true,
    api_access: true,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from Supabase
  const loadUserData = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load user data:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name || authUser.email?.split('@')[0] || '',
          avatar_url: data.avatar_url,
          subscription: data.subscription_tier as SubscriptionTier,
          subscription_expires_at: data.subscription_expires_at,
          stripe_customer_id: data.stripe_customer_id,
          createdAt: data.created_at,
          searchesThisMonth: data.searches_this_month || 0,
          savedCompanies: [],
          phone: data.phone,
          company: data.company,
        } as User;
      }

      // User not found, create new user
      const newUserData = {
        auth_id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        subscription_tier: 'free',
        searches_this_month: 0,
      };

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return null;
      }

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        subscription: 'free' as SubscriptionTier,
        createdAt: newUser.created_at,
        searchesThisMonth: 0,
        savedCompanies: [],
      } as User;
    } catch (err) {
      console.error('Error loading user data:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setSupabaseUser(currentSession.user);
          const userData = await loadUserData(currentSession.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setSupabaseUser(newSession?.user || null);

        if (newSession?.user) {
          const userData = await loadUserData(newSession.user);
          setUser(userData);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const userData = await loadUserData(data.user);
        setUser(userData);
      }

      return {};
    } catch (err) {
      return { error: 'Login failed, please try again' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up
  const signup = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const userData = await loadUserData(data.user);
        setUser(userData);
      }

      return {};
    } catch (err) {
      return { error: 'Sign up failed, please try again' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    if (supabaseUser) {
      const userData = await loadUserData(supabaseUser);
      setUser(userData);
    }
  };

  // Update subscription
  const updateSubscription = (tier: SubscriptionTier) => {
    if (user) {
      setUser({ ...user, subscription: tier });
    }
  };

  // Permission check
  const canUnlockPrices = () => {
    if (!user) return false;
    const limits = SUBSCRIPTION_LIMITS[user.subscription];
    if (limits.price_unlocks === -1) return true;
    return limits.price_unlocks > 0;
  };

  const canExportData = () => {
    if (!user) return false;
    return SUBSCRIPTION_LIMITS[user.subscription].export_enabled;
  };

  const canAccessApi = () => {
    if (!user) return false;
    return SUBSCRIPTION_LIMITS[user.subscription].api_access;
  };

  const hasSearchesRemaining = () => {
    if (!user) return true; // Allow unauthenticated users to search
    const limits = SUBSCRIPTION_LIMITS[user.subscription];
    if (limits.searches_per_month === -1) return true;
    return user.searchesThisMonth < limits.searches_per_month;
  };

  const incrementSearchCount = async () => {
    if (user) {
      const newCount = user.searchesThisMonth + 1;
      setUser({ ...user, searchesThisMonth: newCount });

      // Update database
      await supabase
        .from('users')
        .update({ searches_this_month: newCount, last_search_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    isLoading,
    isAuthenticated: !!user,
    subscription: user?.subscription || 'free',
    login,
    logout,
    signup,
    updateSubscription,
    canUnlockPrices,
    canExportData,
    canAccessApi,
    hasSearchesRemaining,
    incrementSearchCount,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
