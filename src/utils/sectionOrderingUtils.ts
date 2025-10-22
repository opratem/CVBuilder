import type { CVData, CVSectionOrder } from '../types/cv';

export interface SectionRenderInfo {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  hasContent: boolean;
}

// Get sections in their display order, filtering out disabled sections
export const getOrderedSections = (cv: CVData): SectionRenderInfo[] => {
  const defaultOrder: CVSectionOrder[] = [
    { id: 'personalInfo', name: 'Personal Information', enabled: true, order: 0 },
    { id: 'summary', name: 'Professional Summary', enabled: true, order: 1 },
    { id: 'workExperience', name: 'Work Experience', enabled: true, order: 2 },
    { id: 'skills', name: 'Skills', enabled: true, order: 3 },
    { id: 'education', name: 'Education', enabled: true, order: 4 },
    { id: 'projects', name: 'Projects', enabled: true, order: 5 },
    { id: 'certifications', name: 'Certifications', enabled: true, order: 6 },
    { id: 'extracurricular', name: 'Extracurricular Activities', enabled: true, order: 7 }
  ];

  const sectionOrder = cv.sectionOrder || defaultOrder;

  return sectionOrder
    .map(section => ({
      ...section,
      hasContent: hasContentForSection(cv, section.id)
    }))
    .filter(section => section.enabled && section.hasContent)
    .sort((a, b) => a.order - b.order);
};

// Check if a section has content to display
export const hasContentForSection = (cv: CVData, sectionId: string): boolean => {
  switch (sectionId) {
    case 'personalInfo':
      return !!(cv.personalInfo.fullName || cv.personalInfo.jobTitle);

    case 'summary':
      return !!(cv.personalInfo.summary && cv.personalInfo.summary.trim().length > 0);

    case 'workExperience':
      return cv.workExperience.length > 0;

    case 'skills':
      return cv.skills.length > 0;

    case 'education':
      return cv.education.length > 0;

    case 'projects':
      return cv.projects.length > 0;

    case 'certifications':
      return cv.certifications.length > 0;

    case 'extracurricular':
      return cv.extracurricular.length > 0;

    default:
      return false;
  }
};

// Get section data by ID
export const getSectionData = (cv: CVData, sectionId: string): any => {
  switch (sectionId) {
    case 'personalInfo':
      return cv.personalInfo;

    case 'summary':
      return cv.personalInfo.summary;

    case 'workExperience':
      return cv.workExperience;

    case 'skills':
      return cv.skills;

    case 'education':
      return cv.education;

    case 'projects':
      return cv.projects;

    case 'certifications':
      return cv.certifications;

    case 'extracurricular':
      return cv.extracurricular;

    default:
      return null;
  }
};

// Migrate old CV data to include section ordering
export const migrateCVToSectionOrdering = (cv: CVData): CVData => {
  if (cv.sectionOrder) {
    return cv; // Already has section ordering
  }

  const defaultOrder: CVSectionOrder[] = [
    { id: 'personalInfo', name: 'Personal Information', enabled: true, order: 0 },
    { id: 'summary', name: 'Professional Summary', enabled: true, order: 1 },
    { id: 'workExperience', name: 'Work Experience', enabled: true, order: 2 },
    { id: 'skills', name: 'Skills', enabled: true, order: 3 },
    { id: 'education', name: 'Education', enabled: true, order: 4 },
    { id: 'projects', name: 'Projects', enabled: true, order: 5 },
    { id: 'certifications', name: 'Certifications', enabled: true, order: 6 },
    { id: 'extracurricular', name: 'Extracurricular Activities', enabled: true, order: 7 }
  ];

  return {
    ...cv,
    sectionOrder: defaultOrder
  };
};

// Get section title for display
export const getSectionTitle = (sectionId: string): string => {
  const titleMap: Record<string, string> = {
    personalInfo: 'Personal Information',
    summary: 'Professional Summary',
    workExperience: 'Work Experience',
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    extracurricular: 'Extracurricular Activities'
  };

  return titleMap[sectionId] || 'Unknown Section';
};

// Check if section should be rendered (enabled and has content)
export const shouldRenderSection = (cv: CVData, sectionId: string): boolean => {
  const sectionOrder = cv.sectionOrder || [];
  const section = sectionOrder.find(s => s.id === sectionId);

  if (!section || !section.enabled) {
    return false;
  }

  return hasContentForSection(cv, sectionId);
};

// Get next and previous enabled sections for navigation
export const getSectionNavigation = (cv: CVData, currentSectionId: string): {
  previous: string | null;
  next: string | null;
} => {
  const orderedSections = getOrderedSections(cv);
  const currentIndex = orderedSections.findIndex(s => s.id === currentSectionId);

  return {
    previous: currentIndex > 0 ? orderedSections[currentIndex - 1].id : null,
    next: currentIndex < orderedSections.length - 1 ? orderedSections[currentIndex + 1].id : null
  };
};
