import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Loader2, Mail, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

interface AuthCallbackProps {
  onComplete: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [subMessage, setSubMessage] = useState('Please wait while we confirm your email address...');

  // Helper function to update profile email_verified status - memoized
  const updateProfileEmailVerified = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile email_verified:', error);
      } else {
        console.log('Profile email_verified updated successfully for user:', userId);
      }
    } catch (err) {
      console.error('Failed to update profile email_verified:', err);
    }
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check query params for code-based PKCE flow (newer Supabase default)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const errorDescription = queryParams.get('error_description');

        if (errorDescription) {
          setStatus('error');
          setMessage('Verification Failed');
          setSubMessage(errorDescription);
          return;
        }

        // Handle code-based PKCE flow
        if (code) {
          setMessage('Exchanging verification code...');
          setSubMessage('Almost there...');

          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setStatus('error');
            setMessage('Verification Failed');
            setSubMessage(error.message || 'Failed to verify your email. Please try again.');
            return;
          }

          if (data.session && data.user) {
            // Update the profiles table to mark email as verified
            await updateProfileEmailVerified(data.user.id);

            setStatus('success');
            setMessage('Email Verified Successfully!');
            setSubMessage('Your account is now active. Redirecting to the app...');

            // Clear the URL params and redirect after a short delay
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              onComplete();
            }, 2500);
            return;
          }
        }

        // Fallback: Check hash fragment for token-based flow (older flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          setMessage('Processing verification...');
          setSubMessage('Setting up your session...');

          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus('error');
            setMessage('Verification Failed');
            setSubMessage(error.message || 'Failed to verify your email. Please try again.');
            return;
          }

          // Get the current user to update profile
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await updateProfileEmailVerified(user.id);
          }

          // Successfully verified
          if (type === 'signup' || type === 'email_change') {
            setStatus('success');
            setMessage('Email Verified Successfully!');
            setSubMessage('Your account is now active. Redirecting to the app...');
          } else if (type === 'recovery') {
            setStatus('success');
            setMessage('Password Reset Successful!');
            setSubMessage('You can now sign in with your new password. Redirecting...');
          } else {
            setStatus('success');
            setMessage('Authentication Successful!');
            setSubMessage('Redirecting to the app...');
          }

          // Clear the URL hash/params and redirect after a short delay
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            onComplete();
          }, 2500);
        } else {
          // No tokens or code found - might be an error or invalid link
          setStatus('error');
          setMessage('Invalid Verification Link');
          setSubMessage('This link may have expired or already been used. Please request a new verification email.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('Unexpected Error');
        setSubMessage('An unexpected error occurred. Please try again or request a new verification email.');
      }
    };

    handleAuthCallback();
  }, [onComplete, updateProfileEmailVerified]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center animate-fadeIn">
        {status === 'loading' && (
          <>
            <div className="glass-accent w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">{message}</h2>
            <p className="text-text-muted mb-6">{subMessage}</p>
            <div className="glass-surface rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-5 h-5 text-accent" />
                <p className="text-sm text-text-secondary">Confirming your email address...</p>
              </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="glass-success w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent animate-slideIn">
              <ShieldCheck className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">{message}</h2>
            <p className="text-text-muted mb-6">{subMessage}</p>
            <div className="glass-success rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <p className="text-sm text-accent font-medium">Account activated!</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm">Redirecting automatically...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="glass-error w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-slideIn">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">{message}</h2>
            <p className="text-text-muted mb-6">{subMessage}</p>
            <div className="glass-error rounded-xl p-4 mb-6">
              <div className="flex items-start text-left">
                <Mail className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-400 font-medium mb-1">What you can do:</p>
                  <ul className="text-xs text-red-400/80 space-y-1 list-disc list-inside">
                    <li>Request a new verification email from the login page</li>
                    <li>Check if you've already verified your email</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                window.history.replaceState({}, document.title, '/');
                onComplete();
              }}
              className="btn-hover"
            >
              Return to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
