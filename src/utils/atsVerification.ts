import type { CV } from '../types/cv';

export interface ATSCheckResult {
  passed: boolean;
  score: number;
  checks: ATSCheck[];
  suggestions: string[];
}

export interface ATSCheck {
  id: string;
  name: string;
  category: 'critical' | 'important' | 'recommended';
  passed: boolean;
  message: string;
  weight: number;
}

export const verifyATSCompatibility = (cv: CV): ATSCheckResult => {
  const checks: ATSCheck[] = [];

  // Personal Information Checks
  checks.push({
    id: 'full-name',
    name: 'Full Name Present',
    category: 'critical',
    passed: cv.personalInfo.fullName.trim().length > 0,
    message: cv.personalInfo.fullName.trim().length > 0
      ? 'Full name is provided'
      : 'Full name is required for ATS parsing',
    weight: 15
  });

  checks.push({
    id: 'email',
    name: 'Email Address',
    category: 'critical',
    passed: cv.personalInfo.email.includes('@') && cv.personalInfo.email.includes('.'),
    message: cv.personalInfo.email.includes('@') && cv.personalInfo.email.includes('.')
      ? 'Valid email address provided'
      : 'Valid email address is required',
    weight: 15
  });

  checks.push({
    id: 'phone',
    name: 'Phone Number',
    category: 'important',
    passed: cv.personalInfo.phone.trim().length > 0,
    message: cv.personalInfo.phone.trim().length > 0
      ? 'Phone number provided'
      : 'Phone number helps with ATS scoring',
    weight: 10
  });

  checks.push({
    id: 'location',
    name: 'Location Information',
    category: 'important',
    passed: cv.personalInfo.location.trim().length > 0,
    message: cv.personalInfo.location.trim().length > 0
      ? 'Location information provided'
      : 'Location helps with regional job matching',
    weight: 8
  });

  // Professional Summary Check
  const summaryWordCount = cv.personalInfo.summary.split(' ').filter(word => word.length > 0).length;
  checks.push({
    id: 'summary-length',
    name: 'Professional Summary Length',
    category: 'important',
    passed: summaryWordCount >= 20 && summaryWordCount <= 150,
    message: summaryWordCount >= 20 && summaryWordCount <= 150
      ? `Professional summary has optimal length (${summaryWordCount} words)`
      : summaryWordCount < 20
        ? `Professional summary too short (${summaryWordCount} words). Aim for 20-150 words.`
        : `Professional summary too long (${summaryWordCount} words). Aim for 20-150 words.`,
    weight: 12
  });

  // Work Experience Checks
  checks.push({
    id: 'work-experience',
    name: 'Work Experience Present',
    category: 'critical',
    passed: cv.workExperience.length > 0,
    message: cv.workExperience.length > 0
      ? `${cv.workExperience.length} work experience entries found`
      : 'At least one work experience entry is recommended',
    weight: 20
  });

  const workExpWithBullets = cv.workExperience.filter(exp => exp.bulletPoints.length > 0).length;
  checks.push({
    id: 'work-descriptions',
    name: 'Work Experience Descriptions',
    category: 'important',
    passed: workExpWithBullets >= cv.workExperience.length * 0.8,
    message: workExpWithBullets >= cv.workExperience.length * 0.8
      ? 'Most work experiences have detailed descriptions'
      : 'Add bullet points to describe your achievements and responsibilities',
    weight: 15
  });

  // Date Format Check
  const hasValidDates = cv.workExperience.every(exp =>
    exp.startDate && (exp.endDate || exp.isCurrentJob)
  );
  checks.push({
    id: 'employment-dates',
    name: 'Employment Dates',
    category: 'important',
    passed: hasValidDates,
    message: hasValidDates
      ? 'All work experiences have proper dates'
      : 'Ensure all work experiences have start and end dates',
    weight: 10
  });

  // Skills Check
  checks.push({
    id: 'skills-count',
    name: 'Skills Section',
    category: 'important',
    passed: cv.skills.length >= 5,
    message: cv.skills.length >= 5
      ? `${cv.skills.length} skills listed`
      : `Only ${cv.skills.length} skills listed. Add more relevant skills for better ATS matching.`,
    weight: 12
  });

  // Education Check
  checks.push({
    id: 'education',
    name: 'Education Information',
    category: 'recommended',
    passed: cv.education.length > 0,
    message: cv.education.length > 0
      ? 'Education information provided'
      : 'Education information can improve ATS scoring',
    weight: 8
  });

  // Template Check (Classic is most ATS-friendly)
  checks.push({
    id: 'ats-template',
    name: 'ATS-Optimized Template',
    category: 'recommended',
    passed: cv.templateId === 'classic',
    message: cv.templateId === 'classic'
      ? 'Using ATS-optimized Classic template'
      : 'Consider using the Classic template for maximum ATS compatibility',
    weight: 5
  });

  // Check for action verbs in experience
  const actionVerbsUsed = checkActionVerbs(cv);
  checks.push({
    id: 'action-verbs',
    name: 'Action Verbs in Experience',
    category: 'important',
    passed: actionVerbsUsed.count >= 5,
    message: actionVerbsUsed.count >= 5
      ? `Good use of action verbs (${actionVerbsUsed.count} found)`
      : `Use more action verbs in your experience descriptions (${actionVerbsUsed.count} found). Try: achieved, managed, developed, implemented, etc.`,
    weight: 10
  });

  // Check for quantified achievements
  const quantifiedAchievements = checkQuantifiedAchievements(cv);
  checks.push({
    id: 'quantified-achievements',
    name: 'Quantified Achievements',
    category: 'important',
    passed: quantifiedAchievements >= 3,
    message: quantifiedAchievements >= 3
      ? `Good use of numbers and metrics (${quantifiedAchievements} found)`
      : `Include more quantified achievements with numbers, percentages, or metrics (${quantifiedAchievements} found)`,
    weight: 15
  });

  // Check for proper section headers
  const hasProperSections = checkRequiredSections(cv);
  checks.push({
    id: 'section-headers',
    name: 'Standard Section Headers',
    category: 'recommended',
    passed: hasProperSections.score >= 0.8,
    message: hasProperSections.score >= 0.8
      ? 'CV contains standard ATS-recognizable sections'
      : `Missing some standard sections. Consider adding: ${hasProperSections.missing.join(', ')}`,
    weight: 8
  });

  // Check for consistent date formatting
  const dateConsistency = checkDateConsistency(cv);
  checks.push({
    id: 'date-consistency',
    name: 'Consistent Date Format',
    category: 'recommended',
    passed: dateConsistency,
    message: dateConsistency
      ? 'Date formats are consistent throughout CV'
      : 'Ensure all dates follow a consistent format (e.g., MM/YYYY)',
    weight: 5
  });

  // Check for appropriate CV length
  const contentLength = calculateContentLength(cv);
  checks.push({
    id: 'cv-length',
    name: 'Appropriate CV Length',
    category: 'recommended',
    passed: contentLength >= 300 && contentLength <= 1500,
    message: contentLength >= 300 && contentLength <= 1500
      ? `CV length is appropriate (${contentLength} words)`
      : contentLength < 300
        ? `CV might be too short (${contentLength} words). Add more detail to reach 300-1500 words.`
        : `CV might be too long (${contentLength} words). Consider condensing to 300-1500 words.`,
    weight: 6
  });

  // Check for skills variety
  const skillsVariety = checkSkillsVariety(cv);
  checks.push({
    id: 'skills-variety',
    name: 'Skills Variety',
    category: 'recommended',
    passed: skillsVariety.hasGoodVariety,
    message: skillsVariety.hasGoodVariety
      ? 'Good variety of technical and soft skills'
      : 'Consider adding a mix of technical skills, soft skills, and industry-specific competencies',
    weight: 8
  });

  // Calculate weighted score
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  // Generate suggestions
  const suggestions: string[] = [];
  const failedChecks = checks.filter(check => !check.passed);

  if (failedChecks.some(check => check.category === 'critical')) {
    suggestions.push('Address critical issues first - these are essential for ATS parsing');
  }

  if (cv.personalInfo.summary.length === 0) {
    suggestions.push('Add a professional summary with relevant keywords from job descriptions');
  }

  if (cv.skills.length < 10) {
    suggestions.push('Add more relevant technical and soft skills that match job requirements');
  }

  if (cv.workExperience.some(exp => exp.bulletPoints.length < 3)) {
    suggestions.push('Add 3-5 bullet points per work experience, focusing on achievements and quantifiable results');
  }

  if (cv.templateId !== 'classic') {
    suggestions.push('Switch to the Classic template for maximum ATS compatibility');
  }

  // Add keyword optimization suggestion
  const keywordDensity = analyzeKeywordDensity(cv);
  if (keywordDensity < 0.02) {
    suggestions.push('Include more industry-specific keywords and phrases from job descriptions');
  }

  return {
    passed: score >= 75,
    score,
    checks,
    suggestions
  };
};

