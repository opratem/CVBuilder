// Skills database organized by industry and category
export interface SkillSuggestion {
  name: string;
  category: 'technical' | 'soft' | 'industry';
  trending: boolean;
  relevance: number; // 1-10 scale
  description?: string;
}

export interface SkillsDatabase {
  [industry: string]: {
    [category: string]: SkillSuggestion[];
  };
}

export const skillsDatabase: SkillsDatabase = {
  technology: {
    'Programming Languages': [
      { name: 'JavaScript', category: 'technical', trending: true, relevance: 10 },
      { name: 'Python', category: 'technical', trending: true, relevance: 10 },
      { name: 'TypeScript', category: 'technical', trending: true, relevance: 9 },
      { name: 'Java', category: 'technical', trending: true, relevance: 8 },
      { name: 'C#', category: 'technical', trending: false, relevance: 7 },
      { name: 'Go', category: 'technical', trending: true, relevance: 8 },
      { name: 'Rust', category: 'technical', trending: true, relevance: 7 },
      { name: 'Swift', category: 'technical', trending: false, relevance: 6 },
      { name: 'Kotlin', category: 'technical', trending: true, relevance: 7 },
      { name: 'PHP', category: 'technical', trending: false, relevance: 6 },
    ],
    'Frameworks & Libraries': [
      { name: 'React', category: 'technical', trending: true, relevance: 10 },
      { name: 'Next.js', category: 'technical', trending: true, relevance: 9 },
      { name: 'Vue.js', category: 'technical', trending: true, relevance: 8 },
      { name: 'Angular', category: 'technical', trending: false, relevance: 7 },
      { name: 'Node.js', category: 'technical', trending: true, relevance: 9 },
      { name: 'Express.js', category: 'technical', trending: true, relevance: 8 },
      { name: 'Django', category: 'technical', trending: true, relevance: 8 },
      { name: 'Flask', category: 'technical', trending: false, relevance: 7 },
      { name: 'Spring Boot', category: 'technical', trending: true, relevance: 8 },
      { name: 'TailwindCSS', category: 'technical', trending: true, relevance: 8 },
    ],
    'Databases': [
      { name: 'PostgreSQL', category: 'technical', trending: true, relevance: 9 },
      { name: 'MongoDB', category: 'technical', trending: true, relevance: 8 },
      { name: 'MySQL', category: 'technical', trending: false, relevance: 7 },
      { name: 'Redis', category: 'technical', trending: true, relevance: 8 },
      { name: 'Elasticsearch', category: 'technical', trending: true, relevance: 7 },
      { name: 'Supabase', category: 'technical', trending: true, relevance: 8 },
      { name: 'Firebase', category: 'technical', trending: true, relevance: 7 },
    ],
    'Cloud & DevOps': [
      { name: 'AWS', category: 'technical', trending: true, relevance: 10 },
      { name: 'Azure', category: 'technical', trending: true, relevance: 9 },
      { name: 'Google Cloud', category: 'technical', trending: true, relevance: 8 },
      { name: 'Docker', category: 'technical', trending: true, relevance: 9 },
      { name: 'Kubernetes', category: 'technical', trending: true, relevance: 8 },
      { name: 'Jenkins', category: 'technical', trending: false, relevance: 6 },
      { name: 'GitLab CI/CD', category: 'technical', trending: true, relevance: 7 },
      { name: 'Terraform', category: 'technical', trending: true, relevance: 8 },
    ],
    'Soft Skills': [
      { name: 'Problem Solving', category: 'soft', trending: true, relevance: 10 },
      { name: 'Team Collaboration', category: 'soft', trending: true, relevance: 9 },
      { name: 'Agile Development', category: 'soft', trending: true, relevance: 9 },
      { name: 'Code Review', category: 'soft', trending: true, relevance: 8 },
      { name: 'Technical Leadership', category: 'soft', trending: true, relevance: 8 },
      { name: 'Mentoring', category: 'soft', trending: true, relevance: 7 },
    ]
  },

  general: {
    'Universal Soft Skills': [
      { name: 'Leadership', category: 'soft', trending: true, relevance: 10 },
      { name: 'Communication', category: 'soft', trending: true, relevance: 10 },
      { name: 'Problem Solving', category: 'soft', trending: true, relevance: 10 },
      { name: 'Time Management', category: 'soft', trending: true, relevance: 9 },
      { name: 'Project Management', category: 'soft', trending: true, relevance: 9 },
      { name: 'Team Collaboration', category: 'soft', trending: true, relevance: 9 },
      { name: 'Adaptability', category: 'soft', trending: true, relevance: 9 },
      { name: 'Critical Thinking', category: 'soft', trending: true, relevance: 9 },
      { name: 'Creativity', category: 'soft', trending: true, relevance: 8 },
      { name: 'Emotional Intelligence', category: 'soft', trending: true, relevance: 8 },
    ],
    'Digital Literacy': [
      { name: 'Microsoft Office Suite', category: 'technical', trending: true, relevance: 8 },
      { name: 'Google Workspace', category: 'technical', trending: true, relevance: 8 },
      { name: 'Data Analysis', category: 'technical', trending: true, relevance: 9 },
      { name: 'Basic Coding', category: 'technical', trending: true, relevance: 7 },
      { name: 'Digital Communication', category: 'technical', trending: true, relevance: 8 },
    ]
  }
};

// Function to get skill suggestions based on job title or industry
export const getSkillSuggestions = (
  jobTitle: string = '',
  existingSkills: string[] = [],
  limit: number = 20
): SkillSuggestion[] => {
  const normalizedJobTitle = jobTitle.toLowerCase();
  const existingSkillsSet = new Set(existingSkills.map(s => s.toLowerCase()));

  // Determine industry based on job title
  let targetIndustry = 'general';

  if (normalizedJobTitle.includes('developer') || normalizedJobTitle.includes('engineer') ||
      normalizedJobTitle.includes('programmer') || normalizedJobTitle.includes('software')) {
    targetIndustry = 'technology';
  }

  // Collect skills from target industry + general skills
  const allSuggestions: SkillSuggestion[] = [];

  // Add industry-specific skills
  if (skillsDatabase[targetIndustry]) {
    Object.values(skillsDatabase[targetIndustry]).forEach(categorySkills => {
      allSuggestions.push(...categorySkills);
    });
  }

  // Add general skills
  Object.values(skillsDatabase.general).forEach(categorySkills => {
    allSuggestions.push(...categorySkills);
  });

  // Filter out existing skills and sort by relevance and trending status
  const filteredSuggestions = allSuggestions
    .filter(skill => !existingSkillsSet.has(skill.name.toLowerCase()))
    .sort((a, b) => {
      // Prioritize trending skills, then by relevance
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      return b.relevance - a.relevance;
    })
    .slice(0, limit);

  return filteredSuggestions;
};

// Function to get trending skills across all industries
export const getTrendingSkills = (limit: number = 10): SkillSuggestion[] => {
  const allSkills: SkillSuggestion[] = [];

  Object.values(skillsDatabase).forEach(industry => {
    Object.values(industry).forEach(categorySkills => {
      allSkills.push(...categorySkills);
    });
  });

  return allSkills
    .filter(skill => skill.trending)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
};
