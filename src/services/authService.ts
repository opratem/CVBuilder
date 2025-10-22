import { supabase } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  phone: string | null
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  error?: string
  needsVerification?: boolean
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  // Timeout wrapper to prevent hanging requests with improved timeout
  private async withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  // Retry mechanism for critical operations
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 2,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication errors
        if (lastError.message.includes('Invalid login credentials') ||
            lastError.message.includes('Email not confirmed')) {
          throw lastError;
        }

        if (attempt < maxRetries) {
          console.warn(`Auth attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError!;
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone || null
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (authData.user && !authData.session) {
        // User needs to verify email
        return {
          success: true,
          needsVerification: true,
          error: 'Please check your email and click the verification link to activate your account.'
        }
      }

      if (authData.user) {
        // Create user profile
        await this.createUserProfile(authData.user)

        const authUser = await this.mapToAuthUser(authData.user)
        return { success: true, user: authUser }
      }

      return { success: false, error: 'Unexpected error occurred' }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Sign in with email and password using retry mechanism
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      console.log('Attempting to sign in user:', data.email);

      const result = await this.withRetry(async () => {
        return await this.withTimeout(
          supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          }),
          6000
        );
      });

      const { data: authData, error } = result;

      if (error) {
        console.error('Sign in error:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email before signing in' }
        }
        return { success: false, error: error.message }
      }

      if (authData.user) {
        console.log('Sign in successful for:', authData.user.email);
        const authUser = await this.mapToAuthUser(authData.user)
        return { success: true, user: authUser }
      }

      return { success: false, error: 'Unexpected error occurred' }
    } catch (error) {
      console.error('Sign in failed:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        return { success: false, error: 'Connection timeout. Please check your internet connection and try again.' }
      }
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  // Get current user with improved error handling
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('Checking current user session...');

      // Use retry mechanism for session check
      const sessionResult = await this.withRetry(async () => {
        return await this.withTimeout(
          supabase.auth.getSession(),
          6000 // Longer timeout for initial load
        );
      });

      const { data: { session }, error: sessionError } = sessionResult;

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return null;
      }

      if (!session) {
        console.log('No active session found');
        return null;
      }

      console.log('Active session found, getting user details...');

      // Get user details with retry
      const userResult = await this.withRetry(async () => {
        return await this.withTimeout(
          supabase.auth.getUser(),
          4000
        );
      });

      const { data: { user }, error: userError } = userResult;

      if (userError) {
        console.error('❌ User error:', userError);
        return null;
      }

      if (user) {
        console.log('User authenticated:', user.email);
        return await this.mapToAuthUser(user);
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);

      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          console.error('Supabase request timed out - this usually indicates network connectivity issues');
          console.error('Try refreshing the page or check your internet connection');
        } else if (error.message.includes('Failed to fetch')) {
          console.error('Network error - Supabase server may be unreachable');
        }
      }

      return null;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        error: 'Password reset email sent. Check your inbox for further instructions.'
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Resend verification email
  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        error: 'Verification email sent. Please check your inbox.'
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Update profile
  async updateProfile(updates: Partial<{ fullName: string; phone: string }>): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.fullName,
          phone: updates.phone
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Also update the profiles table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            phone: updates.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.mapToAuthUser(session.user)
        callback(authUser)
      } else {
        callback(null)
      }
    })
  }

  // Helper method to create user profile in profiles table
  private async createUserProfile(user: User): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            email_verified: user.email_confirmed_at !== null,
            phone_verified: user.phone_confirmed_at !== null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (error && !error.message.includes('duplicate key')) {
        console.error('Error creating user profile:', error)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  // Helper method to map Supabase user to AuthUser
  private async mapToAuthUser(user: User): Promise<AuthUser> {
    // Try to get additional profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      name: profile?.full_name || user.user_metadata?.full_name || null,
      phone: profile?.phone || user.user_metadata?.phone || null,
      emailVerified: user.email_confirmed_at !== null,
      phoneVerified: user.phone_confirmed_at !== null,
      createdAt: user.created_at
    }
  }
}

export const authService = new AuthService()
