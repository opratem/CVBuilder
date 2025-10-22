import type { CV } from '../types/cv';
import { verifyATSCompatibility, type ATSCheckResult, type ATSCheck } from './atsVerification';

// Enhanced ATS analysis with job description matching
export interface EnhancedATSResult extends ATSCheckResult {
  keywordAnalysis: KeywordAnalysis;
  sectionAnalysis: SectionAnalysis;
  improvementPriority: ImprovementItem[];
  optimizationTips: OptimizationTip[];
}

export interface KeywordAnalysis {
  totalKeywords: number;
  uniqueKeywords: number;
  keywordDensity: number;
  industryKeywords: string[];
  missingKeywords: string[];
  overusedKeywords: string[];
}

export interface SectionAnalysis {
  missingStandardSections: string[];
  optionalSections: string[];
  sectionOptimization: Record<string, string[]>;
}

export interface ImprovementItem {
  category: 'critical' | 'important' | 'recommended';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'difficult';
  actionSteps: string[];
}

export interface OptimizationTip {
  section: string;
  tip: string;
  example?: string;
  priority: number;
}

// Enhanced ATS verification with job description analysis
export const performEnhancedATSCheck = (
  cv: CV,
  jobDescription?: string
): EnhancedATSResult => {
  // Get base ATS check
  const baseResult = verifyATSCompatibility(cv);

  // Perform enhanced analysis
  const keywordAnalysis = analyzeKeywords(cv, jobDescription);
  const sectionAnalysis = analyzeSections(cv);
  const improvementPriority = generateImprovementPriority(baseResult, cv);
  const optimizationTips = generateOptimizationTips(cv, keywordAnalysis);

  return {
    ...baseResult,
    keywordAnalysis,
    sectionAnalysis,
    improvementPriority,
    optimizationTips
  };
};

// Enhanced keyword analysis
const analyzeKeywords = (cv: CV, jobDescription?: string): KeywordAnalysis => {
  const cvText = extractAllText(cv).toLowerCase();
  const words = cvText.split(/\s+/).filter(word => word.length > 2);

  // Industry-specific keywords (expanded from original)
  const industryKeywords = [
    // Technology
    'javascript', 'python', 'react', 'node.js', 'typescript', 'aws', 'docker', 'kubernetes',
    'microservices', 'api', 'database', 'sql', 'agile', 'scrum', 'git', 'ci/cd', 'devops',

    // General professional
    'leadership', 'management', 'project', 'team', 'collaboration', 'communication',
    'analysis', 'strategy', 'optimization', 'innovation', 'problem-solving',

    // Business
    'revenue', 'growth', 'metrics', 'kpi', 'roi', 'budget', 'stakeholder', 'customer',
    'market', 'competitive', 'process', 'efficiency', 'quality', 'compliance'
  ];

  const totalKeywords = words.length;
  const uniqueKeywords = new Set(words).size;
  const keywordDensity = totalKeywords > 0 ? uniqueKeywords / totalKeywords : 0;

  const foundIndustryKeywords = industryKeywords.filter(keyword =>
    cvText.includes(keyword)
  );

  let missingKeywords: string[] = [];
  let jobKeywords: string[] = [];

  // Analyze job description if provided
  if (jobDescription) {
    const jobDescLower = jobDescription.toLowerCase();
    jobKeywords = industryKeywords.filter(keyword =>
      jobDescLower.includes(keyword)
    );
    missingKeywords = jobKeywords.filter(keyword =>
      !cvText.includes(keyword)
    );
  }

  // Find overused keywords (appearing more than 5 times)
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const overusedKeywords = Object.entries(wordCount)
    .filter(([word, count]) => count > 5 && word.length > 4)
    .map(([word]) => word)
    .slice(0, 5);

  return {
    totalKeywords,
    uniqueKeywords,
    keywordDensity,
    industryKeywords: foundIndustryKeywords,
    missingKeywords: missingKeywords.slice(0, 10),
    overusedKeywords
  };
};

