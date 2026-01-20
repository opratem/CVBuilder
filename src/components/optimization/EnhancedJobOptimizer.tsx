import type React from 'react';
import { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import Card from '../ui/Card';
import {
  Target, Sparkles, TrendingUp, CheckCircle, AlertCircle, ChevronRight, Zap,
  Users, Award, Lightbulb, BarChart3, Brain, FileEdit, ArrowRight,
  BookOpen, Star, Clock, Building2
} from 'lucide-react';
import { JobAnalysisService, type JobAnalysisResult, type OptimizationSuggestion, type CompetencyGap } from '../../utils/jobAnalysisService';
import { cvDataService } from '../../services/cvDataService';

const EnhancedJobOptimizer: React.FC = () => {
  const { cv, updateCV, addSkill, updatePersonalInfo } = useCVStore();
  const { showSuccess, showError, showInfo } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'gaps' | 'keywords'>('overview');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) {
      showError('Missing Information', 'Please enter a job description to analyze');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const analysisResult = JobAnalysisService.analyzeJobDescription(
        jobDescription,
        jobTitle,
        company,
        cv
      );
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
      showSuccess('Analysis Complete', 'Job requirements analyzed successfully!');
    }, 1500);
  };

  const applyOptimization = (suggestion: OptimizationSuggestion) => {
    const suggestionKey = `${suggestion.type}-${suggestion.title}`;

    if (appliedSuggestions.has(suggestionKey)) {
      return;
    }

    switch (suggestion.type) {
      case 'skills':
        if (suggestion.specifics?.skillsToAdd) {
          let addedSkills = 0;
          suggestion.specifics.skillsToAdd.forEach(skillName => {
            const skillExists = cv.skills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
            if (!skillExists) {
              addSkill({ name: skillName, level: 3 });
              addedSkills++;
            }
          });
          if (addedSkills > 0) {
            showSuccess('Skills Added!', `Successfully added ${addedSkills} skill(s) to your CV`);
          } else {
            showInfo('Skills Already Present', 'All suggested skills are already in your CV');
          }
        }
        break;
      case 'summary':
        if (suggestion.specifics?.keywordsToInclude) {
          const currentSummary = cv.personalInfo.summary || '';
          const keywordsToAdd = suggestion.specifics.keywordsToInclude.filter(keyword =>
            !currentSummary.toLowerCase().includes(keyword.toLowerCase())
          );

          if (keywordsToAdd.length > 0) {
            const keywordsList = keywordsToAdd.join(', ');
            showInfo('Summary Keywords', `Include these keywords in your summary: ${keywordsList}`);
          } else {
            showSuccess('Keywords Already Included', 'Your summary already includes the suggested keywords');
          }
        }
        break;
      case 'experience':
        showInfo(suggestion.title, suggestion.action);
        break;
      case 'reorder':
        if (suggestion.specifics?.sectionsToReorder) {
          const sections = suggestion.specifics.sectionsToReorder.join(' → ');
          showInfo('Section Reordering', `Consider reordering sections in this priority: ${sections}`);
        }
        break;
      default:
        showInfo(suggestion.title, suggestion.action);
    }

    setAppliedSuggestions(prev => new Set(prev).add(suggestionKey));
  };

  const createOptimizedVersion = async () => {
    if (!analysis) return;

    try {
      const versionName = `${analysis.company} - ${analysis.jobTitle}`;
      const response = await cvDataService.createCVVersion(cv, cv.templateId, versionName);

      if (response.success) {
        const optimizedCV = {
          ...cv,
          jobSpecific: {
            jobTitle: analysis.jobTitle,
            company: analysis.company,
            appliedOptimizations: Array.from(appliedSuggestions),
            createdAt: new Date().toISOString()
          }
        };

        updateCV(optimizedCV);
        showSuccess('CV Version Created!', `Successfully created optimized CV version: "${versionName}"`);
      } else {
        showError('Failed to Save Version', response.error || 'An error occurred while saving your CV version');
      }
    } catch (error) {
      console.error('Error creating optimized version:', error);
      showError('Save Failed', 'Failed to create optimized CV version. Please try again.');
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-light';
    if (score >= 60) return 'text-[#fbbf24]';
    return 'text-[#ff6b6b]';
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return 'glass-success';
    if (score >= 60) return 'glass-warning';
    return 'glass-error';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 ${getMatchScoreBg(analysis!.matchScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-primary">CV Match Score</h3>
            <p className="text-sm text-text-secondary mt-1">Based on job requirements analysis</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getMatchScoreColor(analysis!.matchScore)}`}>
              {analysis!.matchScore}%
            </div>
            <div className="text-sm text-text-muted">Overall Match</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-text-primary">{analysis!.requiredSkills.length}</div>
            <div className="text-xs text-text-muted">Required Skills</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-text-primary">{analysis!.optionalSkills.length}</div>
            <div className="text-xs text-text-muted">Optional Skills</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-text-primary">{analysis!.keywords.length}</div>
            <div className="text-xs text-text-muted">Keywords</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-text-primary">{analysis!.industries.length}</div>
            <div className="text-xs text-text-muted">Industries</div>
          </div>
        </div>
      </div>

      {analysis!.industries.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-text-primary mb-3 flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-accent" />
            Identified Industries
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis!.industries.map((industry, index) => (
              <span
                key={index}
                className="tag-info px-3 py-1 rounded-full text-sm capitalize"
              >
                {industry}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h4 className="font-semibold text-text-primary mb-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-[#ff6b6b]" />
          Critical Skills ({analysis!.requiredSkills.length})
        </h4>
        <div className="space-y-2">
          {analysis!.requiredSkills.slice(0, 10).map((skill, index) => {
            const userHasSkill = cv.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase());
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg glass-surface">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-3 ${userHasSkill ? 'bg-accent-light' : 'bg-[#ff6b6b]'}`} />
                  <span className="font-medium text-text-primary">{skill.name}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    skill.category === 'technical' ? 'tag-accent' :
                    skill.category === 'soft' ? 'tag-success' :
                    'tag-purple'
                  }`}>
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <span className="mr-2">{skill.mentions} mentions</span>
                  {userHasSkill ? (
                    <CheckCircle className="w-4 h-4 text-accent-light" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#ff6b6b]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {analysis!.experienceRequirements.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-text-primary mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-[#fbbf24]" />
            Experience Requirements
          </h4>
          <div className="space-y-2">
            {analysis!.experienceRequirements.map((req, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg glass-surface">
                <span className="font-medium text-text-primary">{req.value}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  req.importance === 'required' ? 'tag-error' : 'tag-warning'
                }`}>
                  {req.importance}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSuggestionsTab = () => (
    <div className="space-y-4">
      {analysis!.suggestions.map((suggestion, index) => {
        const suggestionKey = `${suggestion.type}-${suggestion.title}`;
        const isApplied = appliedSuggestions.has(suggestionKey);

        return (
          <Card key={index} className={`p-4 ${
            suggestion.priority === 'high' ? 'glass-error' :
            suggestion.priority === 'medium' ? 'glass-warning' :
            'glass-surface'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h5 className="font-medium text-text-primary">{suggestion.title}</h5>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    suggestion.priority === 'high' ? 'tag-error' :
                    suggestion.priority === 'medium' ? 'tag-warning' :
                    'tag-neutral'
                  }`}>
                    {suggestion.priority} priority
                  </span>
                  {isApplied && (
                    <span className="ml-2 px-2 py-1 text-xs tag-success rounded-full">
                      Applied
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-2">{suggestion.description}</p>
                <p className="text-xs text-text-muted">{suggestion.action}</p>

                {suggestion.specifics && (
                  <div className="mt-3 space-y-2">
                    {suggestion.specifics.skillsToAdd && (
                      <div>
                        <span className="text-xs font-medium text-text-primary">Skills to add: </span>
                        <span className="text-xs text-text-secondary">{suggestion.specifics.skillsToAdd.join(', ')}</span>
                      </div>
                    )}
                    {suggestion.specifics.keywordsToInclude && (
                      <div>
                        <span className="text-xs font-medium text-text-primary">Keywords: </span>
                        <span className="text-xs text-text-secondary">{suggestion.specifics.keywordsToInclude.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-4 text-right">
                <div className="text-sm font-medium text-text-primary">+{suggestion.impact}%</div>
                <div className="text-xs text-text-muted">Impact</div>
              </div>
            </div>
            <Button
              onClick={() => applyOptimization(suggestion)}
              disabled={isApplied}
              variant={isApplied ? "outline" : "primary"}
              size="sm"
              className="mt-3"
            >
              {isApplied ? (
                <div>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Applied
                </div>
              ) : (
                <div>
                  <Zap className="w-3 h-3 mr-1" />
                  Apply Suggestion
                </div>
              )}
            </Button>
          </Card>
        );
      })}
    </div>
  );

  const renderGapsTab = () => (
    <div className="space-y-4">
      {analysis!.competencyGaps.length === 0 ? (
        <Card className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-accent-light mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Major Competency Gaps!</h3>
          <p className="text-text-secondary">Your skills align well with the job requirements.</p>
        </Card>
      ) : (
        analysis!.competencyGaps.map((gap, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-medium text-text-primary">{gap.skill}</h5>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  gap.category === 'technical' ? 'tag-info' :
                  gap.category === 'soft' ? 'tag-success' :
                  'tag-purple'
                }`}>
                  {gap.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">
                  {gap.currentLevel}/{gap.requiredLevel}
                </div>
                <div className="text-xs text-text-muted">Skill Level</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Current Level</span>
                <span>Required Level</span>
              </div>
              <div className="w-full bg-secondary-dark rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <h6 className="text-sm font-medium text-text-primary mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-1 text-[#fbbf24]" />
                Improvement Recommendations
              </h6>
              <ul className="space-y-1">
                {gap.recommendations.map((rec, recIndex) => (
                  <li key={recIndex} className="text-xs text-text-secondary flex items-start">
                    <ArrowRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-text-muted" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderKeywordsTab = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold text-text-primary mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-accent" />
          Important Keywords ({analysis!.keywords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {analysis!.keywords.map((keyword, index) => {
            const isInSummary = cv.personalInfo.summary?.toLowerCase().includes(keyword.toLowerCase());
            return (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  isInSummary
                    ? 'tag-success'
                    : 'tag-neutral'
                }`}
              >
                {keyword}
                {isInSummary && ' ✓'}
              </span>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold text-text-primary mb-3 flex items-center">
          <Star className="w-4 h-4 mr-2 text-[#fbbf24]" />
          Optional Skills ({analysis!.optionalSkills.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {analysis!.optionalSkills.map((skill, index) => {
            const userHasSkill = cv.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase());
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded glass-surface">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${userHasSkill ? 'bg-accent-light' : 'bg-text-muted'}`} />
                  <span className="text-sm text-text-primary">{skill.name}</span>
                  <span className={`ml-2 px-1 py-0.5 text-xs rounded ${
                    skill.importance === 'important' ? 'tag-warning' : 'tag-neutral'
                  }`}>
                    {skill.importance}
                  </span>
                </div>
                <span className="text-xs text-text-muted">{skill.mentions}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center">
          <Target className="w-6 h-6 mr-2 text-accent" />
          Enhanced Job-Specific CV Optimizer
        </h2>
        <p className="text-text-secondary">
          Advanced AI-powered analysis to optimize your CV for specific job positions with detailed insights and recommendations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full px-3 py-2 glass-input rounded-md focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Meta, Microsoft"
              className="w-full px-3 py-2 glass-input rounded-md focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Job Description
          </label>
          <TextArea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here for detailed analysis..."
            rows={8}
            fullWidth
          />
        </div>

        <Button
          onClick={analyzeJobDescription}
          disabled={isAnalyzing}
          variant="primary"
          className="w-full flex items-center justify-center"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <div className="flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Analyze & Optimize CV
            </div>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="mt-8 space-y-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {[{ id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
                { id: 'gaps', label: 'Skill Gaps', icon: TrendingUp },
                { id: 'keywords', label: 'Keywords', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-light'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.id === 'suggestions' && analysis.suggestions.length > 0 && (
                    <span className="ml-2 tag-error text-xs px-2 py-0.5 rounded-full">
                      {analysis.suggestions.length}
                    </span>
                  )}
                  {tab.id === 'gaps' && analysis.competencyGaps.length > 0 && (
                    <span className="ml-2 tag-warning text-xs px-2 py-0.5 rounded-full">
                      {analysis.competencyGaps.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'suggestions' && renderSuggestionsTab()}
            {activeTab === 'gaps' && renderGapsTab()}
            {activeTab === 'keywords' && renderKeywordsTab()}
          </div>

          <div className="flex justify-center pt-6 border-t border-border">
            <Button
              onClick={createOptimizedVersion}
              variant="primary"
              className="flex items-center"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Create Optimized CV Version
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedJobOptimizer;
