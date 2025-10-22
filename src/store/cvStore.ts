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
  TemplateId
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

  // Save actions
  saveCV: async (retryCount = 0) => {
    const state = get();

    // Don't save if already saving
    if (state.saveStatus === 'saving') {
      return { success: false, error: 'Save already in progress' };
    }

    set({ saveStatus: 'saving' });

    // Reduce timeout to 15 seconds and add better progress tracking
    const saveTimeout = setTimeout(() => {
      console.warn('Save operation timed out after 15 seconds');
      set({ saveStatus: 'error' });
      setTimeout(() => set({ saveStatus: 'idle' }), 3000);
    }, 15000); // 15 second timeout

    try {
      // Validate CV data before saving
      if (!state.cv.personalInfo.fullName.trim()) {
        console.warn('Cannot save CV without a name');
        clearTimeout(saveTimeout);
        set({ saveStatus: 'error' });
        setTimeout(() => set({ saveStatus: 'idle' }), 3000);
        return { success: false, error: 'Name is required to save CV' };
      }

      // Create a clean copy of CV data to avoid circular references
      const cleanCVData = JSON.parse(JSON.stringify(state.cv));

      // Add additional validation and cleanup
      cleanCVData.workExperience = cleanCVData.workExperience.map(exp => ({
        ...exp,
        bulletPoints: exp.bulletPoints.filter(bp => bp && bp.text && bp.text.trim())
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

      const result = await cvDataService.saveCVData(sanitizedData, state.cv.templateId, 'My CV');

      clearTimeout(saveTimeout);

      if (result.success) {
        set({ saveStatus: 'saved' });
        // Reset status to idle after 2 seconds
        setTimeout(() => {
          const currentState = get();
          if (currentState.saveStatus === 'saved') {
            set({ saveStatus: 'idle' });
          }
        }, 2000);
        return { success: true };
      } else {
        // Retry once for network issues
        if (retryCount < 1 && (result.error?.includes('network') || result.error?.includes('timeout'))) {
          console.log('Retrying save due to network issue...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return get().saveCV(retryCount + 1);
        }

        console.error('Save failed:', result.error);
        set({ saveStatus: 'error' });
        setTimeout(() => set({ saveStatus: 'idle' }), 4000);
        return { success: false, error: result.error };
      }
    } catch (error) {
      clearTimeout(saveTimeout);
      console.error('Save error:', error);
      set({ saveStatus: 'error' });
      setTimeout(() => set({ saveStatus: 'idle' }), 4000);
      return { success: false, error: 'Failed to save CV' };
    }
  },

  loadCV: async () => {
    set({ isLoading: true });
    try {
      const result = await cvDataService.loadCVData();
      if (result.success && result.data) {
        set({
          cv: result.data.cv_data,
          isLoading: false,
          saveStatus: 'idle'
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      set({ isLoading: false });
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