// Analyze CV sections
const analyzeSections = (cv: CV): SectionAnalysis => {
  const standardSections = [
    'Professional Summary',
    'Work Experience',
    'Education',
    'Skills'
  ];

  const optionalSections = [
    'Projects',
    'Certifications',
    'Languages',
    'Volunteer Experience',
    'Publications',
    'Awards'
  ];

  const missingStandardSections: string[] = [];

  if (!cv.personalInfo.summary || cv.personalInfo.summary.trim().length === 0) {
    missingStandardSections.push('Professional Summary');
  }
  if (cv.workExperience.length === 0) {
    missingStandardSections.push('Work Experience');
  }
  if (cv.education.length === 0) {
    missingStandardSections.push('Education');
  }
  if (cv.skills.length === 0) {
    missingStandardSections.push('Skills');
  }

  const sectionOptimization: Record<string, string[]> = {};

  // Work experience optimization
  if (cv.workExperience.length > 0) {
    const tips: string[] = [];
    const expWithFewBullets = cv.workExperience.filter(exp => exp.bulletPoints.length < 3);
    if (expWithFewBullets.length > 0) {
      tips.push('Add 3-5 bullet points per role to showcase achievements');
    }

    const expWithoutNumbers = cv.workExperience.filter(exp =>
      !exp.bulletPoints.some(bp => /\d/.test(bp.text))
    );
    if (expWithoutNumbers.length > 0) {
      tips.push('Include quantified achievements (numbers, percentages, dollar amounts)');
    }

    if (tips.length > 0) {
      sectionOptimization['Work Experience'] = tips;
    }
  }

  // Skills optimization
  if (cv.skills.length > 0 && cv.skills.length < 8) {
    sectionOptimization['Skills'] = ['Add more relevant skills to reach 8-15 total skills'];
  }

  // Summary optimization
  if (cv.personalInfo.summary) {
    const wordCount = cv.personalInfo.summary.split(' ').length;
    if (wordCount < 30) {
      sectionOptimization['Professional Summary'] = [
        'Expand summary to 30-50 words for better keyword coverage'
      ];
    }
  }

  return {
    missingStandardSections,
    optionalSections,
    sectionOptimization
  };
};

// Generate prioritized improvement recommendations
const generateImprovementPriority = (
  atsResult: ATSCheckResult,
  cv: CV
): ImprovementItem[] => {
  const improvements: ImprovementItem[] = [];

  // Critical improvements
  const criticalFailures = atsResult.checks.filter(
    check => check.category === 'critical' && !check.passed
  );

  criticalFailures.forEach(check => {
    improvements.push({
      category: 'critical',
      title: check.name,
      description: check.message,
      impact: 'high',
      effort: 'easy',
      actionSteps: getActionStepsForCheck(check.id)
    });
  });

  // Important improvements
  if (cv.workExperience.length > 0) {
    const expWithoutQuantification = cv.workExperience.filter(exp =>
      !exp.bulletPoints.some(bp => /\d+/.test(bp.text))
    );

    if (expWithoutQuantification.length > 0) {
      improvements.push({
        category: 'important',
        title: 'Add Quantified Achievements',
        description: 'Include numbers, percentages, or metrics in your experience descriptions',
        impact: 'high',
        effort: 'moderate',
        actionSteps: [
          'Review each work experience entry',
          'Add specific numbers (e.g., "increased sales by 25%")',
          'Include budget amounts, team sizes, or project durations',
          'Use metrics that demonstrate impact and scale'
        ]
      });
    }
  }

  // Skills improvement
  if (cv.skills.length < 8) {
    improvements.push({
      category: 'important',
      title: 'Expand Skills Section',
      description: 'Add more relevant technical and soft skills',
      impact: 'medium',
      effort: 'easy',
      actionSteps: [
        'Review job descriptions for target roles',
        'Add technical skills relevant to your field',
        'Include soft skills like leadership and communication',
        'Aim for 8-15 total skills'
      ]
    });
  }

  // Template optimization
  if (cv.templateId !== 'classic') {
    improvements.push({
      category: 'recommended',
      title: 'Use ATS-Optimized Template',
      description: 'Switch to Classic template for maximum ATS compatibility',
      impact: 'medium',
      effort: 'easy',
      actionSteps: [
        'Go to template selection',
        'Choose the Classic (ATS-Optimized) template',
        'Review formatting to ensure readability'
      ]
    });
  }

  return improvements.sort((a, b) => {
    const categoryOrder = { critical: 3, important: 2, recommended: 1 };
    return categoryOrder[b.category] - categoryOrder[a.category];
  });
};

