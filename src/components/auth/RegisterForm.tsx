import type React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { UserPlus, Eye, EyeOff, Mail, AlertTriangle, Check, Info, WifiOff, Clock, ShieldAlert, ServerCrash } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

// Error display component with different styling based on error type
const ErrorDisplay: React.FC<{
  error: string | React.ReactNode;
  errorType?: string;
}> = ({ error, errorType }) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
      case 'cors':
        return <WifiOff className="w-5 h-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />;
      case 'timeout':
        return <Clock className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />;
      case 'auth':
        return <ShieldAlert className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />;
      case 'server':
        return <ServerCrash className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />;
    }
  };

  const getErrorStyles = () => {
    switch (errorType) {
      case 'network':
      case 'cors':
        return 'bg-orange-900/20 border-orange-500/30';
      case 'timeout':
        return 'bg-yellow-900/20 border-yellow-500/30';
      default:
        return 'bg-red-900/20 border-red-500/30';
    }
  };

  const getTextColor = () => {
    switch (errorType) {
      case 'network':
      case 'cors':
        return 'text-orange-400';
      case 'timeout':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  // Format error message - handle newlines in the message
  const formatErrorMessage = (msg: string | React.ReactNode) => {
    if (typeof msg !== 'string') return msg;

    return msg.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < msg.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={`p-4 border rounded-md ${getErrorStyles()}`}>
      <div className="flex items-start">
        {getErrorIcon()}
        <div className="flex-1">
          <div className={`text-sm ${getTextColor()} whitespace-pre-wrap`}>
            {typeof error === 'string' ? formatErrorMessage(error) : error}
          </div>

          {/* Show retry hint for network errors */}
          {(errorType === 'network' || errorType === 'cors') && (
            <div className="mt-2 pt-2 border-t border-orange-500/20">
              <p className="text-xs text-orange-400/80">
                <strong>Troubleshooting tips:</strong>
              </p>
              <ul className="text-xs text-orange-400/70 mt-1 list-disc list-inside space-y-0.5">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Disable any VPN or proxy</li>
                <li>Clear browser cache and cookies</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, resendVerification } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Real-time validation
  const validateField = (fieldName: string, value: string) => {
    const errors = { ...formErrors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
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
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain uppercase, lowercase, and a number';
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }

    setFormErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setSuccess('');

    // Validate all fields
    validateField('name', name);
    validateField('email', email);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword);

    if (Object.keys(formErrors).length > 0 || !name || !email || !password || !confirmPassword) {
      setError('Please fix all errors before submitting');
      setErrorType('validation');
      return;
    }

    const result = await register({
      email,
      password,
      fullName: name,
      phone: phone || undefined
    }, rememberDevice);

    if (result.success) {
      if (result.needsVerification) {
        setNeedsVerification(true);
        setSuccess('Account created successfully!');
      } else {
        setSuccess('Account created successfully!');
      }
    } else {
      setError(result.error || 'An error occurred during registration');
      setErrorType((result as any).errorType || 'unknown');
    }
  };

  const handleResendVerification = async () => {
    if (email && !isResending && resendCooldown === 0) {
      setIsResending(true);
      setError('');
      setResendSuccess(false);
      try {
        const result = await resendVerification(email);
        if (result.success) {
          setResendSuccess(true);
          setSuccess('Verification email sent successfully!');
          // Start 60 second cooldown
          setResendCooldown(60);
          const interval = setInterval(() => {
            setResendCooldown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError(result.error || 'Failed to resend verification email');
          setErrorType((result as any).errorType || 'unknown');
        }
      } finally {
        setIsResending(false);
      }
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-text-muted">Join us and start building your professional CV</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateField('name', e.target.value);
            }}
            placeholder="John Doe"
            required
            fullWidth
            className={formErrors.name ? 'border-red-300' : ''}
          />
          {formErrors.name && (
            <p className="text-sm text-red-400 mt-1">{formErrors.name}</p>
          )}
        </div>

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
            <p className="text-sm text-red-400 mt-1">{formErrors.email}</p>
          )}
        </div>

        <Input
          label="Phone Number (Optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          fullWidth
        />

        <div>
          <label className="block text-sm md:text-base font-medium text-text-secondary mb-1.5 md:mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField('password', e.target.value);
              }}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              required
              className={`w-full px-3 py-2 md:px-4 md:py-2.5 pr-10 text-sm md:text-base rounded-lg border border-border bg-surface-input text-text-primary shadow-sm focus:border-accent focus:ring-accent focus:ring-2 focus:shadow-glow-sm placeholder-text-muted transition-all duration-200 ${formErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-red-400 mt-1">{formErrors.password}</p>
          )}
          {password && (
            <div className="mt-2">
              <div className="flex space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength
                        ? passwordStrength < 3
                          ? 'bg-red-400'
                          : passwordStrength < 4
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted">
                Password strength: {
                  passwordStrength < 3 ? 'Weak' :
                  passwordStrength < 4 ? 'Medium' : 'Strong'
                }
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-text-secondary mb-1.5 md:mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateField('confirmPassword', e.target.value);
              }}
              placeholder="Confirm your password"
              required
              className={`w-full px-3 py-2 md:px-4 md:py-2.5 pr-10 text-sm md:text-base rounded-lg border border-border bg-surface-input text-text-primary shadow-sm focus:border-accent focus:ring-accent focus:ring-2 focus:shadow-glow-sm placeholder-text-muted transition-all duration-200 ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="text-sm text-red-400 mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>

        {/* Remember Device Option */}
        <div className="flex items-center">
          <input
            id="rememberDevice"
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="h-4 w-4 text-accent focus:ring-accent border-border bg-secondary-light rounded"
          />
          <label htmlFor="rememberDevice" className="ml-2 block text-sm text-text-secondary">
            Remember this device for faster login
          </label>
        </div>

        {error && (
          <ErrorDisplay error={error} errorType={errorType} />
        )}

        {success && !needsVerification && (
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-md">
            <p className="text-sm text-green-400 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              {success}
            </p>
          </div>
        )}

        {/* Enhanced Email Verification Message */}
        {success && needsVerification && (
          <div className="p-4 glass-accent rounded-md">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-text-primary font-medium mb-2">
                  Please verify your email address
                </p>
                <p className="text-sm text-text-muted mb-3">
                  We've sent a verification email to <strong className="text-text-secondary">{email}</strong>.
                  Click the link in the email to activate your account.
                </p>

                {/* Spam Warning */}
                <div className="glass-warning rounded-md p-3 mb-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-400 font-medium">Check your spam folder</p>
                      <p className="text-xs text-yellow-400/80 mt-1">
                        Since we're using a free email service, our verification emails sometimes
                        end up in spam/junk folders. Please check there if you don't see our email
                        in your inbox within a few minutes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resend Success Confirmation */}
                {resendSuccess && (
                  <div className="glass-success rounded-md p-3 mb-3 animate-slideIn">
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-accent font-medium">Email sent successfully!</p>
                        <p className="text-xs text-accent/80 mt-0.5">
                          A new verification email has been sent to {email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resend Button with Cooldown */}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                    isResending || resendCooldown > 0
                      ? 'glass-surface text-text-muted cursor-not-allowed'
                      : 'glass-accent text-accent hover:bg-accent/20 btn-hover'
                  }`}
                  disabled={isResending || resendCooldown > 0}
                >
                  {isResending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" />
                      Sending verification email...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend available in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend verification email
                    </>
                  )}
                </button>
              </div>
            </div>
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
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-muted">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-accent hover:text-accent-light font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 glass-card rounded-md">
        <div className="flex items-start">
          <Info className="w-4 h-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-text-muted">
              <strong className="text-text-secondary">Secure & Private:</strong> Your data is encrypted and stored securely.
              Email verification is required for account security and helps prevent unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RegisterForm;
