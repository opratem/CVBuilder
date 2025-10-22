import type React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Settings, Sparkles, Users, Shield, Zap, Target, HelpCircle, Save, LinkedIn, ChevronDown, Star } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthPage from './components/auth/AuthPage';
import Header from './components/layout/Header';
import PersonalInfoForm from './components/form/PersonalInfoForm';
import EducationForm from './components/form/EducationForm';
import WorkExperienceForm from './components/form/WorkExperienceForm';
import SkillsForm from './components/form/SkillsForm';
import ProjectsForm from './components/form/ProjectsForm';
import CertificationsForm from './components/form/CertificationsForm';
import ExtracurricularForm from './components/form/ExtracurricularForm';
import TemplateSelector from './components/form/TemplateSelector';
import LinkedInImport from './components/form/LinkedInImport';
import CVPreview from './components/CVPreview';
import EnhancedJobOptimizer from './components/optimization/EnhancedJobOptimizer';
import CVVersionManager from './components/optimization/CVVersionManager';
import Button from './components/ui/Button';
import ATSGuidance from './components/ui/ATSGuidance';
import KeywordSuggestions from './components/ui/KeywordSuggestions';
import ProgressIndicator from './components/ui/ProgressIndicator';
import SaveStatus from './components/ui/SaveStatus';
import { useCVStore } from './store/cvStore';
import { useProgressTracking } from './hooks/useProgressTracking';
import { cvDataService, type CVRecord } from './services/cvDataService';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

type ActiveTab = 'builder' | 'optimizer' | 'versions' | 'support';

