import type React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface PasswordResetProps {
  onComplete?: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onComplete }) => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if we're in a password reset session
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check URL for password reset parameters (both query params and hash-based)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    // Check query params first
    let accessToken = urlParams.get('access_token');
    let refreshToken = urlParams.get('refresh_token');
    let type = urlParams.get('type');

    // If not in query params, check hash
    if (!accessToken) {
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      type = hashParams.get('type');
    }

    if (type === 'recovery' && accessToken && refreshToken) {
      setIsValidSession(true);
    }
  }, []);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }

    setIsLoading(true);

    const result = await updatePassword(newPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2000);
    } else {
      setError(result.error || 'Failed to update password');
    }

    setIsLoading(false);
  };

  if (!isValidSession) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center">
          <Lock className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Invalid Reset Link</h2>
          <p className="text-text-muted mb-4">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="primary"
            fullWidth
          >
            Return to Login
          </Button>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Password Updated!</h2>
          <p className="text-text-muted mb-4">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <div className="glass-success rounded-lg p-3">
            <p className="text-sm text-accent">
              Redirecting you to the login page...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <Lock className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Reset Your Password</h2>
        <p className="text-text-muted">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            fullWidth
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            fullWidth
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="glass-accent rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">Password Requirements:</h3>
          <ul className="text-xs text-text-muted space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains uppercase and lowercase letters</li>
            <li>• Contains at least one number</li>
            <li>• Contains at least one special character</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 glass-error rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          className="flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Lock className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </Card>
  );
};

export default PasswordReset;
