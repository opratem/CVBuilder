import type { CVData } from '../types/cv';
import { skillsDatabase, type SkillSuggestion } from './skillsDatabase';
import { JobAnalysisService, type JobAnalysisResult } from './jobAnalysisService';

export interface EnhancedSkillSuggestion extends SkillSuggestion {
  matchScore: number;
  marketDemand: 'high' | 'medium' | 'low';
  learningDifficulty: 'easy' | 'medium' | 'hard';
  certificationAvailable: boolean;
  relatedSkills: string[];
  jobRelevance: number;
}

export interface SkillsAnalysis {
  recommendations: EnhancedSkillSuggestion[];
  missingCritical: string[];
  hasStrongFoundation: boolean;
  improvementAreas: string[];
  trendingInIndustry: string[];
  competitiveAdvantage: string[];
}

export interface JobSkillsMatch {
  overallScore: number;
  strengthAreas: string[];
  gaps: string[];
  recommendations: EnhancedSkillSuggestion[];
  priorityActions: Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
}

export class EnhancedSkillsService {
  private static skillMarketData = {
    'JavaScript': { demand: 'high' as const, difficulty: 'medium' as const, certification: true },
    'Python': { demand: 'high' as const, difficulty: 'easy' as const, certification: true },
    'TypeScript': { demand: 'high' as const, difficulty: 'medium' as const, certification: false },
    'React': { demand: 'high' as const, difficulty: 'medium' as const, certification: false },
    'Node.js': { demand: 'high' as const, difficulty: 'medium' as const, certification: false },
    'AWS': { demand: 'high' as const, difficulty: 'hard' as const, certification: true },
    'Docker': { demand: 'high' as const, difficulty: 'medium' as const, certification: true },
    'Kubernetes': { demand: 'high' as const, difficulty: 'hard' as const, certification: true },
    'Machine Learning': { demand: 'high' as const, difficulty: 'hard' as const, certification: true },
    'Data Analysis': { demand: 'high' as const, difficulty: 'medium' as const, certification: true },
    'Project Management': { demand: 'high' as const, difficulty: 'easy' as const, certification: true },
    'Agile Development': { demand: 'high' as const, difficulty: 'easy' as const, certification: true },
    'Communication': { demand: 'high' as const, difficulty: 'easy' as const, certification: false },
    'Leadership': { demand: 'high' as const, difficulty: 'medium' as const, certification: true },
  };

  private static skillRelationships = {
    'JavaScript': ['TypeScript', 'React', 'Node.js', 'Vue.js', 'Angular'],
    'Python': ['Django', 'Flask', 'Machine Learning', 'Data Analysis', 'FastAPI'],
    'React': ['JavaScript', 'TypeScript', 'Next.js', 'Redux', 'GraphQL'],
    'AWS': ['Docker', 'Kubernetes', 'Terraform', 'Linux', 'DevOps'],
    'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'Statistics'],
    'Project Management': ['Agile Development', 'Scrum', 'Leadership', 'Communication', 'Risk Management'],
  };

  static analyzeCurrentSkills(cvData: CVData): SkillsAnalysis {
    const currentSkills = cvData.skills.map(s => s.name);
    const jobTitle = cvData.personalInfo.jobTitle || '';

    // Get industry-appropriate recommendations
    const industryRecommendations = this.getIndustrySkillRecommendations(jobTitle, currentSkills);

    // Analyze current skills foundation
    const hasStrongFoundation = this.assessSkillsFoundation(currentSkills, jobTitle);

    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(currentSkills, jobTitle);

    // Get trending skills for the industry
    const trendingInIndustry = this.getTrendingSkillsForRole(jobTitle);

    // Identify competitive advantages
    const competitiveAdvantage = this.identifyCompetitiveAdvantage(currentSkills, jobTitle);

    // Find missing critical skills
    const missingCritical = this.findMissingCriticalSkills(currentSkills, jobTitle);

    return {
      recommendations: industryRecommendations,
      missingCritical,
      hasStrongFoundation,
      improvementAreas,
      trendingInIndustry,
      competitiveAdvantage
    };
  }

