import { create } from 'zustand';
import { cvDataService } from '../services/cvDataService';
import type {
  CV,
  CVData,
  PersonalInfo,
  Education,
  WorkExperience,
  BulletPoint,
  Skill,
  Project,
  Certification,
  Extracurricular,
  TemplateId,
  CVSectionOrder
} from '../types/cv';
import { defaultCV } from '../types/cv';

// Types imported from cv.ts

interface CVStore {
  cv: CV;

  // Personal Info actions
  updatePersonalInfo: (updates: Partial<PersonalInfo>) => void;

  // Education actions
  addEducation: (education: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  // Work Experience actions
  addWorkExperience: (experience?: Omit<WorkExperience, 'id'>) => void;
  updateWorkExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  addBulletPoint: (experienceId: string, bulletPoint?: Omit<BulletPoint, 'id'>) => void;
  updateBulletPoint: (experienceId: string, bulletPointId: string, text: string) => void;
  removeBulletPoint: (experienceId: string, bulletPointId: string) => void;
  reorderBulletPoints: (experienceId: string, bulletPoints: BulletPoint[]) => void;

  // Skills actions
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  // Projects actions
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // Certifications actions
  addCertification: (certification: Omit<Certification, 'id'>) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  // Extracurricular actions
  addExtracurricular: (extracurricular: Omit<Extracurricular, 'id'>) => void;
  updateExtracurricular: (id: string, updates: Partial<Extracurricular>) => void;
  removeExtracurricular: (id: string) => void;

  // Template actions
  setTemplateId: (templateId: string) => void;

  // Section order actions
  updateSectionOrder: (sectionOrder: CVSectionOrder[]) => void;

  // Save actions
  saveCV: (retryCount?: number) => Promise<{ success: boolean; error?: string }>;
  loadCV: () => Promise<void>;
  isLoading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';

  // General actions
  resetCV: () => void;
  updateCV: (cvData: CVData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// LocalStorage helpers for guest mode
const LOCALSTORAGE_KEY = 'cv_builder_data';

const saveToLocalStorage = (cvData: CVData): boolean => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cvData));
    console.log('✅ CV saved to localStorage');
    return true;
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
    return false;
  }
};

const loadFromLocalStorage = (): CVData | null => {
  try {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY);
    if (saved) {
      console.log('✅ CV loaded from localStorage');
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
  }
  return null;
};

