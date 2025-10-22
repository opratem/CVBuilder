import type { CVData } from '../types/cv';

export interface JobAnalysisResult {
  jobTitle: string;
  company: string;
  requiredSkills: ExtractedSkill[];
  optionalSkills: ExtractedSkill[];
  keywords: string[];
  experienceRequirements: ExperienceRequirement[];
  industries: string[];
  suggestions: OptimizationSuggestion[];
  matchScore: number;
  competencyGaps: CompetencyGap[];
}

export interface ExtractedSkill {
  name: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  category: 'technical' | 'soft' | 'domain';
  mentions: number;
}

export interface ExperienceRequirement {
  type: 'years' | 'level' | 'specific';
  value: string;
  importance: 'required' | 'preferred';
}

export interface OptimizationSuggestion {
  type: 'skills' | 'experience' | 'keywords' | 'summary' | 'reorder';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  specifics?: {
    skillsToAdd?: string[];
    keywordsToInclude?: string[];
    experiencesToHighlight?: string[];
    sectionsToReorder?: string[];
  };
}

export interface CompetencyGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  category: string;
  recommendations: string[];
}

// Enhanced technical skills database with categories
const TECHNICAL_SKILLS = {
  programming: [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'nosql', 'html', 'css', 'sass', 'less'
  ],
  frameworks: [
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'express', 'fastapi', 'django',
    'flask', 'spring', 'laravel', 'rails', 'asp.net', 'node.js', 'electron', 'react native'
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible',
    'jenkins', 'gitlab ci', 'github actions', 'circleci', 'serverless', 'microservices'
  ],
  databases: [
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
    'oracle', 'sql server', 'sqlite', 'neo4j', 'firebase'
  ],
  tools: [
    'git', 'jira', 'confluence', 'slack', 'teams', 'figma', 'sketch', 'adobe', 'photoshop',
    'illustrator', 'indesign', 'autocad', 'solidworks', 'tableau', 'power bi', 'excel'
  ]
};

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving', 'analytical thinking',
  'critical thinking', 'creative thinking', 'project management', 'time management', 'organization',
  'attention to detail', 'adaptability', 'flexibility', 'self motivated', 'initiative',
  'customer service', 'presentation skills', 'negotiation', 'conflict resolution', 'mentoring',
  'training', 'documentation', 'research', 'innovation', 'strategic thinking'
];

const DOMAIN_SKILLS = [
  'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'unit testing', 'integration testing',
  'performance testing', 'security testing', 'penetration testing', 'vulnerability assessment',
  'risk management', 'compliance', 'gdpr', 'hipaa', 'sox', 'pci dss', 'iso 27001',
  'machine learning', 'artificial intelligence', 'deep learning', 'data science', 'data analysis',
  'business intelligence', 'etl', 'data warehousing', 'big data', 'blockchain', 'cryptocurrency'
];

export class JobAnalysisService {
  static analyzeJobDescription(
    jobDescription: string,
    jobTitle: string,
    company: string,
    currentCV: CVData
  ): JobAnalysisResult {
    const text = jobDescription.toLowerCase();

    // Extract skills with importance and mentions
    const requiredSkills = this.extractSkills(text, 'required');
    const optionalSkills = this.extractSkills(text, 'optional');

    // Extract keywords (broader than just skills)
    const keywords = this.extractKeywords(text);

    // Extract experience requirements
    const experienceRequirements = this.extractExperienceRequirements(text);

    // Identify industries
    const industries = this.identifyIndustries(text, jobTitle);

    // Calculate match score
    const matchScore = this.calculateMatchScore(requiredSkills, optionalSkills, currentCV);

    // Generate optimization suggestions
    const suggestions = this.generateOptimizationSuggestions(
      requiredSkills,
      optionalSkills,
      keywords,
      experienceRequirements,
      currentCV
    );

    // Identify competency gaps
    const competencyGaps = this.identifyCompetencyGaps(requiredSkills, currentCV);

    return {
      jobTitle,
      company,
      requiredSkills,
      optionalSkills,
      keywords,
      experienceRequirements,
      industries,
      suggestions,
      matchScore,
      competencyGaps
    };
  }