  static analyzeSkillsForJob(cvData: CVData, jobDescription: string, jobTitle: string, company: string): JobSkillsMatch {
    const jobAnalysis = JobAnalysisService.analyzeJobDescription(jobDescription, jobTitle, company, cvData);

    // Calculate overall match score
    const overallScore = jobAnalysis.matchScore;

    // Identify strength areas
    const strengthAreas = this.identifyStrengthAreas(cvData, jobAnalysis);

    // Identify gaps
    const gaps = this.identifySkillGaps(cvData, jobAnalysis);

    // Generate enhanced recommendations
    const recommendations = this.generateJobSpecificRecommendations(cvData, jobAnalysis);

    // Create priority actions
    const priorityActions = this.generatePriorityActions(cvData, jobAnalysis);

    return {
      overallScore,
      strengthAreas,
      gaps,
      recommendations,
      priorityActions
    };
  }

  private static getIndustrySkillRecommendations(jobTitle: string, currentSkills: string[]): EnhancedSkillSuggestion[] {
    const normalizedJobTitle = jobTitle.toLowerCase();
    let targetIndustry = 'general';

    if (normalizedJobTitle.includes('developer') || normalizedJobTitle.includes('engineer') ||
        normalizedJobTitle.includes('programmer') || normalizedJobTitle.includes('software')) {
      targetIndustry = 'technology';
    }

    const allSuggestions: EnhancedSkillSuggestion[] = [];
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    // Get skills from target industry
    if (skillsDatabase[targetIndustry]) {
      Object.values(skillsDatabase[targetIndustry]).forEach(categorySkills => {
        categorySkills.forEach(skill => {
          if (!currentSkillsLower.includes(skill.name.toLowerCase())) {
            allSuggestions.push(this.enhanceSkillSuggestion(skill, currentSkills, jobTitle));
          }
        });
      });
    }

    // Add general skills
    Object.values(skillsDatabase.general).forEach(categorySkills => {
      categorySkills.forEach(skill => {
        if (!currentSkillsLower.includes(skill.name.toLowerCase())) {
          allSuggestions.push(this.enhanceSkillSuggestion(skill, currentSkills, jobTitle));
        }
      });
    });

    return allSuggestions
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
  }

  private static enhanceSkillSuggestion(skill: SkillSuggestion, currentSkills: string[], jobTitle: string): EnhancedSkillSuggestion {
    const marketData = this.skillMarketData[skill.name] || { demand: 'medium' as const, difficulty: 'medium' as const, certification: false };

    // Calculate match score based on relevance and current skills
    const jobRelevance = this.calculateJobRelevance(skill.name, jobTitle);
    const skillSynergy = this.calculateSkillSynergy(skill.name, currentSkills);
    const matchScore = (skill.relevance * 0.4) + (jobRelevance * 0.4) + (skillSynergy * 0.2);

    return {
      ...skill,
      matchScore: Math.round(matchScore),
      marketDemand: marketData.demand,
      learningDifficulty: marketData.difficulty,
      certificationAvailable: marketData.certification,
      relatedSkills: this.skillRelationships[skill.name] || [],
      jobRelevance
    };
  }

  private static calculateJobRelevance(skillName: string, jobTitle: string): number {
    const normalizedJobTitle = jobTitle.toLowerCase();
    const skillLower = skillName.toLowerCase();

    // Higher relevance for skills that commonly appear in job titles
    const relevanceMap: Record<string, string[]> = {
      'developer': ['javascript', 'python', 'react', 'node.js', 'typescript'],
      'engineer': ['python', 'java', 'aws', 'docker', 'kubernetes'],
      'analyst': ['data analysis', 'sql', 'python', 'excel', 'tableau'],
      'manager': ['project management', 'leadership', 'communication', 'agile'],
      'designer': ['figma', 'sketch', 'adobe', 'ui/ux', 'design thinking']
    };

    for (const [role, skills] of Object.entries(relevanceMap)) {
      if (normalizedJobTitle.includes(role) && skills.includes(skillLower)) {
        return 10;
      }
    }

    return 5; // Default relevance
  }

  private static calculateSkillSynergy(skillName: string, currentSkills: string[]): number {
    const relatedSkills = this.skillRelationships[skillName] || [];
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    const synergyCount = relatedSkills.filter(related =>
      currentSkillsLower.includes(related.toLowerCase())
    ).length;

    return Math.min(10, synergyCount * 2); // Max score of 10
  }

