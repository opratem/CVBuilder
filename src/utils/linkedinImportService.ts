import type { CVData, PersonalInfo, WorkExperience, Education, Skill } from '../types/cv';

export interface LinkedInImportData {
  personalInfo: Partial<PersonalInfo>;
  workExperience: Partial<WorkExperience>[];
  education: Partial<Education>[];
  skills: string[];
  summary?: string;
  profilePicture?: string;
}

export interface LinkedInProfileData {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  publicProfileUrl?: string;
  emailAddress?: string;
  phoneNumbers?: { type: string; number: string }[];
  profilePicture?: string;
  location?: {
    name: string;
    country?: string;
  };
  positions?: {
    title: string;
    company: { name: string };
    location?: { name: string };
    startDate: { year: number; month?: number };
    endDate?: { year: number; month?: number };
    isCurrent: boolean;
    summary?: string;
    description?: string;
    skills?: string[];
  }[];
  educations?: {
    schoolName: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate: { year: number; month?: number };
    endDate?: { year: number; month?: number };
    grade?: string;
    notes?: string;
    activities?: string;
  }[];
  skills?: {
    name: string;
    endorsements?: number;
  }[];
  certifications?: {
    name: string;
    authority?: string;
    url?: string;
    startDate?: { year: number; month?: number };
    endDate?: { year: number; month?: number };
  }[];
  languages?: {
    name: string;
    proficiency?: string;
  }[];
}

export interface LinkedInImportResult {
  success: boolean;
  data?: LinkedInImportData;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Enhanced import guide with file upload options
export const LINKEDIN_IMPORT_GUIDE = {
  title: "How to Import from LinkedIn",
  steps: [
    {
      title: "Method 1: LinkedIn Data Export",
      description: "Go to LinkedIn Settings & Privacy > Data Privacy > Get a copy of your data",
      detail: "Request a download of your profile data. LinkedIn will email you a link to download your data as a ZIP file. This is the most comprehensive method."
    },
    {
      title: "Method 2: Manual Profile Copy",
      description: "Copy information directly from your LinkedIn profile",
      detail: "Open your LinkedIn profile and manually copy the information into our guided form below."
    },
    {
      title: "Method 3: Resume/CV Upload",
      description: "Upload an existing resume or CV",
      detail: "If you have a current resume, you can upload it and we'll help extract the information."
    }
  ],
  fileFormats: [
    "LinkedIn Data Export (ZIP file)",
    "LinkedIn Profile JSON",
    "PDF Resume/CV",
    "Word Document (.docx)",
    "Text file (.txt)"
  ],
  alternativeMethod: {
    title: "Quick Manual Import",
    description: "You can also manually copy and paste information from your LinkedIn profile using our guided form below."
  }
};

// Enhanced parsing with better error handling
export const parseLinkedInData = (profileData: LinkedInProfileData): LinkedInImportResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  try {
    // Enhanced personal info parsing
    const personalInfo: Partial<PersonalInfo> = {};

    if (profileData.firstName && profileData.lastName) {
      personalInfo.fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;
    } else {
      warnings.push("Full name information is incomplete");
    }

    if (profileData.headline) {
      // Better headline parsing - extract job title from complex headlines
      const cleanHeadline = profileData.headline.split('|')[0]?.split(' at ')[0]?.trim();
      personalInfo.jobTitle = cleanHeadline || profileData.headline;
    }

    if (profileData.summary) {
      personalInfo.summary = profileData.summary.trim();
    }

    if (profileData.publicProfileUrl) {
      personalInfo.linkedin = profileData.publicProfileUrl;
    } else {
      suggestions.push("Add your LinkedIn profile URL for better networking");
    }

    if (profileData.emailAddress) {
      personalInfo.email = profileData.emailAddress;
    }

    if (profileData.phoneNumbers && profileData.phoneNumbers.length > 0) {
      personalInfo.phone = profileData.phoneNumbers[0].number;
    }

    if (profileData.location) {
      personalInfo.location = profileData.location.name;
    }

    // Enhanced work experience parsing
    const workExperience: Partial<WorkExperience>[] = [];
    if (profileData.positions && profileData.positions.length > 0) {
      profileData.positions.forEach((position, index) => {
        try {
          const experience: Partial<WorkExperience> = {
            id: `linkedin-exp-${index}`,
            company: position.company.name,
            position: position.title,
            location: position.location?.name || '',
            startDate: formatLinkedInDate(position.startDate),
            endDate: position.endDate ? formatLinkedInDate(position.endDate) : '',
            isCurrentJob: position.isCurrent,
            description: position.summary || position.description || '',
            bulletPoints: extractBulletPoints(position.description || position.summary || '')
          };

          workExperience.push(experience);
        } catch (error) {
          warnings.push(`Could not parse work experience ${index + 1}: ${position.title}`);
        }
      });
    } else {
      suggestions.push("Add work experience from your LinkedIn profile");
    }

    // Enhanced education parsing
    const education: Partial<Education>[] = [];
    if (profileData.educations && profileData.educations.length > 0) {
      profileData.educations.forEach((edu, index) => {
        try {
          const educationEntry: Partial<Education> = {
            id: `linkedin-edu-${index}`,
            institution: edu.schoolName,
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate: formatLinkedInDate(edu.startDate),
            endDate: formatLinkedInDate(edu.endDate),
            gpa: edu.grade || '',
            description: edu.notes || edu.activities || ''
          };

          education.push(educationEntry);
        } catch (error) {
          warnings.push(`Could not parse education ${index + 1}: ${edu.schoolName}`);
        }
      });
    }

    // Enhanced skills parsing with endorsement consideration
    const skills: string[] = [];
    if (profileData.skills && profileData.skills.length > 0) {
      profileData.skills.forEach(skill => {
        if (skill.name && skill.name.trim()) {
          skills.push(skill.name.trim());
        }
      });

      // Sort skills by endorsements if available
      if (profileData.skills.some(skill => skill.endorsements)) {
        const sortedSkills = profileData.skills
          .filter(skill => skill.name && skill.name.trim())
          .sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0))
          .map(skill => skill.name.trim());
        skills.splice(0, skills.length, ...sortedSkills);
      }
    }

    const importData: LinkedInImportData = {
      personalInfo,
      workExperience,
      education,
      skills,
      summary: profileData.summary,
      profilePicture: profileData.profilePicture
    };

    return {
      success: true,
      data: importData,
      errors,
      warnings,
      suggestions
    };

  } catch (error) {
    errors.push(`Failed to parse LinkedIn data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      errors,
      warnings,
      suggestions
    };
  }
};

// Enhanced date formatting with better error handling
const formatLinkedInDate = (date?: { year: number; month?: number }): string => {
  if (!date || !date.year) return '';

  try {
    const year = date.year;
    const month = date.month || 1;

    // Validate date values
    if (year < 1900 || year > new Date().getFullYear() + 10) {
      throw new Error(`Invalid year: ${year}`);
    }

    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}`);
    }

    return `${year}-${month.toString().padStart(2, '0')}-01`;
  } catch (error) {
    console.warn(`Date formatting error:`, error);
    return '';
  }
};

