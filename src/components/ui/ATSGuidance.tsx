import type React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import Card from './Card';

interface ATSGuidanceProps {
  className?: string;
}

const ATSGuidance: React.FC<ATSGuidanceProps> = ({ className = '' }) => {
  const atsGuidelines = [
    {
      type: 'success',
      title: 'ATS-Friendly Features',
      items: [
        'Standard section headings (Work Experience, Education, Skills)',
        'Clean, simple formatting without complex layouts',
        'Text-based contact information',
        'Standard fonts (Arial, Calibri, Times New Roman)',
        'Bullet points for easy scanning',
        'Keyword optimization support'
      ]
    },
    {
      type: 'warning',
      title: 'ATS Best Practices',
      items: [
        'Use keywords from the job description',
        'Include relevant skills and technologies',
        'Use action verbs to describe achievements',
        'Quantify your accomplishments with numbers',
        'Keep formatting consistent throughout',
        'Save as PDF for best compatibility'
      ]
    },
    {
      type: 'info',
      title: 'What ATS Systems Look For',
      items: [
        'Exact keyword matches from job postings',
        'Relevant work experience and skills',
        'Education requirements and certifications',
        'Employment dates and duration',
        'Contact information and professional profiles',
        'Industry-specific terminology'
      ]
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-text-muted" />;
    }
  };

  const getHeaderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'warning':
        return 'text-yellow-300';
      case 'info':
        return 'text-blue-300';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <Card className={className}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          ATS Optimization Guide
        </h2>
        <p className="text-sm text-text-secondary">
          Follow these guidelines to ensure your CV passes Applicant Tracking Systems (ATS)
        </p>
      </div>

      <div className="space-y-6">
        {atsGuidelines.map((section, index) => (
          <div key={index} className="border border-secondary-light rounded-lg p-4 bg-surface/30">
            <div className="flex items-center mb-3">
              {getIcon(section.type)}
              <h3 className={`ml-2 font-medium ${getHeaderColor(section.type)}`}>
                {section.title}
              </h3>
            </div>
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm text-text-primary flex items-start">
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <h4 className="font-medium text-accent mb-2">Pro Tip:</h4>
        <p className="text-sm text-text-primary">
          The Classic template is specifically optimized for ATS compatibility.
          Use it for maximum ATS pass-through rates when applying to corporate positions.
        </p>
      </div>
    </Card>
  );
};

export default ATSGuidance;