  private static assessSkillsFoundation(currentSkills: string[], jobTitle: string): boolean {
    const normalizedJobTitle = jobTitle.toLowerCase();
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    // Define foundation skills by role type
    const foundationSkills: Record<string, string[]> = {
      'developer': ['javascript', 'html', 'css', 'git', 'problem solving'],
      'engineer': ['programming', 'problem solving', 'debugging', 'testing'],
      'analyst': ['data analysis', 'excel', 'communication', 'critical thinking'],
      'manager': ['leadership', 'communication', 'project management', 'team collaboration']
    };

    for (const [role, requiredSkills] of Object.entries(foundationSkills)) {
      if (normalizedJobTitle.includes(role)) {
        const hasFoundation = requiredSkills.filter(skill =>
          currentSkillsLower.some(userSkill => userSkill.includes(skill))
        ).length >= Math.ceil(requiredSkills.length * 0.6); // 60% of foundation skills

        return hasFoundation;
      }
    }

    return true; // Default to true for general roles
  }

  private static identifyImprovementAreas(currentSkills: string[], jobTitle: string): string[] {
    const areas = [];
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());
    const normalizedJobTitle = jobTitle.toLowerCase();

    // Check for missing technical foundations
    if (normalizedJobTitle.includes('developer') || normalizedJobTitle.includes('engineer')) {
      if (!currentSkillsLower.some(s => s.includes('git'))) {
        areas.push('Version Control (Git)');
      }
      if (!currentSkillsLower.some(s => s.includes('testing'))) {
        areas.push('Testing & Debugging');
      }
      if (!currentSkillsLower.some(s => s.includes('database'))) {
        areas.push('Database Management');
      }
    }

    // Check for missing soft skills
    const softSkills = ['communication', 'leadership', 'problem solving', 'teamwork'];
    const missingSoftSkills = softSkills.filter(skill =>
      !currentSkillsLower.some(userSkill => userSkill.includes(skill))
    );

    if (missingSoftSkills.length > 2) {
      areas.push('Soft Skills Development');
    }

