import type React from 'react';
import { useState, useEffect } from 'react';
import { useCVStore } from '../../store/cvStore';
import { useToast } from '../../contexts/ToastContext';
import { cvDataService, type CVRecord } from '../../services/cvDataService';
import Button from '../ui/Button';
import Card from '../ui/Card';
import {
  FileText, Plus, Trash2, Copy,
  Clock, Building2, Star, Eye, Calendar, Loader, X, CheckCircle2
} from 'lucide-react';

const CVVersionManager: React.FC = () => {
  const { cv, updateCV } = useCVStore();
  const { showSuccess, showError } = useToast();
  const [versions, setVersions] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [switchingVersion, setSwitchingVersion] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await cvDataService.getAllCVVersions();
      if (response.success && Array.isArray(response.data)) {
        setVersions(response.data);
      } else {
        console.error('Failed to load versions:', response.error);
        showError('Failed to Load Versions', response.error || 'Unable to load your CV versions');
      }
    } catch (error) {
      console.error('Error loading versions:', error);
      showError('Load Error', 'Failed to load CV versions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createNewVersion = async () => {
    if (!newVersionName.trim()) {
      showError('Missing Information', 'Please enter a version name');
      return;
    }

    setActionLoading('create');
    try {
      const response = await cvDataService.createCVVersion(
        cv,
        cv.templateId,
        newVersionName
      );

      if (response.success) {
        await loadVersions();
        setShowCreateModal(false);
        setNewVersionName('');
        setSelectedJobTitle('');
        setSelectedCompany('');
        showSuccess('Version Created!', `Created new CV version: ${newVersionName}`);
      } else {
        showError('Creation Failed', response.error || 'Failed to create CV version');
      }
    } catch (error) {
      console.error('Error creating version:', error);
      showError('Creation Error', 'Failed to create CV version. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const loadVersion = async (version: CVRecord) => {
    if (version.is_active) return;

    setActionLoading(version.id);
    setSwitchingVersion(true);

    try {
      const response = await cvDataService.switchToCVVersion(version.id);
      if (response.success) {
        const loadResponse = await cvDataService.loadCVData();
        if (loadResponse.success && loadResponse.data) {
          if (!Array.isArray(loadResponse.data)) {
            updateCV(loadResponse.data.cv_data);
            await loadVersions();
            showSuccess('Switched Successfully!', `Now viewing: ${version.title}`);
          }
        }
      } else {
        showError('Load Failed', response.error || 'Failed to load CV version');
      }
    } catch (error) {
      console.error('Error loading version:', error);
      showError('Load Error', 'Failed to load CV version. Please try again.');
    } finally {
      setActionLoading(null);
      setSwitchingVersion(false);
    }
  };

  const duplicateVersion = async (version: CVRecord) => {
    setActionLoading(`duplicate-${version.id}`);
    try {
      const response = await cvDataService.createCVVersion(
        version.cv_data,
        version.template,
        `${version.title} (Copy)`
      );

      if (response.success) {
        await loadVersions();
        showSuccess('Version Duplicated!', `Duplicated CV version: ${version.title}`);
      } else {
        showError('Duplication Failed', response.error || 'Failed to duplicate CV version');
      }
    } catch (error) {
      console.error('Error duplicating version:', error);
      showError('Duplication Error', 'Failed to duplicate CV version. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteVersion = async (version: CVRecord) => {
    if (!window.confirm(`Are you sure you want to delete "${version.title}"?`)) {
      return;
    }

    setActionLoading(`delete-${version.id}`);
    try {
      const response = await cvDataService.deleteCVVersion(version.id);
      if (response.success) {
        await loadVersions();
        showSuccess('Version Deleted!', `Deleted CV version: ${version.title}`);
      } else {
        showError('Deletion Failed', response.error || 'Failed to delete CV version');
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      showError('Deletion Error', 'Failed to delete CV version. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const saveCurrentAsVersion = async () => {
    const versionName = cv.jobSpecific
      ? `${cv.jobSpecific.company} - ${cv.jobSpecific.jobTitle}`
      : `Version ${versions.length + 1}`;

    setActionLoading('save-current');
    try {
      const response = await cvDataService.createCVVersion(
        cv,
        cv.templateId,
        versionName
      );

      if (response.success) {
        await loadVersions();
        showSuccess('Current CV Saved!', `Saved current CV as: ${versionName}`);
      } else {
        showError('Save Failed', response.error || 'Failed to save CV version');
      }
    } catch (error) {
      console.error('Error saving current version:', error);
      showError('Save Error', 'Failed to save current CV version. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionStats = () => {
    const active = versions.filter(v => v.is_active).length;
    const total = versions.length;
    return { active, total };
  };

  const stats = getVersionStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Switching Overlay */}
      {switchingVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple via-purple-dark to-purple-darker p-8 rounded-2xl shadow-2xl text-center">
            <Loader className="w-16 h-16 text-white mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-white">Switching Version...</h3>
            <p className="text-purple-100 mt-2">Please wait while we load your CV</p>
          </div>
        </div>
      )}

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-purple" />
              CV Version Manager
            </h2>
            <p className="text-gray-400 text-lg">
              Manage multiple versions of your CV optimized for different job applications.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={saveCurrentAsVersion}
              variant="outline"
              className="flex items-center"
              disabled={actionLoading === 'save-current'}
            >
              {actionLoading === 'save-current' ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Save Current
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Version
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6" hover>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl mr-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400 font-medium">Total Versions</div>
            </div>
          </div>
        </Card>
        <Card className="p-6" hover>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl mr-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats.active}</div>
              <div className="text-sm text-gray-400 font-medium">Active Version</div>
            </div>
          </div>
        </Card>
        <Card className="p-6" hover>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple/20 to-purple-dark/20 rounded-xl mr-4">
              <Clock className="w-8 h-8 text-purple" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {versions.length > 0 ? formatDate(versions[0].updated_at).split(',')[0] : 'N/A'}
              </div>
              <div className="text-sm text-gray-400 font-medium">Last Updated</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <Loader className="w-16 h-16 text-purple mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Loading CV Versions...</h3>
            <p className="text-gray-400">Please wait while we fetch your saved versions.</p>
          </Card>
        ) : versions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple/20 to-purple-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-purple" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No CV Versions Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first CV version to start managing different optimizations for various job applications.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Version
            </Button>
          </Card>
        ) : (
          versions.map((version) => (
            <Card
              key={version.id}
              className={`p-6 transition-all duration-300 ${
                version.is_active
                  ? 'border-2 border-purple bg-gradient-to-br from-purple/10 via-purple-dark/5 to-transparent shadow-lg shadow-purple/20'
                  : 'border border-gray-700/50 hover:border-purple/50 hover:shadow-lg hover:shadow-purple/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3 gap-3 flex-wrap">
                    <h3 className="text-xl font-semibold text-white">{version.title}</h3>
                    {version.is_active && (
                      <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple via-purple-dark to-purple-darker text-white flex items-center shadow-lg shadow-purple/30 animate-pulse">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Building2 className="w-4 h-4 mr-2 text-purple flex-shrink-0" />
                      <span className="font-medium">Template:</span>&nbsp;
                      <span className="text-gray-300">{version.template}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-2 text-purple flex-shrink-0" />
                      <span className="font-medium">Created:</span>&nbsp;
                      <span className="text-gray-300">{formatDate(version.created_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-4 h-4 mr-2 text-purple flex-shrink-0" />
                      <span className="font-medium">Updated:</span>&nbsp;
                      <span className="text-gray-300">{formatDate(version.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => loadVersion(version)}
                    variant={version.is_active ? "outline" : "purple"}
                    size="sm"
                    className="flex items-center"
                    disabled={actionLoading === version.id || version.is_active}
                  >
                    {actionLoading === version.id ? (
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    {version.is_active ? 'Current' : 'Switch To'}
                  </Button>

                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      •••
                    </Button>
                    <div className="absolute right-0 top-10 w-48 bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => duplicateVersion(version)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-purple/20 hover:text-white flex items-center transition-colors"
                          disabled={actionLoading === `duplicate-${version.id}`}
                        >
                          {actionLoading === `duplicate-${version.id}` ? (
                            <Loader className="w-4 h-4 mr-3 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4 mr-3" />
                          )}
                          Duplicate
                        </button>
                        <div className="h-px bg-gray-700 mx-2" />
                        <button
                          onClick={() => deleteVersion(version)}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center transition-colors"
                          disabled={actionLoading === `delete-${version.id}`}
                        >
                          {actionLoading === `delete-${version.id}` ? (
                            <Loader className="w-4 h-4 mr-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Version Modal - Fixed Visibility */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="max-w-lg w-full animate-slide-in">
            <Card className="p-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-purple/30 shadow-2xl shadow-purple/20">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Create New CV Version</h3>
                    <p className="text-sm text-gray-400">Save a customized version of your CV for specific job applications</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Version Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVersionName}
                      onChange={(e) => setNewVersionName(e.target.value)}
                      placeholder="e.g., Frontend Developer - TechCorp"
                      className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple focus:border-purple transition-all outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Job Title <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={selectedJobTitle}
                      onChange={(e) => setSelectedJobTitle(e.target.value)}
                      placeholder="e.g., Senior Frontend Developer"
                      className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple focus:border-purple transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Company <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      placeholder="e.g., TechCorp Inc."
                      className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple focus:border-purple transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewVersionName('');
                      setSelectedJobTitle('');
                      setSelectedCompany('');
                    }}
                    variant="outline"
                    disabled={actionLoading === 'create'}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createNewVersion}
                    variant="primary"
                    disabled={actionLoading === 'create' || !newVersionName.trim()}
                    className="flex items-center"
                  >
                    {actionLoading === 'create' ? (
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5 mr-2" />
                    )}
                    Create Version
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVVersionManager;
