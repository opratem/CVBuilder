import type React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Settings, Sparkles, Users, Shield, Target, HelpCircle, Save, ChevronDown, Star, User, Briefcase, GraduationCap, Code, Award, Zap, List, ZoomIn, ZoomOut, Printer, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthPage from './components/auth/AuthPage';
import AuthCallback from './components/auth/AuthCallback';
import Header from './components/layout/Header';
import PersonalInfoForm from './components/form/PersonalInfoForm';
import EducationForm from './components/form/EducationForm';
import WorkExperienceForm from './components/form/WorkExperienceForm';
import SkillsForm from './components/form/SkillsForm';
import ProjectsForm from './components/form/ProjectsForm';
import CertificationsForm from './components/form/CertificationsForm';
import ExtracurricularForm from './components/form/ExtracurricularForm';
import TemplateSelector from './components/form/TemplateSelector';
import CVPreview from './components/CVPreview';
import EnhancedJobOptimizer from './components/optimization/EnhancedJobOptimizer';
import CVVersionManager from './components/optimization/CVVersionManager';
import Button from './components/ui/Button';
import ATSGuidance from './components/ui/ATSGuidance';
import KeywordSuggestions from './components/ui/KeywordSuggestions';
import ProgressIndicator from './components/ui/ProgressIndicator';
import SaveStatus from './components/ui/SaveStatus';
import SectionReorder from './components/ui/SectionReorder';
import ExportPanel from './components/ui/ExportPanel';
import { SupabaseConnectionTest } from './components/ui/SupabaseConnectionTest';
import { useCVStore } from './store/cvStore';
import { useProgressTracking } from './hooks/useProgressTracking';
import { cvDataService, type CVRecord } from './services/cvDataService';

type ActiveTab = 'builder' | 'optimizer' | 'versions' | 'support';
type SectionId = 'personal' | 'work' | 'education' | 'skills' | 'projects' | 'certifications' | 'extracurricular';

// Sortable Section Component
interface SortableSectionProps {
  id: string;
  children: React.ReactNode;
  sectionRef?: React.RefObject<HTMLDivElement>;
}