const analyzeKeywordDensity = (cv: CV): number => {
  const allText = [
    cv.personalInfo.summary,
    ...cv.workExperience.flatMap(exp => exp.bulletPoints.map(bp => bp.text)),
    ...cv.skills.map(skill => skill.name),
    cv.personalInfo.jobTitle
  ].join(' ').toLowerCase();

  const totalWords = allText.split(/\s+/).filter(word => word.length > 0).length;

  // Enhanced professional keywords covering multiple industries
  const professionalKeywords = [
    // General professional terms
    'project', 'team', 'lead', 'manage', 'develop', 'implement', 'design',
    'analyze', 'optimize', 'collaborate', 'strategic', 'solution', 'technical',
    'business', 'customer', 'performance', 'quality', 'process', 'innovation',
    'achievement', 'responsible', 'successful', 'experience', 'skilled',

    // Technology
    'software', 'programming', 'database', 'system', 'application', 'development',
    'coding', 'debugging', 'testing', 'deployment', 'architecture', 'framework',

    // Healthcare
    'patient', 'clinical', 'medical', 'healthcare', 'treatment', 'diagnosis',
    'therapy', 'nursing', 'compliance', 'safety', 'protocol', 'assessment',

    // Finance
    'financial', 'accounting', 'budgeting', 'forecasting', 'analysis', 'reporting',
    'compliance', 'audit', 'investment', 'revenue', 'cost', 'profit',

    // Education
    'teaching', 'curriculum', 'instruction', 'learning', 'assessment', 'education',
    'classroom', 'student', 'academic', 'development', 'training', 'mentoring',

    // Sales & Marketing
    'sales', 'marketing', 'customer', 'client', 'revenue', 'growth', 'campaign',
    'communication', 'presentation', 'negotiation', 'relationship', 'target',

    // Management
    'leadership', 'supervision', 'coordination', 'planning', 'organization',
    'delegation', 'decision', 'strategy', 'improvement', 'efficiency'
  ];

  const keywordMatches = professionalKeywords.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = allText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  return totalWords > 0 ? keywordMatches / totalWords : 0;
};