// Enhanced bullet point extraction with better parsing
const extractBulletPoints = (description: string): { id: string; text: string }[] => {
  if (!description || description.trim().length === 0) return [];

  try {
    // Multiple bullet point patterns
    const bulletPatterns = [
      /[•·∙▪▫◦‣⁃]/g,  // Unicode bullets
      /^\s*[-*+]\s+/gm, // Dash/asterisk bullets
      /^\s*\d+\.\s+/gm, // Numbered lists
      /^\s*[a-zA-Z]\.\s+/gm // Lettered lists
    ];

    let bullets: string[] = [];

    // Try each pattern
    for (const pattern of bulletPatterns) {
      const matches = description.split(pattern).filter(bullet => bullet.trim().length > 10);
      if (matches.length > 1) {
        bullets = matches.slice(1); // Skip first empty match
        break;
      }
    }

    // If no bullet patterns found, split by sentences or line breaks
    if (bullets.length === 0) {
      bullets = description
        .split(/[.!?]\s+|\n\s*/)
        .filter(sentence => sentence.trim().length > 15)
        .slice(0, 5);
    }

    // Clean and format bullets
    const formattedBullets = bullets
      .map(bullet => bullet.trim())
      .filter(bullet => bullet.length > 10)
      .slice(0, 6) // Limit to 6 bullet points
      .map((text, index) => ({
        id: `bullet-${Date.now()}-${index}`,
        text: text.endsWith('.') ? text : `${text}.`
      }));

    // If still no bullets, create one from the full description
    if (formattedBullets.length === 0 && description.trim().length > 0) {
      return [{
        id: `bullet-${Date.now()}-0`,
        text: description.trim().length > 200
          ? `${description.trim().substring(0, 197)}...`
          : description.trim()
      }];
    }

    return formattedBullets;
  } catch (error) {
    console.warn('Error extracting bullet points:', error);
    return [{
      id: `bullet-${Date.now()}-0`,
      text: description.trim()
    }];
  }
};