  private static extractSkills(text: string, type: 'required' | 'optional'): ExtractedSkill[] {
    const skills: ExtractedSkill[] = [];
    const allSkills = [
      ...Object.values(TECHNICAL_SKILLS).flat(),
      ...SOFT_SKILLS,
      ...DOMAIN_SKILLS
    ];

    // Define importance based on context
    const requiredIndicators = [
      'required', 'must have', 'essential', 'mandatory', 'critical', 'key requirement',
      'minimum', 'necessary', 'vital', 'fundamental'
    ];

    const importantIndicators = [
      'preferred', 'desired', 'important', 'valuable', 'strong', 'solid experience',
      'proficient', 'skilled', 'experienced'
    ];

    allSkills.forEach(skill => {
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(skillRegex);

      if (matches) {
        // Determine importance based on surrounding context
        let importance: 'critical' | 'important' | 'nice-to-have' = 'nice-to-have';

        const skillContext = this.getSkillContext(text, skill);

        if (requiredIndicators.some(indicator => skillContext.includes(indicator))) {
          importance = 'critical';
        } else if (importantIndicators.some(indicator => skillContext.includes(indicator))) {
          importance = 'important';
        }

        // Determine category
        let category: 'technical' | 'soft' | 'domain' = 'technical';
        if (SOFT_SKILLS.includes(skill)) {
          category = 'soft';
        } else if (DOMAIN_SKILLS.includes(skill)) {
          category = 'domain';
        }

        skills.push({
          name: skill,
          importance,
          category,
          mentions: matches.length
        });
      }
    });

    return skills
      .filter(skill => type === 'required' ?
        skill.importance === 'critical' :
        skill.importance !== 'critical'
      )
      .sort((a, b) => b.mentions - a.mentions);
  }

  private static getSkillContext(text: string, skill: string): string {
    const skillIndex = text.toLowerCase().indexOf(skill.toLowerCase());
    if (skillIndex === -1) return '';

    // Get 50 characters before and after the skill mention
    const start = Math.max(0, skillIndex - 50);
    const end = Math.min(text.length, skillIndex + skill.length + 50);

    return text.substring(start, end);
  }

  private static extractKeywords(text: string): string[] {
    // Extract meaningful keywords beyond just skills
    const keywords = new Set<string>();

    // Industry-specific terms
    const industryTerms = [
      'fintech', 'healthtech', 'edtech', 'saas', 'e-commerce', 'marketplace', 'b2b', 'b2c',
      'enterprise', 'startup', 'scale-up', 'digital transformation', 'innovation',
      'automation', 'optimization', 'performance', 'scalability', 'reliability'
    ];

    // Role-specific terms
    const roleTerms = [
      'senior', 'junior', 'lead', 'principal', 'architect', 'engineer', 'developer',
      'analyst', 'manager', 'director', 'specialist', 'consultant', 'coordinator'
    ];

    // Methodology terms
    const methodologyTerms = [
      'agile', 'waterfall', 'lean', 'kanban', 'scrum', 'devops', 'continuous integration',
      'continuous deployment', 'test driven development', 'behavior driven development'
    ];

    [...industryTerms, ...roleTerms, ...methodologyTerms].forEach(term => {
      if (text.includes(term)) {
        keywords.add(term);
      }
    });

    return Array.from(keywords);
  }

  private static extractExperienceRequirements(text: string): ExperienceRequirement[] {
    const requirements: ExperienceRequirement[] = [];

    // Years of experience
    const yearMatches = text.match(/(\d+)[^\w]*(?:years?|yrs?)\s+(?:of\s+)?experience/gi);
    yearMatches?.forEach(match => {
      const years = match.match(/\d+/)?.[0];
      if (years) {
        requirements.push({
          type: 'years',
          value: `${years}+ years`,
          importance: text.includes('minimum') || text.includes('required') ? 'required' : 'preferred'
        });
      }
    });

    // Experience levels
    const levelMatches = text.match(/(entry[-\s]level|junior|mid[-\s]level|senior|lead|principal|expert)/gi);
    levelMatches?.forEach(match => {
      requirements.push({
        type: 'level',
        value: match.toLowerCase(),
        importance: 'preferred'
      });
    });

    return requirements;
  }