export const getATSFriendlyExportSettings = () => ({
  margin: [12, 12, 12, 12], // Slightly larger margins for professional appearance
  filename: 'Professional_CV.pdf',
  image: {
    type: 'png',
    quality: 1.0,
    crossOrigin: 'anonymous'
  },
  html2canvas: {
    scale: 3, // Optimal scale for crisp text without being too heavy
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    letterRendering: true,
    logging: false,
    imageTimeout: 0,
    removeContainer: true,
    foreignObjectRendering: false,
    width: 794, // A4 width in pixels at 96 DPI
    height: 1123, // A4 height in pixels at 96 DPI
    dpi: 300,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1200,
    windowHeight: 1600, // Increased height for better rendering
    onRendered: (canvas: HTMLCanvasElement) => {
      // Additional canvas optimization for text clarity
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'start';
      }
    }
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: false,
    precision: 16,
    userUnit: 1.0,
    lineWidth: 0.1,
    putOnlyUsedFonts: true,
    floatPrecision: 16,
    hotfixes: ['px_scaling'] // Fix for better pixel scaling
  }
});

export const formatATSFriendlyContent = (element: HTMLElement): void => {
  // Add the ATS export class to body to trigger CSS styles
  document.body.classList.add('ats-export');

  // Pre-load fonts for better rendering
  const fontLoadPromises = [
    document.fonts.load('400 12px Inter'),
    document.fonts.load('600 13px Inter'),
    document.fonts.load('700 14px Inter'),
    document.fonts.load('700 28px Inter')
  ];

  // Wait for fonts to load
  Promise.all(fontLoadPromises).then(() => {
    console.log('All fonts loaded for PDF export');
  }).catch(() => {
    console.log('Some fonts failed to load, using fallbacks');
  });

  // Remove any problematic decorative elements
  const elementsToRemove = element.querySelectorAll('.absolute, .rounded-full, .bg-blue-600, .shadow-lg');
  elementsToRemove.forEach(el => {
    if (el.classList.contains('absolute') || el.classList.contains('rounded-full')) {
      el.remove();
    }
  });

  // Remove unwanted borders from header and contact sections for cleaner PDF output
  const headerElements = element.querySelectorAll('.border-b-2, .border-2, .border-t, .border-l, .border-r');
  headerElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.tagName.toLowerCase().match(/^h[1-6]$/)) {
      // Don't remove borders from headers, only from containers
      htmlEl.style.border = 'none';
      htmlEl.style.borderTop = 'none';
      htmlEl.style.borderBottom = 'none';
      htmlEl.style.borderLeft = 'none';
      htmlEl.style.borderRight = 'none';
    }
  });

  // Ensure all text elements have proper styling
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.webkitFontSmoothing = 'antialiased';
    htmlEl.style.mozOsxFontSmoothing = 'grayscale';
    htmlEl.style.textRendering = 'optimizeLegibility';
    htmlEl.style.fontKerning = 'normal';

    // Remove any remaining decorative styling that could interfere with PDF
    if (htmlEl.classList.contains('shadow-lg') ||
        htmlEl.classList.contains('shadow') ||
        htmlEl.classList.contains('rounded-lg') ||
        htmlEl.classList.contains('bg-gradient-to-r')) {
      htmlEl.style.boxShadow = 'none';
      htmlEl.style.borderRadius = '0';
      htmlEl.style.background = 'transparent';
    }
  });

  // Clean up after PDF generation
  setTimeout(() => {
    document.body.classList.remove('ats-export');
  }, 5000);
};

