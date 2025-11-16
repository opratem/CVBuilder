import type React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { LogIn, Eye, EyeOff, ArrowLeft, Mail, AlertTriangle, Info } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading, resetPassword, resendVerification } = useAuth();

  // Pre-fill email if device is remembered
  const getRememberedEmail = () => {
    return localStorage.getItem('remembered_email') || '';
  };

  const isDeviceRemembered = () => {
    return localStorage.getItem('remembered_device') === 'true';
  };

  const [email, setEmail] = useState(getRememberedEmail());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(isDeviceRemembered());
  const [error, setError] = useState<string | React.ReactNode>('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Real-time validation
  const validateField = (fieldName: string, value: string) => {
    const errors = { ...formErrors };

    switch (fieldName) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
    }

    setFormErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate fields
    validateField('email', email);
    validateField('password', password);

    if (Object.keys(formErrors).length > 0 || !email || !password) {
      setError('Please fix all errors before submitting');
      return;
    }

    const result = await login(email, password, rememberDevice);
    if (!result.success) {
      if (result.error?.includes('verify')) {
        setError(
          <div className="space-y-2">
            <p>{result.error}</p>
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-sm underline hover:text-red-800 font-medium"
            >
              Resend verification email
            </button>
          </div>
        );
      } else {
        setError(result.error || 'Invalid email or password');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const result = await resetPassword(email);
    if (result.success) {
      setSuccess('Password reset email sent! Check your inbox and spam folder for instructions.');
      setShowForgotPassword(false);
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  const handleResendVerification = async () => {
    if (email) {
      const result = await resendVerification(email);
      if (result.success) {
        setSuccess('Verification email sent! Please check your inbox and spam folder.');
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    }
  };

  if (showForgotPassword) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400">Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField('email', e.target.value);
              }}
              placeholder="your@email.com"
              required
              fullWidth
              className={formErrors.email ? 'border-red-300' : ''}
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-md">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-400">{success}</p>

                  {/* Spam Warning for Reset Emails */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-md p-2 mt-2">
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-400">
                        <strong>Check spam folder:</strong> Our emails sometimes end up in spam/junk folders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForgotPassword(false)}
              className="flex items-center justify-center flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !!formErrors.email}
              className="flex items-center justify-center flex-1"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to access your CV builder</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateField('email', e.target.value);
            }}
            placeholder="your@email.com"
            required
            fullWidth
            className={formErrors.email ? 'border-red-300' : ''}
          />
          {formErrors.email && (
            <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField('password', e.target.value);
              }}
              placeholder="Enter your password"
              required
              fullWidth
              className={formErrors.password ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* Remember Device Option */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberDevice"
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 text-[#4EAA93] focus:ring-[#4EAA93] border-gray-600 bg-[#252A30] rounded"
            />
            <label htmlFor="rememberDevice" className="ml-2 block text-sm text-gray-300">
              Remember this device
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-[#4EAA93] hover:text-[#5CC4A8]"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
            <div className="text-sm text-red-400">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-md">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading || Object.keys(formErrors).length > 0}
          className="flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#4EAA93] hover:text-[#5CC4A8] font-medium"
          >
            Create one here
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-[#252A30] border border-[#353B42] rounded-md">
        <div className="flex items-start">
          <Info className="w-4 h-4 text-[#4EAA93] mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Secure Login:</strong> Your account is protected with encrypted authentication.
              Use "Remember device" for convenient access on trusted devices.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LoginForm;
