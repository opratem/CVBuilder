import type React from 'react';
import { useState, useEffect } from 'react';
import { useCVStore } from '../../store/cvStore';
import { useToast } from '../../contexts/ToastContext';
import { cvDataService, type CVRecord } from '../../services/cvDataService';
import Button from '../ui/Button';
import Card from '../ui/Card';
import {
  FileText, Plus, Edit, Trash2, Download, Copy,
  Clock, Building2, Target, Star, Eye, Calendar, Loader
} from 'lucide-react';
import type { CVData } from '../../types/cv';

const CVVersionManager: React.FC = () => {
  const { cv, updateCV } = useCVStore();
  const { showSuccess, showError, showInfo } = useToast();
  const [versions, setVersions] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load versions from Supabase on component mount
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
        await loadVersions(); // Reload versions
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
    setActionLoading(version.id);
    try {
      const response = await cvDataService.switchToCVVersion(version.id);
      if (response.success) {
        // Load the full CV data
        const loadResponse = await cvDataService.loadCVData();
        if (loadResponse.success && loadResponse.data) {
          if (!Array.isArray(loadResponse.data)) {
            updateCV(loadResponse.data.cv_data);
          }
          showSuccess('Version Loaded!', `Loaded CV version: ${version.title}`);
        }
      } else {
        showError('Load Failed', response.error || 'Failed to load CV version');
      }
    } catch (error) {
      console.error('Error loading version:', error);
      showError('Load Error', 'Failed to load CV version. Please try again.');
    } finally {
      setActionLoading(null);
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
        await loadVersions(); // Reload versions
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
        await loadVersions(); // Reload versions
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
        await loadVersions(); // Reload versions
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
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-teal-400" />
              CV Version Manager
            </h2>
            <p className="text-gray-300">
              Manage multiple versions of your CV optimized for different job applications.
            </p>
          </div>
          <div className="space-x-3">
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
              Save Current CV
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Version
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-300">Total Versions</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.active}</div>
              <div className="text-sm text-gray-300">Active Version</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-white">
                {versions.length > 0 ? formatDate(versions[0].updated_at).split(',')[0] : 'N/A'}
              </div>
              <div className="text-sm text-gray-300">Last Updated</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <Loader className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading CV Versions...</h3>
            <p className="text-gray-300">Please wait while we fetch your saved versions.</p>
          </Card>
        ) : versions.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No CV Versions Yet</h3>
            <p className="text-gray-300 mb-4">
              Create your first CV version to start managing different optimizations for various job applications.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Version
            </Button>
          </Card>
        ) : (
          versions.map((version) => (
            <Card key={version.id} className={`p-6 ${version.is_active ? 'ring-2 ring-teal-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-white mr-3">{version.title}</h3>
                    {version.is_active && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-900/40 text-green-300">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Building2 className="w-4 h-4 mr-2" />
                      Template: {version.template}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created: {formatDate(version.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Updated: {formatDate(version.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    onClick={() => loadVersion(version)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    disabled={actionLoading === version.id}
                  >
                    {actionLoading === version.id ? (
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    Load
                  </Button>

                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      •••
                    </Button>
                    <div className="absolute right-0 top-8 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="py-1">
                        <button
                          onClick={() => duplicateVersion(version)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
                          disabled={actionLoading === `duplicate-${version.id}`}
                        >
                          {actionLoading === `duplicate-${version.id}` ? (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Duplicate
                        </button>
                        <hr className="my-1 border-gray-600" />
                        <button
                          onClick={() => deleteVersion(version)}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center"
                          disabled={actionLoading === `delete-${version.id}`}
                        >
                          {actionLoading === `delete-${version.id}` ? (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
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

      {/* Create Version Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create New CV Version</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Version Name
                </label>
                <input
                  type="text"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="e.g., Frontend Developer - TechCorp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={selectedJobTitle}
                  onChange={(e) => setSelectedJobTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  placeholder="e.g., TechCorp Inc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                disabled={actionLoading === 'create'}
              >
                Cancel
              </Button>
              <Button
                onClick={createNewVersion}
                variant="primary"
                disabled={actionLoading === 'create'}
                className="flex items-center"
              >
                {actionLoading === 'create' ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Version
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CVVersionManager;