const checkActionVerbs = (cv: CV): { count: number } => {
  const actionVerbs = [
    'achieved', 'managed', 'developed', 'implemented', 'designed', 'analyzed',
    'optimized', 'collaborated', 'strategic', 'solved', 'technical', 'business',
    'customer', 'performed', 'quality', 'process', 'innovated', 'achieved',
    'managed', 'developed', 'implemented', 'designed', 'analyzed', 'optimized',
    'collaborated', 'strategic', 'solved', 'technical', 'business', 'customer',
    'performed', 'quality', 'process', 'innovated'
  ];

  let count = 0;
  cv.workExperience.forEach(exp => {
    const bulletPoints = exp.bulletPoints.map(bp => bp.text.toLowerCase());
    count += bulletPoints.filter(bp => actionVerbs.includes(bp)).length;
  });

  return { count };
};

const checkQuantifiedAchievements = (cv: CV): number => {
  let count = 0;
  cv.workExperience.forEach(exp => {
    const bulletPoints = exp.bulletPoints.map(bp => bp.text.toLowerCase());
    count += bulletPoints.filter(bp => bp.match(/\d+|\d+\.\d+|\d+%|\d+K|\d+M/)).length;
  });

  return count;
};

const checkRequiredSections = (cv: CV): { score: number, missing: string[] } => {
  const requiredSections = [
    'personal-info',
    'professional-summary',
    'work-experience',
    'skills',
    'education'
  ];

  let score = 0;
  const missing = [];

  requiredSections.forEach(section => {
    if (!cv[section]) {
      missing.push(section);
    } else {
      score += 1;
    }
  });

  return { score, missing };
};

const checkDateConsistency = (cv: CV): boolean => {
  const dateFormats = [
    'MM/YYYY', 'MM/YY', 'YYYY/MM', 'YYYY/YY', 'MM/DD', 'DD/MM', 'DD/MM/YYYY', 'MM/DD/YYYY'
  ];

  return cv.workExperience.every(exp => {
    const startDate = exp.startDate;
    const endDate = exp.endDate || exp.isCurrentJob ? exp.endDate : null;

    if (!startDate) return false;

    if (endDate) {
      if (!dateFormats.some(format => startDate.match(new RegExp(`\\b${format}\\b`)))) return false;
      if (!dateFormats.some(format => endDate.match(new RegExp(`\\b${format}\\b`)))) return false;
    } else {
      if (!dateFormats.some(format => startDate.match(new RegExp(`\\b${format}\\b`)))) return false;
    }

    return true;
  });
};

const calculateContentLength = (cv: CV): number => {
  const allText = [
    cv.personalInfo.summary,
    ...cv.workExperience.flatMap(exp => exp.bulletPoints.map(bp => bp.text)),
    ...cv.skills.map(skill => skill.name),
    cv.personalInfo.jobTitle
  ].join(' ').toLowerCase();

  return allText.split(/\s+/).filter(word => word.length > 0).length;
};

const checkSkillsVariety = (cv: CV): { hasGoodVariety: boolean } => {
  const allSkills = new Set<string>();

  cv.skills.forEach(skill => {
    allSkills.add(skill.name.toLowerCase());
  });

  const requiredSkills = [
    'programming', 'database', 'system', 'application', 'development',
    'coding', 'debugging', 'testing', 'deployment', 'architecture', 'framework',
    'project', 'team', 'lead', 'manage', 'develop', 'implement', 'design',
    'analyze', 'optimize', 'collaborate', 'strategic', 'solution', 'technical',
    'business', 'customer', 'performance', 'quality', 'process', 'innovation',
    'achievement', 'responsible', 'successful', 'experience', 'skilled',
    'healthcare', 'treatment', 'diagnosis', 'therapy', 'nursing', 'compliance',
    'safety', 'protocol', 'assessment', 'finance', 'accounting', 'budgeting',
    'forecasting', 'analysis', 'reporting', 'compliance', 'audit', 'investment',
    'revenue', 'cost', 'profit', 'education', 'teaching', 'curriculum',
    'instruction', 'learning', 'assessment', 'education', 'classroom', 'student',
    'academic', 'development', 'training', 'mentoring', 'sales', 'marketing',
    'customer', 'client', 'revenue', 'growth', 'campaign', 'communication',
    'presentation', 'negotiation', 'relationship', 'target', 'management',
    'leadership', 'supervision', 'coordination', 'planning', 'organization',
    'delegation', 'decision', 'strategy', 'improvement', 'efficiency'
  ];

  const hasGoodVariety = allSkills.size > requiredSkills.length;

  return { hasGoodVariety };
};
