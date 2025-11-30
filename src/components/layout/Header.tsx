import type React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Download, Save, ChevronDown, Clock, Star, User, LogOut, UserPlus, LogIn } from 'lucide-react';
import { useCVStore } from '../../store/cvStore';
import { cvDataService, type CVRecord } from '../../services/cvDataService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import SaveStatus from '../ui/SaveStatus';

interface HeaderProps {
  onExport: () => void;
  onSave: () => void;
  activeTab?: string;
  onVersionSelect?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport, onSave, activeTab, onVersionSelect }) => {
  const { cv, updateCV, saveStatus } = useCVStore();
  const { user, isAuthenticated, isGuestMode, logout } = useAuth();
  const [versions, setVersions] = useState<CVRecord[]>([]);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<CVRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // Load versions and current active version
  useEffect(() => {
    loadVersions();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container') && showUserMenu) {
        setShowUserMenu(false);
      }
      if (!target.closest('.version-dropdown-container') && showVersionDropdown) {
        setShowVersionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showVersionDropdown]);

  const loadVersions = async () => {
    try {
      const response = await cvDataService.getAllCVVersions();
      if (response.success && Array.isArray(response.data)) {
        setVersions(response.data);
        // Find current active version
        const active = response.data.find(v => v.is_active);
        setCurrentVersion(active || null);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const switchToVersion = async (version: CVRecord) => {
    setLoading(true);
    try {
      const response = await cvDataService.switchToCVVersion(version.id);
      if (response.success) {
        // Load the full CV data
        const loadResponse = await cvDataService.loadCVData();
        if (loadResponse.success && loadResponse.data) {
          if (!Array.isArray(loadResponse.data)) {
            if (!Array.isArray(loadResponse.data)) {
            updateCV(loadResponse.data.cv_data);
          }
          }
          setCurrentVersion(version);
          await loadVersions(); // Refresh versions list
        }
      }
    } catch (error) {
      console.error('Error switching version:', error);
    } finally {
      setLoading(false);
      setShowVersionDropdown(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      // Optionally redirect to auth page
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLoginClick = () => {
    // Clear guest mode and set flag for login
    localStorage.removeItem('guest_mode');
    localStorage.setItem('show_login', 'true');
    window.location.href = '/';
  };

  const handleSignUpClick = () => {
    // Clear guest mode and set flag for signup
    localStorage.removeItem('guest_mode');
    localStorage.setItem('show_signup', 'true');
    window.location.href = '/';
  };

  return (
    <header className="bg-black shadow-dark-lg border-b border-border px-3 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          <FileText className="w-6 h-6 md:w-8 md:h-8 text-accent glow-accent" />
          <div>
            <h1 className="text-base md:text-xl lg:text-2xl font-bold text-text-primary">CV Builder</h1>
            <p className="text-xs md:text-sm text-text-muted hidden sm:block">Professional Resume Creator</p>
          </div>
        </div>

        {/* Version Selector - Only show in builder tab */}
        {activeTab === 'builder' && versions.length > 0 && (
          <div className="relative hidden lg:block version-dropdown-container">
            <button
              type="button"
              onClick={() => setShowVersionDropdown(!showVersionDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-secondary hover:bg-secondary-light rounded-lg border border-border hover:border-accent/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <Star className={`w-4 h-4 ${currentVersion?.is_active ? 'text-accent' : 'text-text-muted'}`} />
                <span className="text-sm font-medium text-text-primary">
                  {currentVersion?.title || 'Select Version'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {showVersionDropdown && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-secondary border border-border rounded-lg shadow-dark-lg shadow-glow z-50">
                <div className="py-1 max-h-64 overflow-y-auto scrollbar-thin">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      Select Version ({versions.length})
                    </p>
                  </div>
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => switchToVersion(version)}
                      disabled={loading}
                      className={`w-full text-left px-3 py-3 hover:bg-surface-hover transition-colors ${
                        version.is_active ? 'bg-accent/10 border-l-2 border-accent' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-text-primary">
                              {version.title}
                            </span>
                            {version.is_active && (
                              <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-text-muted">
                              Template: {version.template}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-text-muted" />
                              <span className="text-xs text-text-muted">
                                {formatDate(version.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {onVersionSelect && (
                    <div className="border-t border-border px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          onVersionSelect();
                          setShowVersionDropdown(false);
                        }}
                        className="w-full text-left text-sm text-accent hover:text-accent-light font-medium transition-colors"
                      >
                        Manage All Versions →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        <SaveStatus status={saveStatus} />

        <Button
          onClick={onSave}
          variant="outline"
          size="sm"
          className="flex items-center"
          disabled={saveStatus === 'saving'}
        >
          <Save className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
          <span className="hidden md:inline">Save</span>
        </Button>

        <Button
          onClick={onExport}
          variant="primary"
          size="sm"
          className="flex items-center"
        >
          <Download className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
          <span className="hidden md:inline">Export</span>
        </Button>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
              isGuestMode
                ? 'bg-accent/10 border-accent/30 hover:bg-accent/20 hover:border-accent/50'
                : 'bg-secondary border-border hover:bg-secondary-light hover:border-accent/50'
            }`}
          >
            <User className={`w-4 h-4 ${isGuestMode ? 'text-accent' : 'text-text-primary'}`} />
            <span className="text-sm font-medium text-text-primary hidden sm:inline">
              {isGuestMode ? 'Guest' : user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-secondary border border-border rounded-lg shadow-dark-lg shadow-glow z-50">
              {isGuestMode ? (
                // Guest Mode Menu
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">Guest Mode</p>
                    <p className="text-xs text-text-muted mt-1">
                      Sign up to save your progress in the cloud
                    </p>
                  </div>
                  <div className="px-2 py-2 space-y-1">
                    <button
                      type="button"
                      onClick={handleSignUpClick}
                      className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-text-primary hover:bg-accent/10 hover:text-accent transition-all"
                    >
                      <UserPlus className="w-4 h-4 mr-3" />
                      <span className="font-medium">Sign Up</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-text-primary hover:bg-accent/10 hover:text-accent transition-all"
                    >
                      <LogIn className="w-4 h-4 mr-3" />
                      <span className="font-medium">Log In</span>
                    </button>
                  </div>
                  <div className="px-4 py-3 border-t border-border bg-accent/5">
                    <p className="text-xs text-text-muted">
                      💡 Your data is only saved locally in guest mode
                    </p>
                  </div>
                </div>
              ) : (
                // Authenticated User Menu
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-muted mt-1">{user?.email}</p>
                  </div>
                  <div className="px-2 py-2 space-y-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-error hover:bg-error/10 transition-all"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
