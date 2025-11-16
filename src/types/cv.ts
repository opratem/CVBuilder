export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  classOfDegree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
  location?: string;
}

export interface BulletPoint {
  id: string;
  text: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  jobTitle?: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description?: string;
  bulletPoints: BulletPoint[];
}

export interface Skill {
  id: string;
  name: string;
  level?: number;
  category?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  url?: string;
  organization?: string;
}

export interface Extracurricular {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
  name?: string;
  role?: string;
  activity?: string;
  isOngoing?: boolean;
}

export interface CVSectionOrder {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface CV {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  extracurricular: Extracurricular[];
  templateId: string;
  sectionOrder?: CVSectionOrder[];
  jobSpecific?: {
    jobTitle: string;
    company: string;
    appliedOptimizations: string[];
    createdAt: string;
  };
}

// Create an alias for CVData that the new service expects
export type CVData = CV;

export const defaultCV: CV = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: ''
  },
  education: [],
  workExperience: [],
  skills: [],
  projects: [],
  certifications: [],
  extracurricular: [],
  templateId: 'modern',
  sectionOrder: [
    { id: 'personal', name: 'Personal Information', enabled: true, order: 0 },
    { id: 'work', name: 'Work Experience', enabled: true, order: 1 },
    { id: 'education', name: 'Education', enabled: true, order: 2 },
    { id: 'skills', name: 'Skills', enabled: true, order: 3 },
    { id: 'projects', name: 'Projects', enabled: true, order: 4 },
    { id: 'certifications', name: 'Certifications', enabled: true, order: 5 },
    { id: 'extracurricular', name: 'Extracurricular Activities', enabled: true, order: 6 }
  ]
};

export type TemplateId = 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'tech' | 'academic';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
}

export const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design with a sidebar for key information'
  },
  {
    id: 'classic',
    name: 'Classic (ATS-Optimized)',
    description: 'Traditional resume layout optimized for Applicant Tracking Systems (ATS) - Recommended for corporate applications'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Sleek and minimalist design focusing on content'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Professional design perfect for senior roles and leadership positions'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Eye-catching design ideal for creative industries and portfolio-driven roles'
  },
  {
    id: 'tech',
    name: 'Tech Professional',
    description: 'Developer-friendly layout with emphasis on technical skills and projects'
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Comprehensive format suitable for research, education, and academic positions'
  }
];
