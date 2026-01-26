import type React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Clock, ArrowRight } from 'lucide-react';

interface EmailVerificationProps {
  onVerified?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerified }) => {
  const { user, resendVerification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if user is verified
  useEffect(() => {
    if (user?.emailVerified && onVerified) {
      onVerified();
    }
  }, [user?.emailVerified, onVerified]);

  const handleResendVerification = async () => {
    if (!user?.email || countdown > 0) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await resendVerification(user.email);

    if (result.success) {
      setSuccess('Verification email sent! Please check your inbox and spam folder.');
      setCountdown(60); // 60 second cooldown
    } else {
      setError(result.error || 'Failed to send verification email');
    }

    setIsLoading(false);
  };

  if (!user) {
    return null;
  }

  // If already verified, show success message
  if (user.emailVerified) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-8">
          <div className="text-center">
            <div className="glass-success w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Email Verified!</h2>
            <p className="text-text-muted mb-6">
              Your email address has been successfully verified.
            </p>
            <div className="glass-accent rounded-xl p-4">
              <p className="text-sm text-accent flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            <Button
              onClick={onVerified}
              variant="primary"
              className="mt-6 flex items-center justify-center gap-2"
              fullWidth
            >
              Continue to App
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Verification required
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="glass-warning w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-warning" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Verify Your Email</h2>
          <p className="text-text-muted">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          {/* Email info box */}
          <div className="glass-accent rounded-xl p-4">
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent flex-shrink-0" />
              <span>Verification email sent to:</span>
            </p>
            <p className="text-text-primary font-medium mt-1 pl-6">{user.email}</p>
          </div>

          {/* Instructions box */}
          <div className="glass-surface rounded-xl p-4">
            <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              What to do next:
            </h3>
            <ul className="text-sm text-text-muted space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent">1.</span>
                Check your email inbox for a verification message
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">2.</span>
                Don't forget to check your spam/junk folder
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">3.</span>
                Click the verification link in the email
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">4.</span>
                Return to this page after verification
              </li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="glass-error rounded-xl p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="glass-success rounded-xl p-4">
              <p className="text-sm text-accent">{success}</p>
            </div>
          )}

          {/* Resend button */}
          <Button
            onClick={handleResendVerification}
            variant="primary"
            fullWidth
            disabled={isLoading || countdown > 0}
            className="flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${countdown > 0 ? '' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
            )}
            {countdown > 0
              ? `Resend in ${countdown}s`
              : isLoading
                ? 'Sending...'
                : 'Resend Verification Email'
            }
          </Button>

          {/* Info footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-text-muted">
              Verification emails expire after 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