const CVBuilderApp: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { resetCV, saveCV, loadCV, saveStatus, updateCV } = useCVStore();
  const progressSteps = useProgressTracking();
  const [isMobilePreviewVisible, setIsMobilePreviewVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');
  const [versions, setVersions] = useState<CVRecord[]>([]);
  const [currentVersion, setCurrentVersion] = useState<CVRecord | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  // Load CV data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadCV();
      loadVersions();
    }
  }, [isAuthenticated, isLoading, loadCV]);

  const loadVersions = async () => {
    try {
      const response = await cvDataService.getAllCVVersions();
      if (response.success && Array.isArray(response.data)) {
        setVersions(response.data);
        const active = response.data.find(v => v.is_active);
        setCurrentVersion(active || null);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const switchToVersion = async (version: CVRecord) => {
    try {
      const response = await cvDataService.switchToCVVersion(version.id);
      if (response.success) {
        const loadResponse = await cvDataService.loadCVData();
        if (loadResponse.success && loadResponse.data) {
          updateCV(loadResponse.data.cv_data);
          setCurrentVersion(version);
          await loadVersions();
        }
      }
    } catch (error) {
      console.error('Error switching version:', error);
    } finally {
      setShowVersionDropdown(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleExport = () => {
    // This function can be enhanced later to handle PDF export
    console.log('Export functionality');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with authentication */}
      <Header
        onExport={handleExport}
        onSave={saveCV}
        activeTab={activeTab}
        onVersionSelect={() => setActiveTab('versions')}
      />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-blue-100 text-lg mb-4">
                Continue building your professional CV and get discovered by top employers
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-blue-200 text-sm">Profile Complete</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-blue-200 text-sm">CV Versions</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">92</div>
                  <div className="text-blue-200 text-sm">ATS Score</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-blue-200 text-sm">Downloads</div>
                </div>
              </div>
            </div>

            <div className="lg:w-80">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('builder')}
                    className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    <span>Continue editing CV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('optimizer')}
                    className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors flex items-center"
                  >
                    <Target className="w-4 h-4 mr-3" />
                    <span>Optimize for job</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    <span>Change template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {isSettingsOpen && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Choose Your Template</h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <TemplateSelector />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium border-r relative ${
                activeTab === 'builder'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              CV Builder
              {activeTab === 'builder' && currentVersion && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {currentVersion.title}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('optimizer')}
              className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium border-r ${
                activeTab === 'optimizer'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              Job Optimizer
              <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Enhanced
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('versions')}
              className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium border-r ${
                activeTab === 'versions'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              CV Versions
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                New
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium rounded-r-lg ${
                activeTab === 'support'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Support & Help
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'builder' && (
          <>
            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    CV Builder Studio
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Build a professional CV with ATS optimization and industry guidance
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <SaveStatus status={saveStatus} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveCV}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center bg-green-50 text-green-700 border-green-200 hover:bg-green-100 btn-hover"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Save CV</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 btn-hover"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Templates</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetCV}
                    className="text-red-600 border-red-200 hover:bg-red-50 btn-hover"
                  >
                    Reset CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Version Selector Bar - Only show if there are versions */}
            {versions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Current Version:</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {currentVersion?.title || 'Select Version'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>

                      {showVersionDropdown && (
                        <div className="absolute top-full mt-1 left-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="py-1 max-h-48 overflow-y-auto">
                            {versions.map((version) => (
                              <button
                                key={version.id}
                                type="button"
                                onClick={() => switchToVersion(version)}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                                  version.is_active ? 'bg-blue-50 text-blue-700' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{version.title}</span>
                                  {version.is_active && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                      Active
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab('versions')}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Versions
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Form section */}
              <div className="w-full lg:w-1/2">
                {/* Mobile preview toggle */}
                <div className="lg:hidden mb-6">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setIsMobilePreviewVisible(!isMobilePreviewVisible)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isMobilePreviewVisible ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>

                {/* Mobile preview */}
                {isMobilePreviewVisible && (
                  <div className="lg:hidden mb-6 bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
                    <CVPreview isMobile />
                  </div>
                )}

                {/* Guidance Cards */}
                <div className="space-y-4 mb-6">
                  <ProgressIndicator steps={progressSteps} />
                  <ATSGuidance className="bg-white rounded-lg shadow-sm border" />
                  <KeywordSuggestions className="bg-white rounded-lg shadow-sm border" />
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <PersonalInfoForm />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <WorkExperienceForm />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <EducationForm />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <SkillsForm />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <ProjectsForm />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <CertificationsForm />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <ExtracurricularForm />
                  </div>
                </div>
              </div>

              {/* Preview section */}
              <div className="w-full lg:w-1/2 hidden lg:block">
                <div className="sticky top-8">
                  <div className="bg-white rounded-lg shadow-md border">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Live Preview
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        See your changes in real-time
                      </p>
                    </div>
                    <div className="p-4">
                      <CVPreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Job Optimizer Tab Content */}
        {activeTab === 'optimizer' && (
          <div className="max-w-6xl mx-auto">
            <EnhancedJobOptimizer />
          </div>
        )}

        {/* CV Versions Tab Content */}
        {activeTab === 'versions' && (
          <div className="max-w-6xl mx-auto">
            <CVVersionManager />
          </div>
        )}

        {/* Support & Help Tab Content */}
        {activeTab === 'support' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center mb-8">
                <HelpCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Support & Help Center</h2>
                <p className="text-gray-600">
                  Need assistance? We're here to help you create the perfect CV!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Support */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-orange-500 mr-2" />
                    Contact Support
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Experiencing an error or need technical assistance? Our support team is ready to help.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="text-sm text-gray-600 mb-2">Email us at:</p>
                    <a
                      href="mailto:cvbuilder04@gmail.com"
                      className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
                    >
                      cvbuilder04@gmail.com
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    We typically respond within 24 hours
                  </p>
                </div>

                {/* Quick Help Guide */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    Quick Help Guide
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="font-medium text-gray-800 text-sm">Getting Started</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Fill out your personal information first, then add your work experience and education.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="font-medium text-gray-800 text-sm">Adding Skills</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Click "Add Skill" button and use the slider to rate your proficiency level.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="font-medium text-gray-800 text-sm">Templates</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Click the "Templates" button to choose from different CV designs.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="font-medium text-gray-800 text-sm">ATS Optimization</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Use the Job Optimizer tab to tailor your CV for specific job postings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">How do I download my CV?</h4>
                    <p className="text-sm text-gray-600">
                      Once you've filled out all sections, click the "Download PDF" button in the preview section to export your CV.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Can I save multiple versions of my CV?</h4>
                    <p className="text-sm text-gray-600">
                      Yes! Use the "CV Versions" tab to create and manage multiple versions of your CV for different job applications.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Is my data secure?</h4>
                    <p className="text-sm text-gray-600">
                      Absolutely. Your data is encrypted and stored securely. We never share your personal information with third parties.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">What if I encounter a bug?</h4>
                    <p className="text-sm text-gray-600">
                      Please email us at cvbuilder04@gmail.com with details about the issue, including what you were doing when it occurred.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-bold">CV Builder</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Create professional, ATS-friendly CVs that help you land your dream job.
                Trusted by thousands of professionals worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• ATS-Optimized Templates</li>
                <li>• Real-time Preview</li>
                <li>• Job-Specific Optimization</li>
                <li>• PDF & DOC Export</li>
                <li>• Professional Formats</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Email verification required</li>
                <li>• Secure data storage</li>
                <li>• Privacy protected</li>
                <li>• Regular updates</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CV Builder. All rights reserved.
              <span className="mx-2">•</span>
              Built with care for job seekers everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CVBuilderApp />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
