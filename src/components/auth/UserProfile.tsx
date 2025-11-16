import type React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { User, Mail, Phone, Save, LogOut, Shield } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim()
    });

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="email"
              value={user.email}
              disabled
              fullWidth
              className="bg-gray-50"
            />
            {user.emailVerified ? (
              <span title="Email verified"><Shield className="w-5 h-5 text-green-600" /></span>
            ) : (
              <span title="Email not verified"><Shield className="w-5 h-5 text-red-600" /></span>
            )}
          </div>
          {!user.emailVerified && (
            <p className="text-xs text-red-600 mt-1">Email verification required</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            disabled={!isEditing}
            fullWidth
            className={!isEditing ? 'bg-gray-50' : ''}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              disabled={!isEditing}
              fullWidth
              className={!isEditing ? 'bg-gray-50' : ''}
            />
            {user.phoneVerified && phone ? (
              <span title="Phone verified"><Shield className="w-5 h-5 text-green-600" /></span>
            ) : null}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
            <p>Account ID: {user.id.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Error/Success Messages */}
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

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              fullWidth
              className="flex items-center justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handleCancel}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="secondary"
            fullWidth
            className="flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserProfile;