    return areas;
  }

  private static getTrendingSkillsForRole(jobTitle: string): string[] {
    const normalizedJobTitle = jobTitle.toLowerCase();

    if (normalizedJobTitle.includes('developer') || normalizedJobTitle.includes('engineer')) {
      return ['TypeScript', 'Next.js', 'Docker', 'Kubernetes', 'GraphQL', 'Microservices'];
    }

    if (normalizedJobTitle.includes('data') || normalizedJobTitle.includes('analyst')) {
      return ['Machine Learning', 'Python', 'Tableau', 'Power BI', 'SQL', 'Big Data'];
    }

    if (normalizedJobTitle.includes('manager') || normalizedJobTitle.includes('lead')) {
      return ['Agile Development', 'Scrum', 'OKRs', 'Digital Transformation', 'Remote Leadership'];
    }

    return ['Digital Literacy', 'Adaptability', 'Remote Collaboration', 'Data-Driven Decision Making'];
  }

  private static identifyCompetitiveAdvantage(currentSkills: string[], jobTitle: string): string[] {
    const advantages = [];
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    // High-value technical skills
    const highValueSkills = ['machine learning', 'blockchain', 'ai', 'kubernetes', 'aws', 'cybersecurity'];
    const hasHighValueSkills = highValueSkills.filter(skill =>
      currentSkillsLower.some(userSkill => userSkill.includes(skill))
    );

    if (hasHighValueSkills.length > 0) {
      advantages.push(`Advanced Technical Skills: ${hasHighValueSkills.join(', ')}`);
    }

    // Full-stack capabilities
    const frontendSkills = ['react', 'angular', 'vue', 'javascript', 'typescript'];
    const backendSkills = ['node.js', 'python', 'java', 'c#', 'go'];
    const databaseSkills = ['sql', 'mongodb', 'postgresql', 'mysql'];

    const hasFrontend = frontendSkills.some(skill => currentSkillsLower.includes(skill));
    const hasBackend = backendSkills.some(skill => currentSkillsLower.includes(skill));
    const hasDatabase = databaseSkills.some(skill => currentSkillsLower.includes(skill));

    if (hasFrontend && hasBackend && hasDatabase) {
      advantages.push('Full-Stack Development Capability');
    }

    return advantages;
  }

  private static findMissingCriticalSkills(currentSkills: string[], jobTitle: string): string[] {
    const normalizedJobTitle = jobTitle.toLowerCase();
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    const criticalSkillsByRole: Record<string, string[]> = {
      'developer': ['Programming Languages', 'Version Control', 'Problem Solving'],
      'engineer': ['Technical Design', 'System Architecture', 'Testing'],
      'analyst': ['Data Analysis', 'SQL', 'Reporting Tools'],
      'manager': ['Leadership', 'Communication', 'Project Management']
    };

    for (const [role, critical] of Object.entries(criticalSkillsByRole)) {
      if (normalizedJobTitle.includes(role)) {
        return critical.filter(skill =>
          !currentSkillsLower.some(userSkill =>
            userSkill.includes(skill.toLowerCase())
          )
        );
      }
    }

    return [];
  }

  private static identifyStrengthAreas(cvData: CVData, jobAnalysis: JobAnalysisResult): string[] {
    const userSkills = cvData.skills.map(s => s.name.toLowerCase());
    const strengths = [];

    // Technical strengths
    const technicalMatches = jobAnalysis.requiredSkills
      .filter(skill => skill.category === 'technical' && userSkills.includes(skill.name.toLowerCase()))
      .map(skill => skill.name);

    if (technicalMatches.length > 0) {
      strengths.push(`Technical Skills: ${technicalMatches.slice(0, 3).join(', ')}`);
    }

    // Soft skills strengths
    const softMatches = jobAnalysis.requiredSkills
      .filter(skill => skill.category === 'soft' && userSkills.includes(skill.name.toLowerCase()))
      .map(skill => skill.name);

    if (softMatches.length > 0) {
      strengths.push(`Soft Skills: ${softMatches.slice(0, 3).join(', ')}`);
    }

    return strengths;
  }

  private static identifySkillGaps(cvData: CVData, jobAnalysis: JobAnalysisResult): string[] {
    const userSkills = cvData.skills.map(s => s.name.toLowerCase());

    return jobAnalysis.requiredSkills
      .filter(skill => !userSkills.includes(skill.name.toLowerCase()))
      .map(skill => skill.name)
      .slice(0, 5); // Top 5 gaps
  }

  private static generateJobSpecificRecommendations(cvData: CVData, jobAnalysis: JobAnalysisResult): EnhancedSkillSuggestion[] {
    const userSkills = cvData.skills.map(s => s.name.toLowerCase());
    const recommendations: EnhancedSkillSuggestion[] = [];

    jobAnalysis.requiredSkills
      .filter(skill => !userSkills.includes(skill.name.toLowerCase()))
      .forEach(skill => {
        const marketData = this.skillMarketData[skill.name] || {
          demand: 'medium' as const,
          difficulty: 'medium' as const,
          certification: false
        };

        recommendations.push({
          name: skill.name,
          category: skill.category,
          trending: skill.importance === 'critical',
          relevance: skill.importance === 'critical' ? 10 : skill.importance === 'important' ? 8 : 6,
          matchScore: skill.importance === 'critical' ? 10 : skill.importance === 'important' ? 8 : 6,
          marketDemand: marketData.demand,
          learningDifficulty: marketData.difficulty,
          certificationAvailable: marketData.certification,
          relatedSkills: this.skillRelationships[skill.name] || [],
          jobRelevance: skill.importance === 'critical' ? 10 : 8
        });
      });

    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  private static generatePriorityActions(cvData: CVData, jobAnalysis: JobAnalysisResult): Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }> {
    const actions = [];
    const userSkills = cvData.skills.map(s => s.name.toLowerCase());

    // Critical missing skills
    const criticalMissing = jobAnalysis.requiredSkills
      .filter(skill => skill.importance === 'critical' && !userSkills.includes(skill.name.toLowerCase()));

    if (criticalMissing.length > 0) {
      const skill = criticalMissing[0];
      const difficulty = this.skillMarketData[skill.name]?.difficulty || 'medium';

      actions.push({
        action: `Learn ${skill.name} - it's critical for this role`,
        impact: 'high',
        effort: difficulty === 'easy' ? 'low' : difficulty === 'hard' ? 'high' : 'medium',
        timeline: difficulty === 'easy' ? '2-4 weeks' : difficulty === 'hard' ? '3-6 months' : '1-3 months'
      });
    }

    // Update resume keywords
    if (jobAnalysis.keywords.length > 0) {
      actions.push({
        action: `Update resume with key terms: ${jobAnalysis.keywords.slice(0, 3).join(', ')}`,
        impact: 'high',
        effort: 'low',
        timeline: '1-2 days'
      });
    }

    return actions.slice(0, 5);
  }
}
