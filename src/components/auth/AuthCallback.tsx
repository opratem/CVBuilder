import type React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

interface AuthCallbackProps {
  onComplete: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check query params for code-based PKCE flow (newer Supabase default)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const errorDescription = queryParams.get('error_description');

        if (errorDescription) {
          setStatus('error');
          setMessage(errorDescription);
          return;
        }

        // Handle code-based PKCE flow
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to verify your email. Please try again.');
            return;
          }

          if (data.session) {
            setStatus('success');
            setMessage('Your email has been verified successfully! Redirecting...');

            // Clear the URL params and redirect after a short delay
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              onComplete();
            }, 2000);
            return;
          }
        }

        // Fallback: Check hash fragment for token-based flow (older flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to verify your email. Please try again.');
            return;
          }

          // Successfully verified
          if (type === 'signup' || type === 'email_change') {
            setStatus('success');
            setMessage('Your email has been verified successfully! Redirecting...');
          } else if (type === 'recovery') {
            setStatus('success');
            setMessage('Password reset successful! Redirecting...');
          } else {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
          }

          // Clear the URL hash/params and redirect after a short delay
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            onComplete();
          }, 2000);
        } else {
          // No tokens or code found - might be an error or invalid link
          setStatus('error');
          setMessage('Invalid or expired verification link. Please request a new one.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="glass-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Processing...</h2>
            <p className="text-text-muted">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="glass-success w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Success!</h2>
            <p className="text-text-muted mb-4">{message}</p>
            <div className="glass-success rounded-xl p-4">
              <p className="text-sm text-accent">You will be redirected automatically.</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="glass-error w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Verification Failed</h2>
            <p className="text-text-muted mb-4">{message}</p>
            <div className="glass-error rounded-xl p-4 mb-6">
              <p className="text-sm text-red-400">
                The link may have expired or already been used.
              </p>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                window.history.replaceState({}, document.title, '/');
                onComplete();
              }}
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
