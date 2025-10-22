import type React from 'react';
import { useState, useEffect } from 'react';
import { getSkillSuggestions, getTrendingSkills, type SkillSuggestion } from '../../utils/skillsDatabase';
import { EnhancedSkillsService, type EnhancedSkillSuggestion, type SkillsAnalysis } from '../../utils/enhancedSkillsService';
import { useCVStore } from '../../store/cvStore';

interface SkillsSuggestionsProps {
  onAddSkill: (skillName: string) => void;
  existingSkills: string[];
  jobTitle?: string;
  showEnhanced?: boolean;
}

const SkillsSuggestions: React.FC<SkillsSuggestionsProps> = ({
  onAddSkill,
  existingSkills,
  jobTitle = '',
  showEnhanced = true
}) => {
  const { cv } = useCVStore();
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<EnhancedSkillSuggestion[]>([]);
  const [skillsAnalysis, setSkillsAnalysis] = useState<SkillsAnalysis | null>(null);
  const [trendingSkills, setTrendingSkills] = useState<SkillSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'role' | 'trending' | 'analysis'>('role');

  useEffect(() => {
    // Get basic skill suggestions
    const jobBasedSuggestions = getSkillSuggestions(jobTitle, existingSkills, 15);
    setSuggestions(jobBasedSuggestions);

    // Get trending skills
    const trending = getTrendingSkills(10);
    setTrendingSkills(trending.filter(skill =>
      !existingSkills.some(existing =>
        existing.toLowerCase() === skill.name.toLowerCase()
      )
    ));

    // Get enhanced analysis if showEnhanced is true
    if (showEnhanced && cv) {
      const analysis = EnhancedSkillsService.analyzeCurrentSkills(cv);
      setSkillsAnalysis(analysis);
      setEnhancedSuggestions(analysis.recommendations.slice(0, 15));
    }
  }, [jobTitle, existingSkills, showEnhanced, cv]);

  const handleAddSkill = (skill: SkillSuggestion | EnhancedSkillSuggestion) => {
    onAddSkill(skill.name);
  };

  const getDisplayedSkills = () => {
    switch (activeTab) {
      case 'trending':
        return trendingSkills;
      case 'analysis':
        return enhancedSuggestions;
      default:
        return suggestions;
    }
  };

  const displayedSkills = getDisplayedSkills();

  if (displayedSkills.length === 0) {
    return null;
  }

  const getMarketDemandBadge = (skill: EnhancedSkillSuggestion) => {
    if (!('marketDemand' in skill)) return null;

    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[skill.marketDemand]}`}>
        {skill.marketDemand}
      </span>
    );
  };

  const getDifficultyBadge = (skill: EnhancedSkillSuggestion) => {
    if (!('learningDifficulty' in skill)) return null;

    const colors = {
      easy: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      hard: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[skill.learningDifficulty]}`}>
        {skill.learningDifficulty}
      </span>
    );
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-blue-900">
          Skill Suggestions
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('role')}
            className={`text-xs px-2 py-1 rounded ${
              activeTab === 'role'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-300'
            }`}
          >
            For Your Role
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`text-xs px-2 py-1 rounded ${
              activeTab === 'trending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-300'
            }`}
          >
            Trending
          </button>
          {showEnhanced && (
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className={`text-xs px-2 py-1 rounded ${
                activeTab === 'analysis'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-300'
              }`}
            >
              Smart Suggestions
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-blue-700 mb-3">
        {activeTab === 'trending'
          ? 'Popular skills in high demand across industries'
          : activeTab === 'analysis'
            ? 'AI-powered recommendations based on market demand and your current skills'
            : jobTitle
              ? `Recommended skills for ${jobTitle} roles`
              : 'Recommended skills to enhance your profile'
        }
      </p>

      {/* Skills Analysis Summary */}
      {activeTab === 'analysis' && skillsAnalysis && (
        <div className="mb-4 p-3 bg-white rounded border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-blue-900">Foundation:</span>
              <span className={`ml-2 px-2 py-1 rounded ${
                skillsAnalysis.hasStrongFoundation
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {skillsAnalysis.hasStrongFoundation ? 'Strong' : 'Needs Work'}
              </span>
            </div>
            {skillsAnalysis.competitiveAdvantage.length > 0 && (
              <div>
                <span className="font-medium text-blue-900">Advantage:</span>
                <span className="ml-2 text-green-700">
                  {skillsAnalysis.competitiveAdvantage[0]}
                </span>
              </div>
            )}
          </div>

          {skillsAnalysis.missingCritical.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="font-medium text-red-700">Missing Critical:</span>
              <span className="ml-2 text-red-600">
                {skillsAnalysis.missingCritical.slice(0, 3).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {displayedSkills.map((skill, index) => (
          <div key={`${skill.name}-${index}`} className="relative group">
            <button
              type="button"
              onClick={() => handleAddSkill(skill)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-300 rounded-full text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors"
              title={`Add ${skill.name} to your skills`}
            >
              <span>+</span>
              <span>{skill.name}</span>
              {skill.trending && (
                <span className="text-orange-500 text-xs font-bold">*</span>
              )}
              {'matchScore' in skill && skill.matchScore >= 8 && (
                <span className="text-green-600 text-xs font-bold">★</span>
              )}
            </button>

            {/* Enhanced tooltip for enhanced suggestions */}
            {activeTab === 'analysis' && 'marketDemand' in skill && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div className="flex gap-2">
                    {getMarketDemandBadge(skill as EnhancedSkillSuggestion)}
                    {getDifficultyBadge(skill as EnhancedSkillSuggestion)}
                  </div>
                  {(skill as EnhancedSkillSuggestion).certificationAvailable && (
                    <div className="mt-1 text-blue-200">Certification available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-blue-600">
        <div className="flex flex-wrap gap-4">
          <span>
            <span className="font-medium">Tip:</span> Click any skill to add it to your CV.
          </span>
          <span>
            <span className="text-orange-500 font-bold">*</span> = Trending
          </span>
          {activeTab === 'analysis' && (
            <span>
              <span className="text-green-600 font-bold">★</span> = High match score
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsSuggestions;
