import type React from 'react';
import { useState } from 'react';
import { Search, Tag, Copy, Check, Lightbulb } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface KeywordSuggestionsProps {
  className?: string;
}

const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({ className = '' }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [copiedKeywords, setCopiedKeywords] = useState<string[]>([]);

  const keywordSuggestions: Record<string, string[]> = {
    // Technology & Engineering
    'software engineer': [
      'JavaScript', 'Python', 'React', 'Node.js', 'Git', 'Agile', 'Scrum',
      'API Development', 'Database Design', 'Problem Solving', 'Team Collaboration',
      'Software Development Life Cycle (SDLC)', 'Code Review', 'Testing'
    ],
    'data analyst': [
      'Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Data Visualization',
      'Statistical Analysis', 'Machine Learning', 'R Programming', 'ETL',
      'Data Mining', 'Business Intelligence', 'Dashboard Creation', 'KPI Analysis'
    ],
    'data scientist': [
      'Machine Learning', 'Python', 'R', 'TensorFlow', 'PyTorch', 'Statistical Modeling',
      'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Big Data',
      'Hadoop', 'Spark', 'Predictive Analytics', 'Data Mining', 'A/B Testing'
    ],
    'devops engineer': [
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'Jenkins', 'CI/CD', 'Terraform',
      'Ansible', 'Monitoring', 'Infrastructure as Code', 'Cloud Computing',
      'Linux', 'Bash Scripting', 'Version Control', 'Automation'
    ],
    'frontend developer': [
      'HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'Angular', 'TypeScript',
      'Responsive Design', 'Cross-browser Compatibility', 'Performance Optimization',
      'UI/UX Design', 'Webpack', 'Sass/SCSS', 'Progressive Web Apps'
    ],
    'backend developer': [
      'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Database Design', 'RESTful APIs',
      'GraphQL', 'Microservices', 'Docker', 'SQL', 'NoSQL', 'Redis', 'Performance Optimization'
    ],

    // Business & Management
    'project manager': [
      'Project Management', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management',
      'Budget Management', 'Timeline Management', 'Team Leadership', 'Communication',
      'Resource Planning', 'Quality Assurance', 'Change Management', 'MS Project'
    ],
    'business analyst': [
      'Business Analysis', 'Requirements Gathering', 'Process Improvement', 'Data Analysis',
      'Stakeholder Management', 'Documentation', 'SQL', 'Business Intelligence',
      'Workflow Optimization', 'Gap Analysis', 'User Stories', 'UAT', 'Visio'
    ],
    'operations manager': [
      'Operations Management', 'Process Optimization', 'Supply Chain Management',
      'Quality Control', 'Cost Reduction', 'Performance Metrics', 'Team Leadership',
      'Strategic Planning', 'Vendor Management', 'Budget Planning', 'Compliance'
    ],
    'product manager': [
      'Product Strategy', 'Market Research', 'User Experience', 'Roadmap Planning',
      'Stakeholder Management', 'Agile Development', 'A/B Testing', 'Analytics',
      'Product Launch', 'Cross-functional Collaboration', 'Customer Feedback', 'Prioritization'
    ],

    // Sales & Marketing
    'marketing manager': [
      'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
      'Email Marketing', 'Google Analytics', 'Campaign Management', 'Brand Management',
      'Market Research', 'Lead Generation', 'ROI Analysis', 'CRM', 'A/B Testing'
    ],
    'sales manager': [
      'Sales Strategy', 'Lead Generation', 'Customer Relationship Management', 'CRM',
      'Sales Forecasting', 'Team Management', 'Pipeline Management', 'Negotiation',
      'Client Acquisition', 'Revenue Growth', 'Performance Metrics', 'Territory Management'
    ],
    'digital marketing specialist': [
      'Google Ads', 'Facebook Ads', 'SEO', 'SEM', 'Social Media Management',
      'Content Creation', 'Email Campaigns', 'Marketing Automation', 'Conversion Optimization',
      'Analytics', 'PPC', 'Influencer Marketing', 'Brand Awareness'
    ],
    'sales representative': [
      'Lead Generation', 'Cold Calling', 'Customer Service', 'Product Knowledge',
      'Sales Presentations', 'CRM Software', 'Relationship Building', 'Goal Achievement',
      'Market Analysis', 'Competitive Intelligence', 'Territory Management', 'Upselling'
    ],

    // Healthcare
    'nurse': [
      'Patient Care', 'Medical Records', 'Clinical Skills', 'Emergency Response',
      'Medication Administration', 'Patient Assessment', 'Healthcare Compliance',
      'Electronic Health Records', 'Critical Thinking', 'Compassionate Care',
      'Team Collaboration', 'Infection Control', 'Health Education'
    ],
    'medical assistant': [
      'Medical Terminology', 'Patient Scheduling', 'Vital Signs', 'Medical Records',
      'Insurance Verification', 'Clinical Procedures', 'Patient Communication',
      'HIPAA Compliance', 'Electronic Health Records', 'Phlebotomy', 'Administrative Tasks'
    ],
    'physical therapist': [
      'Physical Therapy', 'Patient Assessment', 'Treatment Planning', 'Exercise Prescription',
      'Rehabilitation', 'Manual Therapy', 'Injury Prevention', 'Progress Documentation',
      'Patient Education', 'Anatomy Knowledge', 'Pain Management', 'Mobility Training'
    ],
    'healthcare administrator': [
      'Healthcare Management', 'Budget Planning', 'Regulatory Compliance', 'Staff Management',
      'Quality Improvement', 'Healthcare Finance', 'Policy Development', 'Electronic Health Records',
      'Patient Services', 'Strategic Planning', 'Risk Management', 'Healthcare Analytics'
    ],

    // Finance & Accounting
    'financial analyst': [
      'Financial Modeling', 'Excel', 'Data Analysis', 'Financial Reporting', 'Budgeting',
      'Forecasting', 'Risk Assessment', 'Investment Analysis', 'Variance Analysis',
      'Cost Analysis', 'Financial Planning', 'Valuation', 'Market Research'
    ],
    'accountant': [
      'Accounting Principles', 'Financial Statements', 'Tax Preparation', 'Bookkeeping',
      'QuickBooks', 'Excel', 'Accounts Payable', 'Accounts Receivable', 'Reconciliation',
      'Compliance', 'Audit Support', 'Cost Accounting', 'GAAP'
    ],
    'investment banker': [
      'Financial Modeling', 'Valuation', 'Mergers & Acquisitions', 'IPO', 'Due Diligence',
      'Capital Markets', 'Investment Analysis', 'Risk Management', 'Client Relations',
      'Presentation Skills', 'Financial Analysis', 'Market Research', 'Deal Structuring'
    ],
    'loan officer': [
      'Credit Analysis', 'Loan Processing', 'Risk Assessment', 'Customer Service',
      'Financial Documentation', 'Regulatory Compliance', 'Underwriting', 'Sales Skills',
      'Mortgage Knowledge', 'Banking Regulations', 'Communication Skills', 'Attention to Detail'
    ],

    // Education
    'teacher': [
      'Lesson Planning', 'Curriculum Development', 'Classroom Management', 'Student Assessment',
      'Educational Technology', 'Differentiated Instruction', 'Parent Communication',
      'Professional Development', 'State Standards', 'Student Motivation', 'Learning Objectives'
    ],
    'principal': [
      'Educational Leadership', 'Staff Management', 'Budget Administration', 'Curriculum Oversight',
      'Parent Communication', 'Student Discipline', 'Professional Development', 'Strategic Planning',
      'Educational Policy', 'Community Engagement', 'Performance Evaluation', 'Crisis Management'
    ],
    'instructional designer': [
      'Curriculum Design', 'Learning Management Systems', 'Educational Technology',
      'Adult Learning Theory', 'Assessment Design', 'E-learning Development',
      'Training Materials', 'Multimedia Production', 'Performance Analysis', 'Project Management'
    ],

    // Human Resources
    'hr manager': [
      'Human Resources', 'Talent Acquisition', 'Performance Management', 'Employee Relations',
      'Compensation & Benefits', 'HR Policies', 'Training & Development', 'Compliance',
      'Conflict Resolution', 'Workforce Planning', 'HRIS', 'Employment Law'
    ],
    'recruiter': [
      'Talent Acquisition', 'Candidate Screening', 'Interview Coordination', 'Job Posting',
      'Applicant Tracking Systems', 'Sourcing', 'Relationship Building', 'Market Research',
      'Negotiation', 'Onboarding', 'Networking', 'Boolean Search'
    ],

    // Customer Service
    'customer service representative': [
      'Customer Service', 'Problem Resolution', 'Communication Skills', 'CRM Software',
      'Active Listening', 'Patience', 'Product Knowledge', 'Call Center Experience',
      'Conflict Resolution', 'Data Entry', 'Multitasking', 'Time Management'
    ],
    'customer success manager': [
      'Customer Success', 'Account Management', 'Relationship Building', 'Churn Reduction',
      'Customer Onboarding', 'Product Training', 'Upselling', 'Customer Analytics',
      'Retention Strategies', 'Cross-functional Collaboration', 'Communication Skills'
    ],

    // Hospitality & Retail
    'hotel manager': [
      'Hotel Operations', 'Guest Services', 'Staff Management', 'Revenue Management',
      'Customer Service', 'Budget Management', 'Quality Assurance', 'Event Coordination',
      'Hospitality Management', 'Problem Solving', 'Team Leadership', 'Property Management'
    ],
    'retail manager': [
      'Retail Operations', 'Sales Management', 'Inventory Management', 'Customer Service',
      'Staff Training', 'Visual Merchandising', 'Loss Prevention', 'POS Systems',
      'Team Leadership', 'Sales Analysis', 'Store Operations', 'Performance Metrics'
    ],

    // Creative & Design
    'graphic designer': [
      'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'Brand Design',
      'Typography', 'Layout Design', 'Creative Thinking', 'Client Communication',
      'Project Management', 'Print Design', 'Digital Design', 'Color Theory'
    ],
    'ux designer': [
      'User Experience Design', 'User Research', 'Wireframing', 'Prototyping', 'Figma',
      'Sketch', 'Usability Testing', 'Information Architecture', 'User Personas',
      'Journey Mapping', 'Interaction Design', 'Design Thinking', 'Accessibility'
    ],
    'content writer': [
      'Content Creation', 'SEO Writing', 'Copy Writing', 'Blog Writing', 'Social Media Content',
      'Content Strategy', 'Research Skills', 'WordPress', 'Grammar & Style', 'Editing',
      'Brand Voice', 'Content Marketing', 'Storytelling'
    ]
  };

  const getKeywords = () => {
    const normalizedTitle = jobTitle.toLowerCase().trim();
    for (const [key, keywords] of Object.entries(keywordSuggestions)) {
      if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
        return keywords;
      }
    }
    return [];
  };

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeywords([...copiedKeywords, keyword]);
    setTimeout(() => {
      setCopiedKeywords(copiedKeywords.filter(k => k !== keyword));
    }, 2000);
  };

  const keywords = getKeywords();

  return (
    <Card className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-accent" />
          Keyword Suggestions
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Enter a job title to get ATS-friendly keywords from various industries
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer, Nurse, Teacher, Sales Manager"
            className="w-full pl-10 pr-3 py-2 border border-secondary-light bg-surface text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm placeholder:text-text-muted"
          />
        </div>
      </div>

      {keywords.length > 0 && (
        <div>
          <h4 className="font-medium text-text-primary mb-3">
            Recommended Keywords for "{jobTitle}":
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border border-secondary-light rounded-md hover:bg-surface-hover group"
              >
                <span className="text-sm text-text-primary flex-1">{keyword}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyKeyword(keyword)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  {copiedKeywords.includes(keyword) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-text-muted" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-xs text-text-primary flex items-center">
              <Lightbulb className="w-3 h-3 mr-1 text-accent" />
              <strong>Tip:</strong> Click the copy icon to copy keywords, then paste them into your skills,
              experience descriptions, or summary sections where relevant.
            </p>
          </div>
        </div>
      )}

      {jobTitle && keywords.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-text-muted">
            No specific keywords found for "{jobTitle}". Try job titles from various industries like
            "Software Engineer", "Nurse", "Teacher", "Sales Manager", "Accountant", etc.
          </p>
        </div>
      )}
    </Card>
  );
};

export default KeywordSuggestions;