const triggerAutoSave = (getState: () => CVStore) => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(async () => {
    try {
      const state = getState();
      if (state.saveStatus !== 'saving') {
        await state.saveCV();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, 2000); // Auto-save after 2 seconds of inactivity
};

export const useCVStore = create<CVStore>((set, get) => ({
  cv: defaultCV,
  isLoading: false,
  saveStatus: 'idle',

  // Personal Info actions
  updatePersonalInfo: (updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        personalInfo: { ...state.cv.personalInfo, ...updates }
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Education actions
  addEducation: (education) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        education: [...state.cv.education, { ...education, id: generateId() }]
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateEducation: (id, updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        education: state.cv.education.map(edu =>
          edu.id === id ? { ...edu, ...updates } : edu
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeEducation: (id) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        education: state.cv.education.filter(edu => edu.id !== id)
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Work Experience actions
  addWorkExperience: (experience) => set((state) => {
    const defaultExperience = {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      bulletPoints: []
    };
    const newState = {
      cv: {
        ...state.cv,
        workExperience: [...state.cv.workExperience, { ...defaultExperience, ...experience, id: generateId() }]
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateWorkExperience: (id, updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        workExperience: state.cv.workExperience.map(exp =>
          exp.id === id ? { ...exp, ...updates } : exp
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeWorkExperience: (id) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        workExperience: state.cv.workExperience.filter(exp => exp.id !== id)
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  addBulletPoint: (experienceId, bulletPoint) => set((state) => {
    const defaultBulletPoint = { text: '' };
    const newState = {
      cv: {
        ...state.cv,
        workExperience: state.cv.workExperience.map(exp =>
          exp.id === experienceId
            ? { ...exp, bulletPoints: [...exp.bulletPoints, { ...defaultBulletPoint, ...bulletPoint, id: generateId() }] }
            : exp
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateBulletPoint: (experienceId, bulletPointId, text) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        workExperience: state.cv.workExperience.map(exp =>
          exp.id === experienceId
            ? {
                ...exp,
                bulletPoints: exp.bulletPoints.map(bp =>
                  bp.id === bulletPointId ? { ...bp, text } : bp
                )
              }
            : exp
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeBulletPoint: (experienceId, bulletPointId) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        workExperience: state.cv.workExperience.map(exp =>
          exp.id === experienceId
            ? {
                ...exp,
                bulletPoints: exp.bulletPoints.filter(bp => bp.id !== bulletPointId)
              }
            : exp
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  reorderBulletPoints: (experienceId, bulletPoints) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        workExperience: state.cv.workExperience.map(exp =>
          exp.id === experienceId ? { ...exp, bulletPoints } : exp
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Skills actions
  addSkill: (skill) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        skills: [...state.cv.skills, { ...skill, id: generateId() }]
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateSkill: (id, updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        skills: state.cv.skills.map(skill =>
          skill.id === id ? { ...skill, ...updates } : skill
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeSkill: (id) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        skills: state.cv.skills.filter(skill => skill.id !== id)
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Projects actions
  addProject: (project) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        projects: [...state.cv.projects, { ...project, id: generateId() }]
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateProject: (id, updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        projects: state.cv.projects.map(project =>
          project.id === id ? { ...project, ...updates } : project
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeProject: (id) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        projects: state.cv.projects.filter(project => project.id !== id)
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Certifications actions
  addCertification: (certification) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        certifications: [...state.cv.certifications, { ...certification, id: generateId() }]
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateCertification: (id, updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        certifications: state.cv.certifications.map(cert =>
          cert.id === id ? { ...cert, ...updates } : cert
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeCertification: (id) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        certifications: state.cv.certifications.filter(cert => cert.id !== id)
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Extracurricular actions
  addExtracurricular: (extracurricular) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        extracurricular: [...state.cv.extracurricular, { ...extracurricular, id: generateId() }]
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  updateExtracurricular: (id, updates) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        extracurricular: state.cv.extracurricular.map(extra =>
          extra.id === id ? { ...extra, ...updates } : extra
        )
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  removeExtracurricular: (id) => set((state) => {
    const newState = {
      cv: {
        ...state.cv,
        extracurricular: state.cv.extracurricular.filter(extra => extra.id !== id)
      }
    };
    triggerAutoSave(get);
    return newState;
  }),

  // Template actions
  setTemplateId: (templateId) => set((state) => {
    const newState = { cv: { ...state.cv, templateId } };
    triggerAutoSave(get);
    return newState;
  }),

  // Section order actions
  updateSectionOrder: (sectionOrder) => set((state) => {
    const newState = { cv: { ...state.cv, sectionOrder } };
    triggerAutoSave(get);
    return newState;
  }),

  // Save actions
  saveCV: async (retryCount = 0) => {
    const state = get();

    // Don't save if already saving (but allow retries)
    if (state.saveStatus === 'saving' && retryCount === 0) {
      console.log('⚠️ Save already in progress, skipping...');
      return { success: false, error: 'Save already in progress' };
    }

    // Only set to 'saving' on initial attempt, not on retries
    if (retryCount === 0) {
      set({ saveStatus: 'saving' });
    }

    try {
      // Create a clean copy of CV data to avoid circular references
      const cleanCVData = JSON.parse(JSON.stringify(state.cv));

      // Add additional validation and cleanup
      cleanCVData.workExperience = cleanCVData.workExperience.map((exp: WorkExperience) => ({
        ...exp,
        bulletPoints: exp.bulletPoints.filter((bp: BulletPoint) => bp && bp.text && bp.text.trim())
      }));

      // Clean up any undefined or null values
      const sanitizeObject = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sanitizeObject);

        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = sanitizeObject(value);
          }
        }
        return cleaned;
      };

      const sanitizedData = sanitizeObject(cleanCVData);

      // Always save to localStorage as backup
      const localSaveSuccess = saveToLocalStorage(sanitizedData);

      // Try to save to Supabase for authenticated users
      const result = await cvDataService.saveCVData(sanitizedData, state.cv.templateId, 'My CV');

      if (result.success) {
        // Supabase save succeeded
        console.log('✅ CV saved to Supabase and localStorage');
        set({ saveStatus: 'saved' });
        setTimeout(() => {
          const currentState = get();
          if (currentState.saveStatus === 'saved') {
            set({ saveStatus: 'idle' });
          }
        }, 2000);
        return { success: true };
      } else {
        // Supabase save failed (user might be guest or network issue)
        if (result.error?.includes('not logged in') || result.error?.includes('must be logged in')) {
          // User is in guest mode - localStorage save is enough
          if (localSaveSuccess) {
            console.log('✅ CV saved to localStorage (Guest mode)');
            set({ saveStatus: 'saved' });
            setTimeout(() => {
              const currentState = get();
              if (currentState.saveStatus === 'saved') {
                set({ saveStatus: 'idle' });
              }
            }, 2000);
            return { success: true };
          }
        }

        // Retry once for network issues
        if (retryCount < 1 && (result.error?.includes('network') || result.error?.includes('timeout') || result.error?.includes('timed out'))) {
          console.log(`🔄 Retrying save (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Retry without resetting the saving status
          return get().saveCV(retryCount + 1);
        }

        // Show error but still consider it saved if localStorage worked
        if (localSaveSuccess) {
          console.warn('⚠️ Supabase save failed but localStorage saved:', result.error);
          set({ saveStatus: 'saved' });
          setTimeout(() => set({ saveStatus: 'idle' }), 2000);
          return { success: true, error: result.error };
        }

        console.error('❌ Save failed:', result.error);
        set({ saveStatus: 'error' });
        setTimeout(() => set({ saveStatus: 'idle' }), 4000);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      set({ saveStatus: 'error' });
      setTimeout(() => set({ saveStatus: 'idle' }), 4000);
      return { success: false, error: 'Failed to save CV' };
    }
  },

  loadCV: async () => {
    set({ isLoading: true });
    try {
      // Try to load from Supabase first (for authenticated users)
      const result = await cvDataService.loadCVData();

      if (result.success && result.data && !Array.isArray(result.data)) {
        console.log('✅ CV loaded from Supabase');
        set({
          cv: result.data.cv_data,
          isLoading: false,
          saveStatus: 'idle'
        });
        return;
      }

      // If Supabase load failed or user is guest, try localStorage
      const localData = loadFromLocalStorage();
      if (localData) {
        console.log('✅ CV loaded from localStorage');
        set({
          cv: localData,
          isLoading: false,
          saveStatus: 'idle'
        });
        return;
      }

      // No data found, use default
      console.log('No CV data found, using default');
      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading CV:', error);

      // Try localStorage as fallback on error
      const localData = loadFromLocalStorage();
      if (localData) {
        console.log('✅ CV loaded from localStorage (fallback)');
        set({
          cv: localData,
          isLoading: false,
          saveStatus: 'idle'
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  // General actions
  resetCV: () => {
    set({ cv: defaultCV });
    triggerAutoSave(get);
  },

  updateCV: (cvData) => {
    set({ cv: cvData });
    triggerAutoSave(get);
  }
}));

// Auto-save debounce timeout
let autoSaveTimeout: NodeJS.Timeout | null = null;