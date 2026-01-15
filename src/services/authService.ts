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
  errorType?: 'network' | 'cors' | 'auth' | 'validation' | 'timeout' | 'server' | 'unknown'
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

// Error categories for better user feedback
type ErrorCategory = 'network' | 'cors' | 'auth' | 'validation' | 'timeout' | 'server' | 'unknown'

interface ParsedError {
  message: string
  category: ErrorCategory
  technicalDetails?: string
}

class AuthService {
  // Parse and categorize errors for better user feedback
  private parseError(error: unknown): ParsedError {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const lowerMessage = errorMessage.toLowerCase()

    // Network/CORS errors - these often come with "Failed to fetch" or "NetworkError"
    if (
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('networkerror') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('net::err_') ||
      lowerMessage.includes('cors') ||
      lowerMessage.includes('cross-origin') ||
      lowerMessage.includes('load failed')
    ) {
      return {
        message: 'Unable to connect to the authentication server. This could be due to:\n• Network connectivity issues\n• The service being temporarily unavailable\n• Browser security settings blocking the request\n\nPlease check your internet connection and try again.',
        category: 'network',
        technicalDetails: errorMessage
      }
    }

    // Timeout errors
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return {
        message: 'The request took too long to complete. This usually indicates a slow or unstable internet connection. Please check your connection and try again.',
        category: 'timeout',
        technicalDetails: errorMessage
      }
    }

    // Authentication-specific errors
    if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid password')) {
      return {
        message: 'Invalid email or password. Please check your credentials and try again.',
        category: 'auth'
      }
    }

    if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('email not verified')) {
      return {
        message: 'Please verify your email address before signing in. Check your inbox (and spam folder) for the verification link.',
        category: 'validation'
      }
    }

    if (lowerMessage.includes('user already registered') || lowerMessage.includes('already exists')) {
      return {
        message: 'An account with this email already exists. Please sign in instead, or use a different email address.',
        category: 'validation'
      }
    }

    if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
      return {
        message: 'Your password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.',
        category: 'validation'
      }
    }

    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
      return {
        message: 'Too many attempts. Please wait a few minutes before trying again.',
        category: 'server'
      }
    }

    // Server errors
    if (lowerMessage.includes('500') || lowerMessage.includes('internal server') || lowerMessage.includes('service unavailable')) {
      return {
        message: 'The authentication service is temporarily unavailable. Please try again in a few minutes.',
        category: 'server',
        technicalDetails: errorMessage
      }
    }

    // Unknown errors - provide generic but helpful message
    return {
      message: 'An unexpected error occurred. Please try again. If the problem persists, check your internet connection or try again later.',
      category: 'unknown',
      technicalDetails: errorMessage
    }
  }

  // Timeout wrapper to prevent hanging requests with improved timeout
  private async withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
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
        const parsedError = this.parseError(error);

        // Don't retry on authentication/validation errors
        if (parsedError.category === 'auth' || parsedError.category === 'validation') {
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
      console.log('Attempting to sign up user:', data.email);

      const { data: authData, error } = await this.withTimeout(
        supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone || null
            }
          }
        }),
        15000
      );

      if (error) {
        console.error('Sign up error:', error.message);
        const parsedError = this.parseError(error);
        return {
          success: false,
          error: parsedError.message,
          errorType: parsedError.category
        }
      }

      if (authData.user && !authData.session) {
        // User needs to verify email
        console.log('Sign up successful, email verification required');
        return {
          success: true,
          needsVerification: true,
          error: 'Please check your email and click the verification link to activate your account.'
        }
      }

      if (authData.user) {
        console.log('Sign up successful for:', authData.user.email);
        // Create user profile
        await this.createUserProfile(authData.user)

        const authUser = await this.mapToAuthUser(authData.user)
        return { success: true, user: authUser }
      }

      return { success: false, error: 'Unexpected error occurred', errorType: 'unknown' }
    } catch (error) {
      console.error('Sign up failed:', error);
      const parsedError = this.parseError(error);
      return {
        success: false,
        error: parsedError.message,
        errorType: parsedError.category
      }
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
          10000
        );
      });

      const { data: authData, error } = result;

      if (error) {
        console.error('Sign in error:', error.message);
        const parsedError = this.parseError(error);
        return {
          success: false,
          error: parsedError.message,
          errorType: parsedError.category
        }
      }

      if (authData.user) {
        console.log('Sign in successful for:', authData.user.email);
        const authUser = await this.mapToAuthUser(authData.user)
        return { success: true, user: authUser }
      }

      return { success: false, error: 'Unexpected error occurred', errorType: 'unknown' }
    } catch (error) {
      console.error('Sign in failed:', error);
      const parsedError = this.parseError(error);
      return {
        success: false,
        error: parsedError.message,
        errorType: parsedError.category
      }
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
          8000
        );
      }, 1); // Only 1 retry for session check

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
          6000
        );
      }, 1);

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
      const parsedError = this.parseError(error);

      if (parsedError.category === 'timeout') {
        console.warn('Session check timed out - this usually indicates network connectivity issues');
      } else if (parsedError.category === 'network') {
        console.warn('Network error during session check - Supabase server may be unreachable');
      }

      return null;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await this.withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        }),
        10000
      );

      if (error) {
        const parsedError = this.parseError(error);
        return {
          success: false,
          error: parsedError.message,
          errorType: parsedError.category
        }
      }

      return {
        success: true,
        error: 'Password reset email sent. Check your inbox for further instructions.'
      }
    } catch (error) {
      const parsedError = this.parseError(error);
      return {
        success: false,
        error: parsedError.message,
        errorType: parsedError.category
      }
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await this.withTimeout(
        supabase.auth.updateUser({
          password: newPassword
        }),
        10000
      );

      if (error) {
        const parsedError = this.parseError(error);
        return {
          success: false,
          error: parsedError.message,
          errorType: parsedError.category
        }
      }

      return { success: true }
    } catch (error) {
      const parsedError = this.parseError(error);
      return {
        success: false,
        error: parsedError.message,
        errorType: parsedError.category
      }
    }
  }

  // Resend verification email
  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      const { error } = await this.withTimeout(
        supabase.auth.resend({
          type: 'signup',
          email: email
        }),
        10000
      );

      if (error) {
        const parsedError = this.parseError(error);
        return {
          success: false,
          error: parsedError.message,
          errorType: parsedError.category
        }
      }

      return {
        success: true,
        error: 'Verification email sent. Please check your inbox.'
      }
    } catch (error) {
      const parsedError = this.parseError(error);
      return {
        success: false,
        error: parsedError.message,
        errorType: parsedError.category
      }
    }
  }

  // Update profile
  async updateProfile(updates: Partial<{ fullName: string; phone: string }>): Promise<AuthResponse> {
    try {
      const { error } = await this.withTimeout(
        supabase.auth.updateUser({
          data: {
            full_name: updates.fullName,
            phone: updates.phone
          }
        }),
        10000
      );

      if (error) {
        const parsedError = this.parseError(error);
        return {
          success: false,
          error: parsedError.message,
          errorType: parsedError.category
        }
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
      const parsedError = this.parseError(error);
      return {
        success: false,
        error: parsedError.message,
        errorType: parsedError.category
      }
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
