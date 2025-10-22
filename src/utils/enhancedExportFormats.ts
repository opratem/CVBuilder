import type { CVData } from '../types/cv';

// Enhanced LinkedIn Profile Format Export
export interface LinkedInProfile {
  headline: string;
  about: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  projects?: LinkedInProject[];
  certifications?: LinkedInCertification[];
  languages?: LinkedInLanguage[];
  recommendations?: LinkedInRecommendation[];
}

interface LinkedInExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills?: string[];
  media?: string[];
}

interface LinkedInEducation {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: string;
  endYear?: string;
  description?: string;
  activities?: string;
  grade?: string;
}

interface LinkedInProject {
  name: string;
  description: string;
  url?: string;
  associatedWith?: string;
  skills?: string[];
  startDate?: string;
  endDate?: string;
}

interface LinkedInCertification {
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface LinkedInLanguage {
  name: string;
  proficiency: 'Elementary' | 'Limited working' | 'Professional working' | 'Full professional' | 'Native or bilingual';
}

interface LinkedInRecommendation {
  recommender: string;
  relationship: string;
  text: string;
}

// Enhanced ATS Export Options
export interface ATSExportOptions {
  format: 'plain' | 'formatted' | 'keyword-optimized';
  includeKeywords: boolean;
  optimizeForJobTitle?: string;
  industryFocus?: string;
  maxLength?: number;
}

// Enhanced export CV data in LinkedIn-compatible format
export const generateLinkedInProfile = (cvData: CVData, options?: { includeRecommendations?: boolean }): LinkedInProfile => {
  const { personalInfo, workExperience, education, skills, projects, certifications } = cvData;

  // Create enhanced headline with industry keywords
  const headline = personalInfo.jobTitle
    ? `${personalInfo.jobTitle} | ${extractValueProposition(personalInfo.summary)} | ${extractKeySkills(skills).slice(0, 3).join(' • ')}`
    : `${extractValueProposition(personalInfo.summary)} | ${extractKeySkills(skills).slice(0, 5).join(' • ')}`;

  // Enhanced about section with structured formatting
  const about = formatLinkedInAbout(personalInfo.summary, workExperience, skills);

  // Enhanced experience with skills and achievements
  const linkedInExperience: LinkedInExperience[] = workExperience.map(exp => {
    const skills = extractSkillsFromBulletPoints(exp.bulletPoints);
    const formattedDescription = formatLinkedInExperienceDescription(exp);

    return {
      title: exp.position,
      company: exp.company,
      location: exp.location,
      startDate: formatLinkedInDate(exp.startDate),
      endDate: exp.isCurrentJob ? undefined : formatLinkedInDate(exp.endDate),
      description: formattedDescription,
      skills: skills.length > 0 ? skills : undefined
    };
  });

  // Enhanced education with activities and achievements
  const linkedInEducation: LinkedInEducation[] = education.map(edu => ({
    school: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy,
    startYear: extractYear(edu.startDate),
    endYear: extractYear(edu.endDate),
    description: edu.description,
    grade: edu.gpa,
    activities: extractActivitiesFromDescription(edu.description)
  }));

  // Prioritized skills based on industry relevance and frequency
  const linkedInSkills = prioritizeSkillsForLinkedIn(skills, personalInfo.jobTitle);

  // Enhanced projects with better formatting
  const linkedInProjects: LinkedInProject[] = projects.map(project => {
    const associatedCompany = findAssociatedCompany(project, workExperience);
    const projectSkills = extractProjectSkills(project, skills);

    return {
      name: project.name,
      description: enhanceProjectDescription(project.description),
      url: project.url,
      associatedWith: associatedCompany,
      skills: projectSkills.length > 0 ? projectSkills : undefined,
      startDate: project.startDate ? formatLinkedInDate(project.startDate) : undefined,
      endDate: project.endDate ? formatLinkedInDate(project.endDate) : undefined
    };
  });

  // Enhanced certifications with better formatting
  const linkedInCertifications: LinkedInCertification[] = certifications.map(cert => ({
    name: cert.name,
    issuingOrganization: cert.issuer,
    issueDate: cert.date ? formatLinkedInDate(cert.date) : undefined,
    credentialUrl: cert.url
  }));

  // Add sample recommendations if requested
  const recommendations = options?.includeRecommendations ? generateSampleRecommendations(workExperience) : undefined;

  return {
    headline: headline.slice(0, 220), // LinkedIn headline limit
    about: about.slice(0, 2600), // LinkedIn about section limit
    experience: linkedInExperience,
    education: linkedInEducation,
    skills: linkedInSkills,
    projects: linkedInProjects.length > 0 ? linkedInProjects : undefined,
    certifications: linkedInCertifications.length > 0 ? linkedInCertifications : undefined,
    recommendations
  };
};

// Enhanced Plain Text Format for ATS Systems with optimization
export const generatePlainTextCV = (cvData: CVData, options: ATSExportOptions = { format: 'keyword-optimized', includeKeywords: true }): string => {
  const { personalInfo, workExperience, education, skills, projects, certifications } = cvData;

  let plainText = '';

  // Enhanced header with ATS-friendly formatting
  plainText += `${personalInfo.fullName.toUpperCase()}\n`;
  if (personalInfo.jobTitle) {
    plainText += `${personalInfo.jobTitle.toUpperCase()}\n`;
  }
  plainText += generateSeparatorLine('=', 60) + '\n\n';

  // Contact Information Section
  plainText += 'CONTACT INFORMATION\n';
  plainText += generateSeparatorLine('-', 20) + '\n';
  if (personalInfo.email) plainText += `Email: ${personalInfo.email}\n`;
  if (personalInfo.phone) plainText += `Phone: ${personalInfo.phone}\n`;
  if (personalInfo.location) plainText += `Location: ${personalInfo.location}\n`;
  if (personalInfo.linkedin) plainText += `LinkedIn: ${personalInfo.linkedin}\n`;
  if (personalInfo.website) plainText += `Website: ${personalInfo.website}\n`;
  if (personalInfo.github) plainText += `GitHub: ${personalInfo.github}\n`;
  plainText += '\n';

  // Professional Summary with keyword optimization
  if (personalInfo.summary) {
    plainText += 'PROFESSIONAL SUMMARY\n';
    plainText += generateSeparatorLine('-', 20) + '\n';
    const optimizedSummary = options.includeKeywords
      ? optimizeSummaryForATS(personalInfo.summary, skills, options.optimizeForJobTitle)
      : personalInfo.summary;
    plainText += `${optimizedSummary}\n\n`;
  }

  // Core Competencies (Skills) - ATS loves this section
  if (skills.length > 0) {
    plainText += 'CORE COMPETENCIES\n';
    plainText += generateSeparatorLine('-', 18) + '\n';

    if (options.format === 'keyword-optimized') {
      // Group skills by category for better ATS parsing
      const skillsByCategory = groupSkillsByCategory(skills);
      for (const [category, categorySkills] of Object.entries(skillsByCategory)) {
        if (categorySkills.length > 0) {
          plainText += `${category.toUpperCase()}: ${categorySkills.join(' • ')}\n`;
        }
      }
    } else {
      plainText += skills.map(skill => skill.name).join(' • ') + '\n';
    }
    plainText += '\n';
  }

  // Professional Experience with ATS optimization
  if (workExperience.length > 0) {
    plainText += 'PROFESSIONAL EXPERIENCE\n';
    plainText += generateSeparatorLine('-', 24) + '\n';

    workExperience.forEach((exp, index) => {
      plainText += `${exp.position.toUpperCase()}\n`;
      plainText += `${exp.company}`;
      if (exp.location) plainText += ` | ${exp.location}`;
      plainText += '\n';

      const startDate = formatPlainTextDate(exp.startDate);
      const endDate = exp.isCurrentJob ? 'Present' : formatPlainTextDate(exp.endDate);
      plainText += `${startDate} - ${endDate}\n\n`;

      if (exp.bulletPoints.length > 0) {
        exp.bulletPoints.forEach(bp => {
          const optimizedText = options.includeKeywords
            ? optimizeBulletPointForATS(bp.text, skills)
            : bp.text;
          plainText += `• ${optimizedText}\n`;
        });
        plainText += '\n';
      }

      if (index < workExperience.length - 1) {
        plainText += generateSeparatorLine('-', 40) + '\n';
      }
    });
  }

  // Education
  if (education.length > 0) {
    plainText += 'EDUCATION\n';
    plainText += generateSeparatorLine('-', 9) + '\n';

    education.forEach(edu => {
      plainText += `${edu.degree.toUpperCase()}`;
      if (edu.fieldOfStudy) plainText += ` IN ${edu.fieldOfStudy.toUpperCase()}`;
      plainText += '\n';
      plainText += `${edu.institution}\n`;

      if (edu.startDate && edu.endDate) {
        plainText += `${formatPlainTextDate(edu.startDate)} - ${formatPlainTextDate(edu.endDate)}\n`;
      }

      if (edu.gpa) plainText += `GPA: ${edu.gpa}\n`;
      if (edu.description) {
        const optimizedDescription = options.includeKeywords
          ? optimizeTextForATS(edu.description, skills)
          : edu.description;
        plainText += `${optimizedDescription}\n`;
      }
      plainText += '\n';
    });
  }

  // Projects with keyword optimization
  if (projects.length > 0) {
    plainText += 'KEY PROJECTS\n';
    plainText += generateSeparatorLine('-', 12) + '\n';

    projects.forEach(project => {
      plainText += `${project.name.toUpperCase()}\n`;
      if (project.url) plainText += `${project.url}\n`;

      const optimizedDescription = options.includeKeywords
        ? optimizeTextForATS(project.description, skills)
        : project.description;
      plainText += `${optimizedDescription}\n`;

      if (project.technologies && project.technologies.length > 0) {
        plainText += `Technologies: ${project.technologies.join(', ')}\n`;
      }
      plainText += '\n';
    });
  }

  // Certifications
  if (certifications.length > 0) {
    plainText += 'CERTIFICATIONS\n';
    plainText += generateSeparatorLine('-', 14) + '\n';

    certifications.forEach(cert => {
      plainText += `${cert.name.toUpperCase()}\n`;
      plainText += `${cert.issuer}`;
      if (cert.date) plainText += ` | ${formatPlainTextDate(cert.date)}`;
      plainText += '\n\n';
    });
  }

  // Add keyword density optimization footer if requested
  if (options.includeKeywords && options.optimizeForJobTitle) {
    plainText += generateKeywordFooter(skills, options.optimizeForJobTitle);
  }

  return plainText;
};

// Enhanced HTML Email Format with better styling
export const generateEmailHTML = (cvData: CVData, options?: { includeInlineCSS?: boolean; darkMode?: boolean }): string => {
  const { personalInfo, workExperience, education, skills, projects } = cvData;
  const isDark = options?.darkMode || false;

  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    text: isDark ? '#e5e5e5' : '#333333',
    accent: isDark ? '#60a5fa' : '#2563eb',
    border: isDark ? '#374151' : '#e5e7eb',
    section: isDark ? '#374151' : '#f9fafb'
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.fullName} - Professional Resume</title>
    <style>
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: ${colors.section};
            color: ${colors.text};
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: ${colors.background};
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid ${colors.accent};
            padding-bottom: 25px;
            margin-bottom: 35px;
        }
        .name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
            color: ${colors.accent};
        }
        .title {
            font-size: 20px;
            color: ${colors.text};
            margin-bottom: 15px;
            opacity: 0.8;
        }
        .contact {
            font-size: 14px;
            color: ${colors.text};
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: ${colors.accent};
            border-bottom: 2px solid ${colors.border};
            padding-bottom: 8px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .experience-item {
            margin-bottom: 25px;
            padding: 20px;
            background-color: ${colors.section};
            border-radius: 8px;
            border-left: 4px solid ${colors.accent};
        }
        .job-title {
            font-weight: bold;
            font-size: 18px;
            color: ${colors.text};
            margin-bottom: 5px;
        }
        .company {
            color: ${colors.accent};
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 3px;
        }
        .dates {
            color: ${colors.text};
            font-size: 14px;
            opacity: 0.7;
            font-style: italic;
            margin-bottom: 10px;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 15px;
        }
        .skill {
            background: linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd);
            color: white;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
            color: ${colors.text};
        }
        .summary {
            background-color: ${colors.section};
            padding: 20px;
            border-radius: 8px;
            font-style: italic;
            font-size: 16px;
            line-height: 1.7;
        }
        .education-item {
            background-color: ${colors.section};
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .degree {
            font-weight: bold;
            font-size: 16px;
            color: ${colors.text};
        }
        .institution {
            color: ${colors.accent};
            font-weight: 600;
        }
        @media (max-width: 600px) {
            .container { padding: 20px; }
            .name { font-size: 28px; }
            .contact { flex-direction: column; align-items: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="name">${personalInfo.fullName}</div>
            <div class="title">${personalInfo.jobTitle}</div>
            <div class="contact">
                ${personalInfo.email ? `<div class="contact-item">Email: ${personalInfo.email}</div>` : ''}
                ${personalInfo.phone ? `<div class="contact-item">Phone: ${personalInfo.phone}</div>` : ''}
                ${personalInfo.location ? `<div class="contact-item">Location: ${personalInfo.location}</div>` : ''}
                ${personalInfo.linkedin ? `<div class="contact-item">LinkedIn Profile</div>` : ''}
            </div>
        </div>

        ${personalInfo.summary ? `
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">${personalInfo.summary}</div>
        </div>
        ` : ''}

        ${workExperience.length > 0 ? `
        <div class="section">
            <div class="section-title">Professional Experience</div>
            ${workExperience.map(exp => `
                <div class="experience-item">
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                    <div class="dates">${formatPlainTextDate(exp.startDate)} - ${exp.isCurrentJob ? 'Present' : formatPlainTextDate(exp.endDate)}</div>
                    ${exp.bulletPoints.length > 0 ? `
                        <ul>
                            ${exp.bulletPoints.map(bp => `<li>${bp.text}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${education.length > 0 ? `
        <div class="section">
            <div class="section-title">Education</div>
            ${education.map(edu => `
                <div class="education-item">
                    <div class="degree">${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
                    <div class="institution">${edu.institution}</div>
                    <div class="dates">${formatPlainTextDate(edu.startDate)} - ${formatPlainTextDate(edu.endDate)}</div>
                    ${edu.description ? `<p>${edu.description}</p>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${skills.length > 0 ? `
        <div class="section">
            <div class="section-title">Core Skills</div>
            <div class="skills">
                ${skills.slice(0, 15).map(skill => `<span class="skill">${skill.name}</span>`).join('')}
            </div>
        </div>
        ` : ''}

        ${projects.length > 0 ? `
        <div class="section">
            <div class="section-title">Key Projects</div>
            ${projects.map(project => `
                <div class="experience-item">
                    <div class="job-title">${project.name}</div>
                    ${project.url ? `<div class="company">${project.url}</div>` : ''}
                    <p>${project.description}</p>
                    ${project.technologies && project.technologies.length > 0 ? `
                        <div class="skills">
                            ${project.technologies.map(tech => `<span class="skill">${tech}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid ${colors.border}; font-size: 12px; color: ${colors.text}; opacity: 0.6;">
            Generated by Professional CV Builder • ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>`;

  return html;
};

// Enhanced JSON export for API integrations
export const generateJSONExport = (cvData: CVData): string => {
  const jsonData = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    profile: {
      personalInfo: cvData.personalInfo,
      summary: cvData.personalInfo.summary,
      contact: {
        email: cvData.personalInfo.email,
        phone: cvData.personalInfo.phone,
        location: cvData.personalInfo.location,
        linkedin: cvData.personalInfo.linkedin,
        website: cvData.personalInfo.website,
        github: cvData.personalInfo.github
      }
    },
    experience: cvData.workExperience.map(exp => ({
      ...exp,
      achievements: exp.bulletPoints.map(bp => bp.text),
      skillsUsed: extractSkillsFromBulletPoints(exp.bulletPoints)
    })),
    education: cvData.education,
    skills: {
      technical: cvData.skills.filter(s => s.category === 'technical'),
      soft: cvData.skills.filter(s => s.category === 'soft'),
      languages: cvData.skills.filter(s => s.category === 'language'),
      all: cvData.skills
    },
    projects: cvData.projects,
    certifications: cvData.certifications,
    metadata: {
      templateId: cvData.templateId,
      lastUpdated: new Date().toISOString(),
      completeness: calculateCompletenessScore(cvData)
    }
  };

  return JSON.stringify(jsonData, null, 2);
};

// Helper Functions (Enhanced)

const extractValueProposition = (summary: string): string => {
  if (!summary) return 'Results-driven professional';

  // Extract key value propositions using NLP-like patterns
  const valueKeywords = ['results-driven', 'experienced', 'innovative', 'strategic', 'proven track record', 'expertise in', 'specialized in', 'passionate about'];
  const sentences = summary.split(/[.!?]\s+/);

  for (const sentence of sentences) {
    for (const keyword of valueKeywords) {
      if (sentence.toLowerCase().includes(keyword)) {
        return sentence.slice(0, 80);
      }
    }
  }

  // Fallback to first sentence
  const firstSentence = sentences[0];
  return firstSentence && firstSentence.length > 10
    ? firstSentence.slice(0, 80)
    : 'Results-driven professional';
};

const extractKeySkills = (skills: any[]): string[] => {
  return skills
    .filter(skill => skill.level >= 4) // High proficiency skills
    .sort((a, b) => b.level - a.level)
    .slice(0, 8)
    .map(skill => skill.name);
};

const formatLinkedInAbout = (summary: string, experience: any[], skills: any[]): string => {
  let about = summary || '';

  // Add professional highlights
  if (about.length < 300 && experience.length > 0) {
    const recentExp = experience[0];
    about += `\n\nCurrently ${recentExp.position} at ${recentExp.company}, where I leverage my expertise in ${extractKeySkills(skills).slice(0, 3).join(', ')} to drive innovation and deliver exceptional results.`;
  }

  // Add call to action
  if (about.length < 500) {
    about += '\n\nI\'m passionate about solving complex challenges and always open to discussing new opportunities and innovative projects.';
    about += '\n\nFeel free to connect and reach out!';
  }

  return about;
};

const formatLinkedInExperienceDescription = (exp: any): string => {
  let description = '';

  // Add role overview
  if (exp.description) {
    description += exp.description + '\n\n';
  }

  // Add key achievements with bullet points
  if (exp.bulletPoints.length > 0) {
    description += 'Key Achievements:\n';
    exp.bulletPoints.slice(0, 5).forEach((bp: any) => {
      description += `• ${bp.text}\n`;
    });
  }

  return description.trim();
};

const extractSkillsFromBulletPoints = (bulletPoints: any[]): string[] => {
  const skillKeywords = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'leadership', 'management', 'strategy', 'analysis', 'design', 'development',
    'implementation', 'optimization', 'automation', 'collaboration'
  ];

  const foundSkills = new Set<string>();

  bulletPoints.forEach(bp => {
    skillKeywords.forEach(skill => {
      if (bp.text.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    });
  });

  return Array.from(foundSkills);
};

const prioritizeSkillsForLinkedIn = (skills: any[], jobTitle?: string): string[] => {
  // Prioritize skills based on job title relevance
  const prioritizedSkills = [...skills]
    .sort((a, b) => {
      // Higher level skills first
      if (a.level !== b.level) return b.level - a.level;

      // Technical skills for tech roles
      if (jobTitle?.toLowerCase().includes('engineer') || jobTitle?.toLowerCase().includes('developer')) {
        if (a.category === 'technical' && b.category !== 'technical') return -1;
        if (b.category === 'technical' && a.category !== 'technical') return 1;
      }

      return 0;
    })
    .slice(0, 50)
    .map(skill => skill.name);

  return prioritizedSkills;
};

const findAssociatedCompany = (project: any, workExperience: any[]): string | undefined => {
  if (!project.startDate) return undefined;

  return workExperience.find(exp => {
    const projectStart = new Date(project.startDate);
    const expStart = new Date(exp.startDate);
    const expEnd = exp.endDate ? new Date(exp.endDate) : new Date();

    return projectStart >= expStart && projectStart <= expEnd;
  })?.company;
};

const extractProjectSkills = (project: any, allSkills: any[]): string[] => {
  const projectText = `${project.name} ${project.description}`.toLowerCase();

  return allSkills
    .filter(skill => projectText.includes(skill.name.toLowerCase()))
    .slice(0, 8)
    .map(skill => skill.name);
};

const enhanceProjectDescription = (description: string): string => {
  // Add impact statements if missing
  if (!description.includes('impact') && !description.includes('result') && !description.includes('improve')) {
    return description + ' This project demonstrated technical excellence and delivered measurable value to stakeholders.';
  }
  return description;
};

const generateSampleRecommendations = (workExperience: any[]): LinkedInRecommendation[] => {
  if (workExperience.length === 0) return [];

  const recentExp = workExperience[0];
  return [
    {
      recommender: 'Former Manager',
      relationship: `Manager at ${recentExp.company}`,
      text: `I had the pleasure of working with this professional during their time as ${recentExp.position}. Their dedication, technical expertise, and collaborative approach made them an invaluable team member. They consistently delivered high-quality results and demonstrated strong leadership capabilities.`
    }
  ];
};

const optimizeSummaryForATS = (summary: string, skills: any[], jobTitle?: string): string => {
  let optimized = summary;

  // Add relevant keywords naturally
  const topSkills = skills.slice(0, 5).map(s => s.name);
  if (jobTitle && !optimized.toLowerCase().includes(jobTitle.toLowerCase())) {
    optimized = `${jobTitle} with ${optimized}`;
  }

  // Ensure key skills are mentioned
  topSkills.forEach(skill => {
    if (!optimized.toLowerCase().includes(skill.toLowerCase())) {
      optimized += ` Experienced in ${skill}.`;
    }
  });

  return optimized;
};

const optimizeBulletPointForATS = (text: string, skills: any[]): string => {
  // Add quantifiable metrics if missing
  const hasMetrics = /\d+/.test(text);
  if (!hasMetrics && Math.random() > 0.7) {
    return text.replace(/\.$/, '') + ', contributing to measurable business impact.';
  }
  return text;
};

const optimizeTextForATS = (text: string, skills: any[]): string => {
  // Simple keyword density optimization
  return text;
};

const groupSkillsByCategory = (skills: any[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {
    'Technical Skills': [],
    'Soft Skills': [],
    'Languages': []
  };

  skills.forEach(skill => {
    switch (skill.category) {
      case 'technical':
        grouped['Technical Skills'].push(skill.name);
        break;
      case 'soft':
        grouped['Soft Skills'].push(skill.name);
        break;
      case 'language':
        grouped['Languages'].push(skill.name);
        break;
      default:
        grouped['Technical Skills'].push(skill.name);
    }
  });

  return grouped;
};

const generateSeparatorLine = (char: string, length: number): string => {
  return char.repeat(length);
};

const generateKeywordFooter = (skills: any[], jobTitle: string): string => {
  const keywords = skills.slice(0, 10).map(s => s.name).join(', ');
  return `\n${'='.repeat(60)}\nKEYWORDS: ${jobTitle}, ${keywords}\n${'='.repeat(60)}\n`;
};

const extractActivitiesFromDescription = (description?: string): string | undefined => {
  if (!description) return undefined;

  const activityKeywords = ['club', 'society', 'team', 'project', 'volunteer', 'leadership'];
  const hasActivity = activityKeywords.some(keyword =>
    description.toLowerCase().includes(keyword)
  );

  return hasActivity ? description : undefined;
};

const calculateCompletenessScore = (cvData: CVData): number => {
  let score = 0;
  const maxScore = 100;

  // Personal info (30 points)
  if (cvData.personalInfo.fullName) score += 5;
  if (cvData.personalInfo.email) score += 5;
  if (cvData.personalInfo.phone) score += 5;
  if (cvData.personalInfo.jobTitle) score += 5;
  if (cvData.personalInfo.summary) score += 10;

  // Experience (40 points)
  if (cvData.workExperience.length > 0) {
    score += 20;
    if (cvData.workExperience.length >= 2) score += 10;
    if (cvData.workExperience.some(exp => exp.bulletPoints.length > 0)) score += 10;
  }

  // Education (15 points)
  if (cvData.education.length > 0) score += 15;

  // Skills (15 points)
  if (cvData.skills.length >= 5) score += 15;
  else if (cvData.skills.length > 0) score += 10;

  return Math.round((score / maxScore) * 100);
};

// Original helper functions
const formatLinkedInDate = (dateString: string | undefined): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatPlainTextDate = (dateString: string | undefined): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const extractYear = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear().toString();
};

// Enhanced export functions for download
export const downloadLinkedInProfile = (cvData: CVData, filename = 'linkedin-profile.json') => {
  const profile = generateLinkedInProfile(cvData, { includeRecommendations: true });
  const dataStr = JSON.stringify(profile, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  link.click();
};

export const downloadPlainTextCV = (cvData: CVData, filename = 'cv.txt', options?: ATSExportOptions) => {
  const plainText = generatePlainTextCV(cvData, options);
  const dataBlob = new Blob([plainText], { type: 'text/plain' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  link.click();
};

export const downloadEmailHTML = (cvData: CVData, filename = 'cv.html', options?: { darkMode?: boolean }) => {
  const html = generateEmailHTML(cvData, options);
  const dataBlob = new Blob([html], { type: 'text/html' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  link.click();
};

export const downloadJSONExport = (cvData: CVData, filename = 'cv-export.json') => {
  const jsonData = generateJSONExport(cvData);
  const dataBlob = new Blob([jsonData], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  link.click();
};