  private static identifyIndustries(text: string, jobTitle: string): string[] {
    const industries = new Set<string>();

    const industryKeywords = {
      'technology': ['tech', 'software', 'it', 'digital', 'startup'],
      'finance': ['fintech', 'banking', 'financial', 'investment', 'trading'],
      'healthcare': ['healthcare', 'medical', 'pharma', 'biotech', 'health'],
      'education': ['education', 'edtech', 'learning', 'university', 'academic'],
      'retail': ['retail', 'e-commerce', 'marketplace', 'shopping', 'consumer'],
      'consulting': ['consulting', 'advisory', 'professional services'],
      'manufacturing': ['manufacturing', 'industrial', 'automotive', 'aerospace']
    };

    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword) || jobTitle.toLowerCase().includes(keyword))) {
        industries.add(industry);
      }
    });

    return Array.from(industries);
  }

  private static calculateMatchScore(
    requiredSkills: ExtractedSkill[],
    optionalSkills: ExtractedSkill[],
    cv: CVData
  ): number {
    const userSkills = cv.skills.map(s => s.name.toLowerCase());

    // Weight critical skills more heavily
    const criticalMatches = requiredSkills.filter(skill =>
      userSkills.includes(skill.name.toLowerCase())
    ).length;

    const importantMatches = optionalSkills.filter(skill =>
      skill.importance === 'important' && userSkills.includes(skill.name.toLowerCase())
    ).length;

    const niceToHaveMatches = optionalSkills.filter(skill =>
      skill.importance === 'nice-to-have' && userSkills.includes(skill.name.toLowerCase())
    ).length;

    const totalRequired = requiredSkills.length;
    const totalImportant = optionalSkills.filter(s => s.importance === 'important').length;
    const totalNiceToHave = optionalSkills.filter(s => s.importance === 'nice-to-have').length;

    if (totalRequired + totalImportant + totalNiceToHave === 0) return 0;

    // Weighted scoring: 60% critical, 30% important, 10% nice-to-have
    const criticalScore = totalRequired > 0 ? (criticalMatches / totalRequired) * 0.6 : 0;
    const importantScore = totalImportant > 0 ? (importantMatches / totalImportant) * 0.3 : 0;
    const niceToHaveScore = totalNiceToHave > 0 ? (niceToHaveMatches / totalNiceToHave) * 0.1 : 0;

    return Math.round((criticalScore + importantScore + niceToHaveScore) * 100);
  }

  private static generateOptimizationSuggestions(
    requiredSkills: ExtractedSkill[],
    optionalSkills: ExtractedSkill[],
    keywords: string[],
    experienceRequirements: ExperienceRequirement[],
    cv: CVData
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const userSkills = cv.skills.map(s => s.name.toLowerCase());

    // Missing critical skills
    const missingCritical = requiredSkills.filter(skill =>
      !userSkills.includes(skill.name.toLowerCase())
    );

    if (missingCritical.length > 0) {
      suggestions.push({
        type: 'skills',
        title: 'Add Critical Missing Skills',
        description: `Add these essential skills that are explicitly required: ${missingCritical.map(s => s.name).join(', ')}`,
        action: 'Add these skills to your skills section if you have any experience with them',
        priority: 'high',
        impact: 95,
        specifics: {
          skillsToAdd: missingCritical.map(s => s.name)
        }
      });
    }

    // Important missing skills
    const missingImportant = optionalSkills.filter(skill =>
      skill.importance === 'important' && !userSkills.includes(skill.name.toLowerCase())
    );

    if (missingImportant.length > 0) {
      suggestions.push({
        type: 'skills',
        title: 'Consider Adding Important Skills',
        description: `These skills could significantly strengthen your application: ${missingImportant.slice(0, 5).map(s => s.name).join(', ')}`,
        action: 'Add any of these skills that you possess to improve your match score',
        priority: 'medium',
        impact: 75,
        specifics: {
          skillsToAdd: missingImportant.slice(0, 5).map(s => s.name)
        }
      });
    }

    // Keyword optimization for summary
    const summaryKeywords = keywords.filter(keyword =>
      !cv.personalInfo.summary?.toLowerCase().includes(keyword)
    );

    if (summaryKeywords.length > 0) {
      suggestions.push({
        type: 'summary',
        title: 'Optimize Professional Summary with Keywords',
        description: `Include these relevant terms in your summary: ${summaryKeywords.slice(0, 3).join(', ')}`,
        action: 'Naturally incorporate these keywords into your professional summary',
        priority: 'high',
        impact: 85,
        specifics: {
          keywordsToInclude: summaryKeywords.slice(0, 3)
        }
      });
    }

    // Skills reordering based on relevance
    const relevantUserSkills = cv.skills.filter(userSkill =>
      [...requiredSkills, ...optionalSkills].some(jobSkill =>
        jobSkill.name.toLowerCase() === userSkill.name.toLowerCase()
      )
    );

    if (relevantUserSkills.length > 0 && cv.skills.length > relevantUserSkills.length) {
      suggestions.push({
        type: 'reorder',
        title: 'Reorder Skills by Relevance',
        description: 'Move job-relevant skills to the top of your skills section',
        action: 'Reorganize your skills to highlight the most relevant ones first',
        priority: 'medium',
        impact: 70,
        specifics: {
          sectionsToReorder: ['skills']
        }
      });
    }

    // Experience highlighting
    const experienceKeywords = [...requiredSkills, ...optionalSkills, ...keywords];
    const experiencesToHighlight: string[] = [];

    cv.workExperience.forEach(exp => {
      const expText = `${exp.position} ${exp.company} ${exp.bulletPoints.map(bp => bp.text).join(' ')}`.toLowerCase();
      const matchingKeywords = experienceKeywords.filter(item =>
        expText.includes(typeof item === 'string' ? item : item.name)
      );

      if (matchingKeywords.length > 0) {
        experiencesToHighlight.push(exp.position);
      }
    });

    if (experiencesToHighlight.length > 0) {
      suggestions.push({
        type: 'experience',
        title: 'Enhance Relevant Work Experience',
        description: `Highlight and expand on experience that matches job requirements: ${experiencesToHighlight.slice(0, 2).join(', ')}`,
        action: 'Add more specific details and quantifiable achievements to relevant experience',
        priority: 'medium',
        impact: 80,
        specifics: {
          experiencesToHighlight: experiencesToHighlight.slice(0, 2)
        }
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static identifyCompetencyGaps(
    requiredSkills: ExtractedSkill[],
    cv: CVData
  ): CompetencyGap[] {
    const gaps: CompetencyGap[] = [];
    const userSkills = cv.skills.map(s => ({ name: s.name.toLowerCase(), level: s.level || 3 }));

    requiredSkills.forEach(reqSkill => {
      const userSkill = userSkills.find(us => us.name === reqSkill.name.toLowerCase());
      const requiredLevel = reqSkill.importance === 'critical' ? 5 : 4;

      if (!userSkill || userSkill.level < requiredLevel) {
        gaps.push({
          skill: reqSkill.name,
          currentLevel: userSkill?.level || 0,
          requiredLevel,
          category: reqSkill.category,
          recommendations: this.getSkillRecommendations(reqSkill.name, reqSkill.category)
        });
      }
    });

    return gaps;
  }

  private static getSkillRecommendations(skill: string, category: string): string[] {
    const recommendations: string[] = [];

    switch (category) {
      case 'technical':
        recommendations.push(
          `Take online courses or tutorials for ${skill}`,
          `Build a personal project using ${skill}`,
          `Contribute to open source projects that use ${skill}`,
          `Get certified in ${skill} if certifications are available`
        );
        break;
      case 'soft':
        recommendations.push(
          `Look for opportunities to practice ${skill} in current role`,
          `Take leadership or communication workshops`,
          `Volunteer for projects that require ${skill}`,
          `Seek mentorship or coaching for ${skill} development`
        );
        break;
      case 'domain':
        recommendations.push(
          `Study industry best practices for ${skill}`,
          `Join professional communities focused on ${skill}`,
          `Attend conferences or webinars about ${skill}`,
          `Find case studies that demonstrate ${skill} application`
        );
        break;
    }

    return recommendations;
  }
}