// Enhanced application with better conflict resolution
export const applyLinkedInImport = (currentCV: CVData, importData: LinkedInImportData): CVData => {
  try {
    const updatedCV: CVData = { ...currentCV };

    // Update personal info with smart merging
    if (importData.personalInfo) {
      const mergedPersonalInfo = { ...updatedCV.personalInfo };

      Object.entries(importData.personalInfo).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Only override if current value is empty or if imported value is more complete
          const currentValue = mergedPersonalInfo[key as keyof PersonalInfo];
          if (!currentValue || (typeof value === 'string' && value.length > (currentValue as string).length)) {
            mergedPersonalInfo[key as keyof PersonalInfo] = value as any;
          }
        }
      });

      updatedCV.personalInfo = mergedPersonalInfo;
    }

    // Add work experience with duplicate detection
    if (importData.workExperience.length > 0) {
      const existingCompanies = new Set(
        updatedCV.workExperience.map(exp =>
          `${exp.company.toLowerCase()}-${exp.position.toLowerCase()}`
        )
      );

      const newExperiences = importData.workExperience
        .filter(exp => exp.company && exp.position)
        .filter(exp => {
          const key = `${exp.company!.toLowerCase()}-${exp.position!.toLowerCase()}`;
          return !existingCompanies.has(key);
        })
        .map(exp => ({
          id: exp.id || `exp-${Date.now()}-${Math.random()}`,
          company: exp.company || '',
          position: exp.position || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          isCurrentJob: exp.isCurrentJob || false,
          description: exp.description || '',
          bulletPoints: exp.bulletPoints || []
        }));

      updatedCV.workExperience = [...newExperiences, ...updatedCV.workExperience];
    }

    // Add education with duplicate detection
    if (importData.education.length > 0) {
      const existingEducation = new Set(
        updatedCV.education.map(edu =>
          `${edu.institution.toLowerCase()}-${edu.degree.toLowerCase()}`
        )
      );

      const newEducation = importData.education
        .filter(edu => edu.institution && edu.degree)
        .filter(edu => {
          const key = `${edu.institution!.toLowerCase()}-${edu.degree!.toLowerCase()}`;
          return !existingEducation.has(key);
        })
        .map(edu => ({
          id: edu.id || `edu-${Date.now()}-${Math.random()}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          classOfDegree: edu.classOfDegree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          description: edu.description || ''
        }));

      updatedCV.education = [...newEducation, ...updatedCV.education];
    }

    // Add skills with intelligent categorization
    if (importData.skills.length > 0) {
      const existingSkillNames = new Set(
        updatedCV.skills.map(skill => skill.name.toLowerCase())
      );

      const newSkills = importData.skills
        .filter(skillName => !existingSkillNames.has(skillName.toLowerCase()))
        .map(skillName => ({
          id: `skill-${Date.now()}-${Math.random()}`,
          name: skillName,
          level: determineSkillLevel(skillName),
          category: categorizeSkill(skillName)
        }));

      updatedCV.skills = [...updatedCV.skills, ...newSkills];
    }

    return updatedCV;
  } catch (error) {
    console.error('Error applying LinkedIn import:', error);
    throw new Error(`Failed to apply LinkedIn import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to determine skill level based on common patterns
const determineSkillLevel = (skillName: string): number => {
  const skill = skillName.toLowerCase();

  // Advanced/Expert level indicators
  if (skill.includes('senior') || skill.includes('expert') || skill.includes('advanced') ||
      skill.includes('architect') || skill.includes('lead')) {
    return 5;
  }

  // Intermediate level indicators
  if (skill.includes('intermediate') || skill.includes('proficient')) {
    return 4;
  }

  // Beginner level indicators
  if (skill.includes('basic') || skill.includes('beginner') || skill.includes('entry')) {
    return 2;
  }

  // Default to intermediate
  return 3;
};

// Helper function to categorize skills
const categorizeSkill = (skillName: string): 'technical' | 'soft' | 'language' => {
  const skill = skillName.toLowerCase();

  // Language skills
  if (skill.includes('english') || skill.includes('spanish') || skill.includes('french') ||
      skill.includes('german') || skill.includes('chinese') || skill.includes('japanese') ||
      skill.includes('language')) {
    return 'language';
  }

  // Soft skills
  const softSkillPatterns = [
    'leadership', 'communication', 'teamwork', 'management', 'presentation',
    'negotiation', 'problem solving', 'critical thinking', 'creativity',
    'adaptability', 'time management', 'organization', 'collaboration'
  ];

  if (softSkillPatterns.some(pattern => skill.includes(pattern))) {
    return 'soft';
  }

  // Default to technical
  return 'technical';
};

// Enhanced validation with more comprehensive checks
export const validateLinkedInImport = (importData: LinkedInImportData): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  completeness: number;
} => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let completenessScore = 0;
  const maxScore = 10;

  // Personal info validation
  if (!importData.personalInfo.fullName) {
    warnings.push("Full name is missing");
  } else {
    completenessScore += 2;
  }

  if (!importData.personalInfo.jobTitle) {
    warnings.push("Job title/headline is missing");
  } else {
    completenessScore += 1;
  }

  if (!importData.personalInfo.email) {
    suggestions.push("Add email address for contact information");
  } else {
    completenessScore += 1;
  }

  if (!importData.personalInfo.summary) {
    suggestions.push("Consider adding a professional summary");
  } else {
    completenessScore += 2;
  }

  // Work experience validation
  if (importData.workExperience.length === 0) {
    warnings.push("No work experience found");
  } else {
    completenessScore += 2;

    importData.workExperience.forEach((exp, index) => {
      if (!exp.company) warnings.push(`Work experience ${index + 1}: Company name missing`);
      if (!exp.position) warnings.push(`Work experience ${index + 1}: Position title missing`);
      if (!exp.startDate) suggestions.push(`Work experience ${index + 1}: Start date missing`);
      if (!exp.description && (!exp.bulletPoints || exp.bulletPoints.length === 0)) {
        suggestions.push(`Work experience ${index + 1}: Add job description or achievements`);
      }
    });
  }

  // Education validation
  if (importData.education.length === 0) {
    suggestions.push("Consider adding education information");
  } else {
    completenessScore += 1;
  }

  // Skills validation
  if (importData.skills.length === 0) {
    suggestions.push("Consider adding skills from your LinkedIn profile");
  } else if (importData.skills.length < 5) {
    suggestions.push("Consider adding more skills to showcase your expertise");
    completenessScore += 0.5;
  } else {
    completenessScore += 1;
  }

  // Contact info completeness
  if (importData.personalInfo.phone) completenessScore += 0.25;
  if (importData.personalInfo.location) completenessScore += 0.25;
  if (importData.personalInfo.linkedin) completenessScore += 0.25;

  const completeness = Math.round((completenessScore / maxScore) * 100);
  const isValid = warnings.length === 0;

  return {
    isValid,
    warnings,
    suggestions,
    completeness
  };
};

// File upload support functions
export const processLinkedInFile = async (file: File): Promise<LinkedInImportResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  try {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      return await processLinkedInJSON(file);
    } else if (fileName.endsWith('.csv')) {
      return await processLinkedInCSV(file);
    } else if (fileType === 'application/pdf') {
      errors.push("PDF parsing not yet implemented. Please use manual import.");
    } else if (fileType.includes('word') || fileName.endsWith('.docx')) {
      errors.push("Word document parsing not yet implemented. Please use manual import.");
    } else {
      errors.push(`Unsupported file type: ${fileType}. Please use JSON, CSV, or manual import.`);
    }

    return {
      success: false,
      errors,
      warnings,
      suggestions
    };
  } catch (error) {
    errors.push(`File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      errors,
      warnings,
      suggestions
    };
  }
};

// Process LinkedIn JSON export
const processLinkedInJSON = async (file: File): Promise<LinkedInImportResult> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Map LinkedIn export structure to our format
    const profileData: LinkedInProfileData = {
      firstName: data.firstName || data.profile?.firstName,
      lastName: data.lastName || data.profile?.lastName,
      headline: data.headline || data.profile?.headline,
      summary: data.summary || data.profile?.summary,
      publicProfileUrl: data.publicProfileUrl || data.profile?.publicProfileUrl,
      emailAddress: data.emailAddress || data.email,
      positions: data.positions || data.experience,
      educations: data.educations || data.education,
      skills: data.skills,
      location: data.location
    };

    return parseLinkedInData(profileData);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON file: ${error instanceof Error ? error.message : 'Invalid JSON format'}`],
      warnings: [],
      suggestions: ['Make sure you uploaded a valid LinkedIn data export file']
    };
  }
};

// Process LinkedIn CSV export
const processLinkedInCSV = async (file: File): Promise<LinkedInImportResult> => {
  try {
    const text = await file.text();
    // Basic CSV parsing - this would need a proper CSV parser for production
    const lines = text.split('\n');

    // This is a simplified implementation
    // In production, you'd want to use a proper CSV parsing library

    return {
      success: false,
      errors: ['CSV parsing not fully implemented yet'],
      warnings: ['Please use the JSON export or manual import method'],
      suggestions: ['Use the manual import form below for best results']
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Invalid CSV format'}`],
      warnings: [],
      suggestions: ['Make sure you uploaded a valid LinkedIn CSV export file']
    };
  }
};

export default {
  parseLinkedInData,
  applyLinkedInImport,
  validateLinkedInImport,
  processLinkedInFile,
  LINKEDIN_IMPORT_GUIDE
};
