import type React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { UserPlus, Eye, EyeOff, Mail, AlertTriangle, Check, Info } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

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
  const [success, setSuccess] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    setSuccess('');

    // Validate all fields
    validateField('name', name);
    validateField('email', email);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword);

    if (Object.keys(formErrors).length > 0 || !name || !email || !password || !confirmPassword) {
      setError('Please fix all errors before submitting');
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
        <p className="text-gray-400">Join us and start building your professional CV</p>
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
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField('password', e.target.value);
              }}
              placeholder="At least 8 characters with uppercase, lowercase, and number"
              required
              fullWidth
              className={formErrors.password ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-300"
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
              <p className="text-xs text-gray-400">
                Password strength: {
                  passwordStrength < 3 ? 'Weak' :
                  passwordStrength < 4 ? 'Medium' : 'Strong'
                }
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateField('confirmPassword', e.target.value);
              }}
              placeholder="Confirm your password"
              required
              fullWidth
              className={formErrors.confirmPassword ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-300"
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
            className="h-4 w-4 text-[#4EAA93] focus:ring-[#4EAA93] border-gray-600 bg-[#252A30] rounded"
          />
          <label htmlFor="rememberDevice" className="ml-2 block text-sm text-gray-300">
            Remember this device for faster login
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
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
          <div className="p-4 bg-[#252A30] border border-[#4EAA93] rounded-md">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-[#4EAA93] mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium mb-2">
                  Please verify your email address
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  We've sent a verification email to <strong className="text-gray-300">{email}</strong>.
                  Click the link in the email to activate your account.
                </p>

                {/* Spam Warning */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-md p-3 mb-3">
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

                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-sm text-[#4EAA93] underline hover:text-[#5CC4A8] font-medium"
                >
                  Didn't receive the email? Resend verification
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
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#4EAA93] hover:text-[#5CC4A8] font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-[#252A30] border border-[#353B42] rounded-md">
        <div className="flex items-start">
          <Info className="w-4 h-4 text-[#4EAA93] mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Secure & Private:</strong> Your data is encrypted and stored securely.
              Email verification is required for account security and helps prevent unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RegisterForm;
