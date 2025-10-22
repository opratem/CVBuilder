import type React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Download, Save, ChevronDown, Clock, Star } from 'lucide-react';
import { useCVStore } from '../../store/cvStore';
import { cvDataService, type CVRecord } from '../../services/cvDataService';
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
  const [versions, setVersions] = useState<CVRecord[]>([]);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<CVRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // Load versions and current active version
  useEffect(() => {
    loadVersions();
  }, []);

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
          updateCV(loadResponse.data.cv_data);
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">CV Builder</h1>
            <p className="text-sm text-gray-500">Professional Resume Creator</p>
          </div>
        </div>

        {/* Version Selector - Only show in builder tab */}
        {activeTab === 'builder' && versions.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVersionDropdown(!showVersionDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Star className={`w-4 h-4 ${currentVersion?.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {currentVersion?.title || 'Select Version'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showVersionDropdown && (
              <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1 max-h-64 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Select Version ({versions.length})
                    </p>
                  </div>
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => switchToVersion(version)}
                      disabled={loading}
                      className={`w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors ${
                        version.is_active ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {version.title}
                            </span>
                            {version.is_active && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              Template: {version.template}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDate(version.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {onVersionSelect && (
                    <div className="border-t border-gray-100 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          onVersionSelect();
                          setShowVersionDropdown(false);
                        }}
                        className="w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium"
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

      <div className="flex items-center space-x-3">
        <SaveStatus status={saveStatus} />

        <Button
          onClick={onSave}
          variant="outline"
          size="sm"
          className="flex items-center"
          disabled={saveStatus === 'saving'}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          onClick={onExport}
          variant="primary"
          size="sm"
          className="flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </header>
  );
};

export default Header;
