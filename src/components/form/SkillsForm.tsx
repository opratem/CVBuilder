import type React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import SkillsSuggestions from '../ui/SkillsSuggestions';
import { Code, Plus, Trash2 } from 'lucide-react';

const SkillsForm: React.FC = () => {
  const { cv, addSkill, updateSkill, removeSkill } = useCVStore();
  const { skills, personalInfo } = cv;

  const handleAddSkill = () => {
    addSkill({ name: '', level: 3 });
  };

  const handleAddSuggestedSkill = (skillName: string) => {
    // Check if skill already exists
    const existsAlready = skills.some(skill =>
      skill.name.toLowerCase() === skillName.toLowerCase()
    );

    if (!existsAlready) {
      addSkill({ name: skillName, level: 3 });
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkill(skillId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Skills</h2>
        <Tooltip content="Add your technical and soft skills. This helps ATS systems and recruiters understand your capabilities.">
          <div className="w-4 h-4 rounded-full bg-secondary-light text-text-muted text-xs flex items-center justify-center cursor-help">
            ?
          </div>
        </Tooltip>
      </div>

      {/* Skills Suggestions */}
      <SkillsSuggestions
        onAddSkill={handleAddSuggestedSkill}
        existingSkills={skills.map(skill => skill.name)}
        jobTitle={personalInfo.jobTitle}
        showEnhanced={true}
      />

      {/* Skills List */}
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div key={skill.id} className="p-4 border border-border rounded-lg bg-surface-elevated">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  label="Skill Name"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                  placeholder="e.g., JavaScript, Project Management, Communication"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveSkill(skill.id)}
                className="btn-danger-dark mb-0.5"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Skill Button */}
      <Button
        onClick={handleAddSkill}
        variant="outline"
        className="w-full flex items-center justify-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Skill
      </Button>

      {/* Skills Tips */}
      {skills.length === 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Tips for Skills Section:</h3>
          <ul className="text-sm text-text-primary space-y-1 list-disc list-inside">
            <li>Include both technical skills (programming languages, tools) and soft skills (communication, leadership)</li>
            <li>Be honest about your skill levels - it helps with job matching</li>
            <li>Add skills that are specifically mentioned in job descriptions you're targeting</li>
            <li>Keep skills current and remove outdated ones</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkillsForm;
