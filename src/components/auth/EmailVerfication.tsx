import type React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

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
      <Card className="max-w-md mx-auto">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-4">
            Your email address has been successfully verified.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-700">
              <Mail className="w-4 h-4 inline mr-2" />
              {user.email}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Verification required
  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            <Mail className="w-4 h-4 inline mr-2" />
            Verification email sent to: <strong>{user.email}</strong>
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">What to do next:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Check your email inbox for a verification message</li>
            <li>• Don't forget to check your spam/junk folder</li>
            <li>• Click the verification link in the email</li>
            <li>• Return to this page after verification</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <Button
          onClick={handleResendVerification}
          variant="primary"
          fullWidth
          disabled={isLoading || countdown > 0}
          className="flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {countdown > 0
            ? `Resend in ${countdown}s`
            : isLoading
              ? 'Sending...'
              : 'Resend Verification Email'
          }
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Verification emails expire after 24 hours
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EmailVerification;