const SortableSection: React.FC<SortableSectionProps> = ({ id, children, sectionRef }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (sectionRef) {
          (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      style={style}
      className={`scroll-mt-20 bg-secondary rounded-lg shadow-lg border border-secondary-light p-8 transition-all duration-200 hover:border-accent/50 hover:shadow-xl hover-lift ${
        isDragging ? 'ring-2 ring-accent z-50' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-text-muted hover:text-accent transition-colors mt-1 p-1 rounded hover:bg-surface-hover"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Section Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const CVBuilderApp: React.FC = () => {
  const { isAuthenticated, isInitializing, user, isGuestMode } = useAuth();
  const { resetCV, saveCV, loadCV, saveStatus, updateCV, updateSectionOrder, cv } = useCVStore();
  const progressSteps = useProgressTracking();
  const [isMobilePreviewVisible, setIsMobilePreviewVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSectionReorderOpen, setIsSectionReorderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');
  const [versions, setVersions] = useState<CVRecord[]>([]);
  const [currentVersion, setCurrentVersion] = useState<CVRecord | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('personal');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAuthCallback, setIsAuthCallback] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Refs for scrolling to sections
  const sectionRefs = {
    personal: useRef<HTMLDivElement>(null),
    work: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    certifications: useRef<HTMLDivElement>(null),
    extracurricular: useRef<HTMLDivElement>(null),
  };

  // Detect if we're on the /auth/callback route or have auth hash params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      // Check for /auth/callback path or hash-based auth tokens
      const isCallback = path === '/auth/callback' ||
        path.includes('/auth/callback') ||
        (hash !== '' && hash.includes('access_token'));
      setIsAuthCallback(isCallback);
    }
  }, []);

  // Handle auth callback completion
  const handleAuthCallbackComplete = () => {
    setIsAuthCallback(false);
    // Force a page reload to the root to ensure clean state
    window.location.href = '/';
  };

  // If on /auth/callback, render AuthCallback only
  if (isAuthCallback) {
    return <AuthCallback onComplete={handleAuthCallbackComplete} />;
  }

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get section order from store or use default
  const sectionOrder = cv.sectionOrder || [
    { id: 'personal', name: 'Personal Information', enabled: true, order: 0 },
    { id: 'work', name: 'Work Experience', enabled: true, order: 1 },
    { id: 'education', name: 'Education', enabled: true, order: 2 },
    { id: 'skills', name: 'Skills', enabled: true, order: 3 },
    { id: 'projects', name: 'Projects', enabled: true, order: 4 },
    { id: 'certifications', name: 'Certifications', enabled: true, order: 5 },
    { id: 'extracurricular', name: 'Extracurricular', enabled: true, order: 6 },
  ];

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.findIndex((section) => section.id === active.id);
      const newIndex = sectionOrder.findIndex((section) => section.id === over.id);

      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      }));

      updateSectionOrder(newOrder);
    }
  };

  // Load CV data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      loadCV();
      loadVersions();
    }
  }, [isAuthenticated, isInitializing, loadCV]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to exit fullscreen
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false);
      }
      // Escape to close section reorder modal
      if (e.key === 'Escape' && isSectionReorderOpen) {
        setIsSectionReorderOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreen, isSectionReorderOpen]);

  // Scroll tracking to highlight active section and show scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button when scrolled down 300px
      setShowScrollTop(window.scrollY > 300);

      // Get all section elements
      const sectionElements = Object.entries(sectionRefs).map(([id, ref]) => ({
        id: id as SectionId,
        element: ref.current,
      }));

      // Find which section is currently in view
      let currentSection: SectionId = 'personal';
      for (const { id, element } of sectionElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered active if it's in the top half of viewport
          if (rect.top <= window.innerHeight / 3 && rect.bottom >= 0) {
            currentSection = id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Throttle scroll events for performance
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Run once on mount
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

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
        if (loadResponse.success && loadResponse.data && !Array.isArray(loadResponse.data)) {
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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-lg">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuestMode) {
    return <AuthPage />;
  }

  const handleExport = () => {
    // This function can be enhanced later to handle PDF export
    console.log('Export functionality');
  };

  // Scroll to section
  const scrollToSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    sectionRefs[sectionId].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Preview zoom controls
  const handleZoomIn = () => {
    setPreviewZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setPreviewZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setPreviewZoom(100);
  };

  const handlePrint = () => {
    if (previewRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>CV Preview - Print</title>
              <style>
                body { margin: 0; padding: 20px; }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${previewRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const togglePreviewFullscreen = () => {
    setIsPreviewFullscreen(!isPreviewFullscreen);
  };

  // Section navigation data
  const sections = [
    { id: 'personal' as SectionId, label: 'Personal Info', icon: User },
    { id: 'work' as SectionId, label: 'Work Experience', icon: Briefcase },
    { id: 'education' as SectionId, label: 'Education', icon: GraduationCap },
    { id: 'skills' as SectionId, label: 'Skills', icon: Code },
    { id: 'projects' as SectionId, label: 'Projects', icon: Zap },
    { id: 'certifications' as SectionId, label: 'Certifications', icon: Award },
    { id: 'extracurricular' as SectionId, label: 'Extracurricular', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Header with authentication */}
      <Header
        onExport={handleExport}
        onSave={saveCV}
        activeTab={activeTab}
        onVersionSelect={() => setActiveTab('versions')}
      />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-accent-dark to-accent text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Guest'}!
              </h1>
              <p className="text-white/80 text-sm">
                Continue building your professional CV
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveCV()}
                disabled={saveStatus === 'saving'}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save CV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {isSettingsOpen && (
        <div className="bg-secondary border-b border-secondary-light shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Choose Your Template</h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            <TemplateSelector />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 pb-24 lg:pb-6 max-w-[1600px]">
        {/* Tab Navigation */}
        <div className="bg-secondary rounded-lg shadow-lg border border-secondary-light mb-6">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium border-r border-secondary-light relative transition-all ${
                activeTab === 'builder'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary-light'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              CV Builder
              {activeTab === 'builder' && currentVersion && (
                <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
                  {currentVersion.title}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('optimizer')}
              className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium border-r border-secondary-light transition-all ${
                activeTab === 'optimizer'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary-light'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              Job Optimizer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('versions')}
              className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium border-r border-secondary-light transition-all ${
                activeTab === 'versions'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary-light'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              CV Versions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium rounded-r-lg transition-all ${
                activeTab === 'support'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary-light'
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
            <div className="bg-secondary rounded-lg shadow-lg border border-secondary-light p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-text-primary flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-accent" />
                    CV Builder Studio
                  </h2>
                  <p className="text-text-muted text-sm mt-1">
                    Build a professional CV with ATS optimization
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <SaveStatus status={saveStatus} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveCV()}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center bg-accent hover:bg-accent-dark text-white border-accent btn-hover"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Save CV</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center bg-secondary-dark hover:bg-secondary text-text-primary border-secondary-light btn-hover"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Templates</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSectionReorderOpen(true)}
                    className="flex items-center bg-secondary-dark hover:bg-secondary text-text-primary border-secondary-light btn-hover"
                  >
                    <List className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Reorder</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetCV}
                    className="text-error border-error/30 hover:bg-error/10 btn-hover"
                  >
                    Reset CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Version Selector Bar - Only show if there are versions */}
            {versions.length > 0 && (
              <div className="bg-secondary rounded-lg shadow-lg border border-secondary-light mb-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-text-primary">Current Version:</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                        className="flex items-center space-x-2 px-3 py-2 bg-secondary-dark hover:bg-secondary-light rounded-md border border-secondary-light transition-colors"
                      >
                        <span className="text-sm font-medium text-text-primary">
                          {currentVersion?.title || 'Select Version'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      </button>

                      {showVersionDropdown && (
                        <div className="absolute top-full mt-1 left-0 w-64 bg-secondary border border-secondary-light rounded-md shadow-xl z-50">
                          <div className="py-1 max-h-48 overflow-y-auto">
                            {versions.map((version) => (
                              <button
                                key={version.id}
                                type="button"
                                onClick={() => switchToVersion(version)}
                                className={`w-full text-left px-3 py-2 hover:bg-secondary-light transition-colors ${
                                  version.is_active ? 'bg-accent text-white' : 'text-text-primary'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{version.title}</span>
                                  {version.is_active && (
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
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
                    className="flex items-center bg-secondary-dark hover:bg-secondary text-text-primary border-secondary-light"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Versions
                  </Button>
                </div>
              </div>
            )}

            {/* Split-Screen Layout */}
            <div className="flex flex-col lg:flex-row gap-6 relative items-start">
              {/* Left Sidebar Navigation - Enhanced Design */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-4 space-y-4">
                  {/* Main Navigation Card */}
                  <div className="bg-gradient-to-br from-secondary to-secondary-dark rounded-xl shadow-xl border border-secondary-light overflow-hidden">
                    {/* Sidebar Header */}
                    <div className="bg-gradient-to-r from-accent-dark to-accent p-4 border-b border-accent-light/20">
                      <h3 className="text-white font-bold text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        CV Sections
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5">Jump to any section</p>
                    </div>

                    {/* Navigation Items */}
                    <nav className="p-3 max-h-[calc(100vh-32rem)] overflow-y-auto scrollbar-thin">
                      <div className="space-y-1">
                        {sections.map((section, index) => {
                          const Icon = section.icon;
                          const isActive = activeSection === section.id;
                          return (
                            <button
                              key={section.id}
                              type="button"
                              onClick={() => scrollToSection(section.id)}
                              className={`group w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]'
                                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:translate-x-1'
                              }`}
                            >
                              <div className="flex items-center flex-1">
                                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                                <span className="font-medium">{section.label}</span>
                              </div>
                              {isActive && (
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </nav>

                    {/* Quick Actions Section */}
                    <div className="border-t border-secondary-light bg-secondary-dark/50 p-3">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
                        Quick Actions
                      </p>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                          className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-text-muted hover:bg-accent/10 hover:text-accent transition-all duration-200 hover:translate-x-1"
                        >
                          <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span>Change Template</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSectionReorderOpen(true)}
                          className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-text-muted hover:bg-accent/10 hover:text-accent transition-all duration-200 hover:translate-x-1"
                        >
                          <List className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span>Reorder Sections</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCV()}
                          disabled={saveStatus === 'saving'}
                          className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-text-muted hover:bg-accent/10 hover:text-accent transition-all duration-200 hover:translate-x-1 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span>Save Progress</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator Card */}
                  <div className="bg-gradient-to-br from-secondary to-secondary-dark rounded-xl shadow-xl border border-secondary-light overflow-hidden">
                    <div className="bg-gradient-to-r from-accent-dark/20 to-accent/20 p-3 border-b border-secondary-light">
                      <h4 className="text-text-primary font-semibold text-xs flex items-center">
                        <Target className="w-4 h-4 mr-2 text-accent" />
                        Completion Progress
                      </h4>
                    </div>
                    <div className="p-3">
                      <ProgressIndicator steps={progressSteps} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Mobile Navigation */}
              <div className="lg:hidden w-full mb-6">
                {/* Mobile Quick Stats Card */}
                <div className="bg-gradient-to-r from-accent-dark to-accent rounded-xl shadow-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs opacity-90">CV Progress</p>
                      <p className="text-2xl font-bold">
                        {Math.round((progressSteps.filter(s => s.completed).length / progressSteps.length) * 100)}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => saveCV()}
                        disabled={saveStatus === 'saving'}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Save CV"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMobilePreviewVisible(!isMobilePreviewVisible)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        title={isMobilePreviewVisible ? 'Hide Preview' : 'Show Preview'}
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Section Navigation */}
                <div className="bg-secondary rounded-xl shadow-lg border border-secondary-light p-3 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-text-primary">Navigate Sections</h4>
                    <span className="text-xs text-text-muted">{sections.length} sections</span>
                  </div>
                  <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin -mx-1 px-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg whitespace-nowrap transition-all min-w-[80px] ${
                            isActive
                              ? 'bg-accent text-white shadow-md scale-105'
                              : 'bg-secondary-dark text-text-muted hover:bg-surface-hover hover:text-text-primary'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1.5" />
                          <span className="text-xs font-medium">{section.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-light border border-secondary-light text-text-primary rounded-lg px-4 py-3 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Templates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSectionReorderOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-light border border-secondary-light text-text-primary rounded-lg px-4 py-3 transition-all"
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm font-medium">Reorder</span>
                  </button>
                </div>

                {/* Mobile Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMobilePreviewVisible(!isMobilePreviewVisible)}
                  className="w-full bg-gradient-to-r from-accent-dark to-accent hover:from-accent hover:to-accent-light text-white rounded-lg px-4 py-3 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">
                    {isMobilePreviewVisible ? 'Hide CV Preview' : 'Show CV Preview'}
                  </span>
                </button>

                {/* Mobile Preview Panel */}
                {isMobilePreviewVisible && (
                  <div className="mt-4 space-y-4 animate-slideIn">
                    {/* CV Preview */}
                    <div className="bg-secondary rounded-xl shadow-2xl border border-secondary-light overflow-hidden">
                      <div className="bg-gradient-to-r from-accent-dark to-accent p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-white">
                          <FileText className="w-5 h-5" />
                          <h3 className="font-bold">Live Preview</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsMobilePreviewVisible(false)}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="bg-white p-1">
                        <CVPreview isMobile />
                      </div>
                    </div>

                    {/* Export Panel */}
                    <div className="bg-secondary rounded-xl shadow-2xl border border-secondary-light overflow-hidden">
                      <ExportPanel />
                    </div>
                  </div>
                )}
              </div>

              {/* Middle: Form Section */}
              <div className="flex-1 min-w-0 max-w-3xl">
                {/* Guidance Cards */}
                <div className="space-y-4 mb-6 lg:hidden">
                  <ATSGuidance className="bg-secondary rounded-lg shadow-lg border border-secondary-light" />
                  <KeywordSuggestions className="bg-secondary rounded-lg shadow-lg border border-secondary-light" />
                </div>

                {/* Form Sections with Drag and Drop */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sectionOrder.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-8 pb-8">
                      {sectionOrder
                        .filter(section => section.enabled)
                        .map((section) => {
                          const sectionId = section.id as 'personal' | 'work' | 'education' | 'skills' | 'projects' | 'certifications' | 'extracurricular';
                          const sectionRef = sectionRefs[sectionId];

                          return (
                            <SortableSection key={section.id} id={section.id} sectionRef={sectionRef}>
                              {section.id === 'personal' && <PersonalInfoForm />}
                              {section.id === 'work' && <WorkExperienceForm />}
                              {section.id === 'education' && <EducationForm />}
                              {section.id === 'skills' && <SkillsForm />}
                              {section.id === 'projects' && <ProjectsForm />}
                              {section.id === 'certifications' && <CertificationsForm />}
                              {section.id === 'extracurricular' && <ExtracurricularForm />}
                            </SortableSection>
                          );
                        })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Right: Preview and Helper Sections */}
              <div className="hidden lg:block w-[480px] xl:w-[520px] flex-shrink-0">
                <div className="space-y-4">
                  {/* 1. Live Preview Section - CV Template Only */}
                  <div className="bg-secondary rounded-lg shadow-xl border border-secondary-light overflow-hidden hover-lift">
                    {/* Preview Header */}
                    <div className="px-5 py-3 border-b border-secondary-light bg-gradient-to-r from-primary-dark to-primary-light flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mr-3">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-text-primary">Live Preview</h3>
                          <p className="text-xs text-text-secondary">Auto-updates as you type</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Zoom Controls */}
                        <button
                          type="button"
                          onClick={handleZoomOut}
                          disabled={previewZoom <= 50}
                          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleResetZoom}
                          className="px-2 py-1 text-xs font-medium rounded hover:bg-surface-hover text-text-muted hover:text-accent transition-colors"
                          title="Reset Zoom"
                        >
                          {previewZoom}%
                        </button>
                        <button
                          type="button"
                          onClick={handleZoomIn}
                          disabled={previewZoom >= 150}
                          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>

                        <div className="w-px h-5 bg-secondary-light mx-1" />

                        {/* Print Button */}
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-accent transition-colors"
                          title="Print Preview"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                          type="button"
                          onClick={togglePreviewFullscreen}
                          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-accent transition-colors"
                          title={isPreviewFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                          {isPreviewFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>

                        <div className="w-px h-5 bg-secondary-light mx-1" />

                        {/* Live Indicator */}
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                          <span className="text-xs text-text-muted">Live</span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div
                      ref={previewRef}
                      className="p-0 bg-gradient-to-br from-gray-50 to-white overflow-y-auto scrollbar-thin"
                      style={{ maxHeight: '1000px', minHeight: '900px' }}
                    >
                      <div
                        className="transition-transform duration-200 origin-top"
                        style={{ transform: `scale(${previewZoom / 100})` }}
                      >
                        <CVPreview hideControls />
                      </div>
                    </div>
                  </div>

                  {/* 2. ATS Check & Export Options Section */}
                  <div className="bg-secondary rounded-lg shadow-xl border border-secondary-light overflow-hidden hover-lift">
                    <ExportPanel />
                  </div>

                  {/* 3. Keyword Suggestions Section */}
                  <div className="bg-secondary rounded-lg shadow-lg border border-secondary-light hover-lift">
                    <KeywordSuggestions className="" />
                  </div>

                  {/* 4. ATS Optimization Guide Section */}
                  <div className="bg-secondary rounded-lg shadow-lg border border-secondary-light hover-lift">
                    <ATSGuidance className="" />
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
            <div className="bg-secondary rounded-lg shadow-xl border border-secondary-light p-8">
              <div className="text-center mb-8">
                <HelpCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">Support & Help Center</h2>
                <p className="text-text-muted">
                  Need assistance? We're here to help you create the perfect CV!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Support */}
                <div className="bg-secondary-dark rounded-lg p-6 border border-secondary-light">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-accent mr-2" />
                    Contact Support
                  </h3>
                  <p className="text-text-muted mb-4">
                    Experiencing an error or need technical assistance? Our support team is ready to help.
                  </p>
                  <div className="bg-primary rounded-lg p-4 border border-secondary-light">
                    <p className="text-sm text-text-muted mb-2">Email us at:</p>
                    <a
                      href="mailto:cvbuilder04@gmail.com"
                      className="text-accent font-medium hover:text-accent-light transition-colors"
                    >
                      cvbuilder04@gmail.com
                    </a>
                  </div>
                  <p className="text-xs text-text-disabled mt-3">
                    We typically respond within 24 hours
                  </p>
                </div>

                {/* Quick Help Guide */}
                <div className="bg-secondary-dark rounded-lg p-6 border border-secondary-light">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <FileText className="w-5 h-5 text-accent mr-2" />
                    Quick Help Guide
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-primary rounded-lg p-3 border border-secondary-light">
                      <h4 className="font-medium text-text-primary text-sm">Getting Started</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Fill out your personal information first, then add your work experience and education.
                      </p>
                    </div>
                    <div className="bg-primary rounded-lg p-3 border border-secondary-light">
                      <h4 className="font-medium text-text-primary text-sm">Adding Skills</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Click "Add Skill" button and use the slider to rate your proficiency level.
                      </p>
                    </div>
                    <div className="bg-primary rounded-lg p-3 border border-secondary-light">
                      <h4 className="font-medium text-text-primary text-sm">Templates</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Click the "Templates" button to choose from different CV designs.
                      </p>
                    </div>
                    <div className="bg-primary rounded-lg p-3 border border-secondary-light">
                      <h4 className="font-medium text-text-primary text-sm">ATS Optimization</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Use the Job Optimizer tab to tailor your CV for specific job postings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div className="bg-secondary-dark rounded-lg p-4 border border-secondary-light">
                    <h4 className="font-medium text-text-primary mb-2">How do I download my CV?</h4>
                    <p className="text-sm text-text-muted">
                      Once you've filled out all sections, click the "Download PDF" button in the preview section to export your CV.
                    </p>
                  </div>
                  <div className="bg-secondary-dark rounded-lg p-4 border border-secondary-light">
                    <h4 className="font-medium text-text-primary mb-2">Can I save multiple versions of my CV?</h4>
                    <p className="text-sm text-text-muted">
                      Yes! Use the "CV Versions" tab to create and manage multiple versions of your CV for different job applications.
                    </p>
                  </div>
                  <div className="bg-secondary-dark rounded-lg p-4 border border-secondary-light">
                    <h4 className="font-medium text-text-primary mb-2">Is my data secure?</h4>
                    <p className="text-sm text-text-muted">
                      Absolutely. Your data is encrypted and stored securely. We never share your personal information with third parties.
                    </p>
                  </div>
                  <div className="bg-secondary-dark rounded-lg p-4 border border-secondary-light">
                    <h4 className="font-medium text-text-primary mb-2">What if I encounter a bug?</h4>
                    <p className="text-sm text-text-muted">
                      Please email us at cvbuilder04@gmail.com with details about the issue, including what you were doing when it occurred.
                    </p>
                  </div>
                </div>
              </div>

              {/* Database Connection Test */}
              <div className="mt-8">
                <SupabaseConnectionTest />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Section Reorder Modal */}
      {isSectionReorderOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8">
            <SectionReorder onClose={() => setIsSectionReorderOpen(false)} />
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isPreviewFullscreen && (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-secondary border-b border-secondary-light px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center">
                <FileText className="w-5 h-5 text-accent mr-2" />
                Preview - Fullscreen Mode
              </h3>
              <div className="flex items-center space-x-2">
                {/* Zoom Controls */}
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={previewZoom <= 50}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-text-primary bg-secondary-dark rounded-lg">
                  {previewZoom}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={previewZoom >= 150}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-hover text-text-muted hover:text-accent transition-colors"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-dark text-white transition-colors flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={togglePreviewFullscreen}
                className="px-4 py-2 rounded-lg bg-secondary-dark hover:bg-secondary text-text-primary border border-secondary-light transition-colors flex items-center space-x-2"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-white p-8">
            <div className="max-w-5xl mx-auto">
              <div
                className="shadow-2xl transition-transform duration-200"
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
              >
                <CVPreview />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 lg:bottom-8 right-8 z-40 p-4 bg-accent hover:bg-accent-dark text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          title="Scroll to top"
        >
          <ChevronDown className="w-6 h-6 rotate-180 group-hover:animate-bounce" />
        </button>
      )}

      {/* Mobile Bottom Navigation - Sticky */}
      {activeTab === 'builder' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-secondary-light shadow-2xl z-40 safe-area-pb">
          <div className="flex items-center justify-around px-2 py-3">
            {/* Quick Navigate */}
            <button
              type="button"
              onClick={() => {
                const nextSection = sections.findIndex(s => s.id === activeSection);
                const next = sections[(nextSection + 1) % sections.length];
                scrollToSection(next.id);
              }}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-lg hover:bg-surface-hover transition-all active:scale-95"
            >
              <ChevronDown className="w-5 h-5 text-accent" />
              <span className="text-xs text-text-muted mt-1">Next</span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={() => saveCV()}
              disabled={saveStatus === 'saving'}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-lg hover:bg-surface-hover transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5 text-accent" />
              <span className="text-xs text-text-muted mt-1">Save</span>
            </button>

            {/* Preview */}
            <button
              type="button"
              onClick={() => setIsMobilePreviewVisible(!isMobilePreviewVisible)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all active:scale-95 ${
                isMobilePreviewVisible ? 'bg-accent text-white' : 'hover:bg-surface-hover'
              }`}
            >
              <FileText className={`w-5 h-5 ${isMobilePreviewVisible ? 'text-white' : 'text-accent'}`} />
              <span className={`text-xs mt-1 ${isMobilePreviewVisible ? 'text-white' : 'text-text-muted'}`}>
                Preview
              </span>
            </button>

            {/* Templates */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-lg hover:bg-surface-hover transition-all active:scale-95"
            >
              <Settings className="w-5 h-5 text-accent" />
              <span className="text-xs text-text-muted mt-1">Template</span>
            </button>

            {/* More Actions */}
            <button
              type="button"
              onClick={() => setIsSectionReorderOpen(true)}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-lg hover:bg-surface-hover transition-all active:scale-95"
            >
              <List className="w-5 h-5 text-accent" />
              <span className="text-xs text-text-muted mt-1">Reorder</span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-primary-dark text-white py-12 mt-16 border-t border-secondary-light pb-safe lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-accent mr-2" />
                <h3 className="text-lg font-bold">CV Builder</h3>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                Create professional, ATS-friendly CVs that help you land your dream job.
                Trusted by thousands of professionals worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-text-primary">Features</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>• ATS-Optimized Templates</li>
                <li>• Real-time Preview</li>
                <li>• Job-Specific Optimization</li>
                <li>• PDF & DOC Export</li>
                <li>• Professional Formats</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-text-primary">Support</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>• Email verification required</li>
                <li>• Secure data storage</li>
                <li>• Privacy protected</li>
                <li>• Regular updates</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-light mt-8 pt-6 text-center">
            <p className="text-text-muted text-sm">
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