// Generate section-specific optimization tips
const generateOptimizationTips = (
  cv: CV,
  keywordAnalysis: KeywordAnalysis
): OptimizationTip[] => {
  const tips: OptimizationTip[] = [];

  // Summary tips
  if (cv.personalInfo.summary) {
    tips.push({
      section: 'Professional Summary',
      tip: 'Include 2-3 key achievements that demonstrate your value proposition',
      example: 'Instead of "Experienced developer" try "Full-stack developer with 5+ years building scalable web applications, leading teams of 3-5 developers"',
      priority: 9
    });
  }

  // Experience tips
  if (cv.workExperience.length > 0) {
    tips.push({
      section: 'Work Experience',
      tip: 'Start bullet points with strong action verbs and include quantifiable results',
      example: 'Instead of "Worked on projects" try "Led 3 cross-functional projects resulting in 25% efficiency improvement"',
      priority: 10
    });

    tips.push({
      section: 'Work Experience',
      tip: 'Use the STAR method (Situation, Task, Action, Result) for impactful descriptions',
      example: 'Identified bottleneck in payment processing (S), tasked with optimization (T), implemented caching solution (A), reduced processing time by 40% (R)',
      priority: 8
    });
  }

  // Skills tips
  if (keywordAnalysis.missingKeywords.length > 0) {
    tips.push({
      section: 'Skills',
      tip: `Consider adding these in-demand skills: ${keywordAnalysis.missingKeywords.slice(0, 5).join(', ')}`,
      priority: 7
    });
  }

  // Keyword optimization
  if (keywordAnalysis.keywordDensity < 0.02) {
    tips.push({
      section: 'Overall',
      tip: 'Increase industry-specific keyword usage throughout your CV',
      example: 'Include terms like "agile methodology", "cross-functional teams", "stakeholder management"',
      priority: 6
    });
  }

  return tips.sort((a, b) => b.priority - a.priority);
};

// Helper function to get action steps for specific checks
const getActionStepsForCheck = (checkId: string): string[] => {
  const actionSteps: Record<string, string[]> = {
    'full-name': [
      'Enter your full name in the Personal Information section',
      'Use your professional name as it appears on official documents'
    ],
    'email': [
      'Add a professional email address',
      'Use format: firstname.lastname@domain.com',
      'Avoid unprofessional email addresses'
    ],
    'phone': [
      'Add your phone number in standard format',
      'Include country code if applying internationally',
      'Ensure the number is current and reachable'
    ],
    'work-experience': [
      'Add at least one work experience entry',
      'Include job title, company, dates, and responsibilities',
      'Focus on relevant experience for your target role'
    ]
  };

  return actionSteps[checkId] || ['Review and update this section'];
};

// Helper function to extract all text from CV
const extractAllText = (cv: CV): string => {
  const textParts = [
    cv.personalInfo.fullName,
    cv.personalInfo.jobTitle,
    cv.personalInfo.summary,
    ...cv.workExperience.flatMap(exp => [
      exp.position,
      exp.company,
      ...exp.bulletPoints.map(bp => bp.text)
    ]),
    ...cv.education.map(edu => `${edu.degree} ${edu.institution} ${edu.fieldOfStudy || ''}`),
    ...cv.skills.map(skill => skill.name),
    ...cv.projects.map(proj => `${proj.name} ${proj.description}`),
    ...cv.certifications.map(cert => `${cert.name} ${cert.issuer}`)
  ];

  return textParts.filter(Boolean).join(' ');
};

// Real-time ATS score calculator
export const calculateRealTimeATSScore = (cv: CV): number => {
  const result = performEnhancedATSCheck(cv);
  return result.score;
};

// Get quick ATS recommendations
export const getQuickATSRecommendations = (cv: CV): string[] => {
  const result = performEnhancedATSCheck(cv);
  return result.improvementPriority
    .filter(item => item.category === 'critical' || item.category === 'important')
    .slice(0, 3)
    .map(item => item.title);
};
