import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import Card from '../ui/Card';
import { Target, Sparkles, TrendingUp, CheckCircle, AlertCircle, ChevronRight, Zap } from 'lucide-react';

interface JobAnalysis {
  requiredSkills: string[];
  optionalSkills: string[];
  keywords: string[];
  jobTitle: string;
  company: string;
  experience: string;
  suggestions: OptimizationSuggestion[];
  matchScore: number;
}

interface OptimizationSuggestion {
  type: 'skills' | 'experience' | 'keywords' | 'summary';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
}

const JobOptimizer: React.FC = () => {
  const { cv, updateCV } = useCVStore();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description to analyze');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const analysis = performJobAnalysis(jobDescription, jobTitle, company);
      setAnalysis(analysis);
      setShowSuggestions(true);
      setIsAnalyzing(false);
    }, 2000); // Simulate analysis time
  };

  const performJobAnalysis = (description: string, title: string, companyName: string): JobAnalysis => {
    const text = description.toLowerCase();

    // Extract common technical skills
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb', 'postgresql',
      'typescript', 'html', 'css', 'angular', 'vue', 'php', 'c++', 'c#', '.net',
      'agile', 'scrum', 'jira', 'figma', 'adobe', 'photoshop', 'illustrator'
    ];

    const softSkills = [
      'communication', 'leadership', 'teamwork', 'problem solving', 'analytical',
      'project management', 'time management', 'creative', 'detail oriented',
      'self motivated', 'collaborative', 'adaptable', 'innovative'
    ];

    const requiredSkills: string[] = [];
    const optionalSkills: string[] = [];
    const keywords: string[] = [];

    // Extract required skills
    [...techSkills, ...softSkills].forEach(skill => {
      if (text.includes(skill)) {
        if (text.includes(`required ${skill}`) || text.includes(`must have ${skill}`)) {
          requiredSkills.push(skill);
        } else {
          optionalSkills.push(skill);
        }
        keywords.push(skill);
      }
    });

    // Extract experience requirements
    const experienceMatch = text.match(/(\d+)[\+\-\s]*years?\s+(?:of\s+)?experience/);
    const experience = experienceMatch ? `${experienceMatch[1]}+ years` : 'Not specified';

    // Generate optimization suggestions
    const suggestions = generateOptimizationSuggestions(requiredSkills, optionalSkills, keywords, cv);

    // Calculate match score
    const userSkills = cv.skills.map(s => s.name.toLowerCase());
    const matchedSkills = requiredSkills.filter(skill => userSkills.includes(skill));
    const matchScore = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;

    return {
      requiredSkills,
      optionalSkills,
      keywords,
      jobTitle: title,
      company: companyName,
      experience,
      suggestions,
      matchScore
    };
  };

  const generateOptimizationSuggestions = (
    requiredSkills: string[],
    optionalSkills: string[],
    keywords: string[],
    currentCV: typeof cv
  ): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const userSkills = currentCV.skills.map(s => s.name.toLowerCase());

    // Missing required skills
    const missingRequired = requiredSkills.filter(skill => !userSkills.includes(skill));
    if (missingRequired.length > 0) {
      suggestions.push({
        type: 'skills',
        title: 'Add Missing Required Skills',
        description: `Add these essential skills: ${missingRequired.join(', ')}`,
        action: 'Add to skills section if you have experience with them',
        priority: 'high',
        impact: 95
      });
    }

    // Optional skills that could boost application
    const missingOptional = optionalSkills.filter(skill => !userSkills.includes(skill));
    if (missingOptional.length > 0) {
      suggestions.push({
        type: 'skills',
        title: 'Consider Adding Optional Skills',
        description: `These could strengthen your application: ${missingOptional.slice(0, 5).join(', ')}`,
        action: 'Add any of these skills you possess',
        priority: 'medium',
        impact: 70
      });
    }

    // Keyword optimization in summary
    const summaryKeywords = keywords.filter(keyword =>
      !currentCV.personalInfo.summary?.toLowerCase().includes(keyword)
    );
    if (summaryKeywords.length > 0) {
      suggestions.push({
        type: 'summary',
        title: 'Optimize Professional Summary',
        description: `Include key terms: ${summaryKeywords.slice(0, 3).join(', ')}`,
        action: 'Naturally incorporate these keywords into your summary',
        priority: 'high',
        impact: 85
      });
    }

    // Experience optimization
    if (currentCV.workExperience.length > 0) {
      suggestions.push({
        type: 'experience',
        title: 'Highlight Relevant Experience',
        description: 'Reorder and emphasize experience that matches job requirements',
        action: 'Move most relevant positions to the top and enhance descriptions',
        priority: 'medium',
        impact: 80
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const applyOptimization = (suggestion: OptimizationSuggestion) => {
    // This would implement the actual CV modifications
    alert(`Applied optimization: ${suggestion.title}`);
  };

  const createOptimizedVersion = () => {
    if (!analysis) return;

    // Create a job-specific version of the CV
    const optimizedCV = {
      ...cv,
      jobSpecific: {
        jobTitle: analysis.jobTitle,
        company: analysis.company,
        appliedOptimizations: analysis.suggestions.map(s => s.title),
        createdAt: new Date().toISOString()
      }
    };

    updateCV(optimizedCV);
    alert(`Created optimized CV version for ${analysis.company} - ${analysis.jobTitle}`);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Target className="w-6 h-6 mr-2 text-blue-600" />
          Job-Specific CV Optimizer
        </h2>
        <p className="text-gray-600">
          Analyze job descriptions and optimize your CV for specific positions to increase your chances of getting interviews.
        </p>
      </div>

      <div className="space-y-4">
        {/* Job Details Input */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Job Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <TextArea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            rows={8}
            fullWidth
          />
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzeJobDescription}
          disabled={isAnalyzing}
          variant="primary"
          className="w-full flex items-center justify-center"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Analyzing Job Requirements...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze & Optimize CV
            </>
          )}
        </Button>
      </div>

      {/* Analysis Results */}
      {analysis && showSuggestions && (
        <div className="mt-8 space-y-6">
          {/* Match Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">CV Match Score</h3>
                <p className="text-sm text-gray-600">Based on required skills alignment</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  analysis.matchScore >= 80 ? 'text-green-600' :
                  analysis.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.matchScore}%
                </div>
                <div className="text-sm text-gray-500">Match</div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              Required Skills ({analysis.requiredSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    cv.skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {skill}
                  {cv.skills.some(s => s.name.toLowerCase() === skill.toLowerCase()) && ' ✓'}
                </span>
              ))}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Optimization Suggestions
            </h4>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                    suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {suggestion.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <p className="text-xs text-gray-500">{suggestion.action}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-gray-900">+{suggestion.impact}%</div>
                      <div className="text-xs text-gray-500">Impact</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => applyOptimization(suggestion)}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Apply Suggestion
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Optimized Version */}
          <div className="flex justify-center">
            <Button
              onClick={createOptimizedVersion}
              variant="primary"
              className="flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Optimized CV Version
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default JobOptimizer;
