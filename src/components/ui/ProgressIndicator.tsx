import type React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, className = '' }) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;

  return (
    <div className={`glass-card rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
        <h3 className="text-sm font-semibold text-text-primary">CV Completion</h3>
        <span className="text-xs text-text-muted">
          {completedRequiredSteps}/{requiredSteps.length} required sections
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary-dark rounded-full h-2 mb-3">
        <div
          className="bg-gradient-to-r from-accent-dark to-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="text-center mb-3">
        <span className="text-sm font-medium text-text-primary">
          {Math.round(progressPercentage)}% Complete
        </span>
        {completedRequiredSteps === requiredSteps.length && (
          <div className="flex items-center justify-center mt-1">
            <CheckCircle className="w-4 h-4 text-accent mr-1" />
            <span className="text-xs text-accent-light">Ready to export!</span>
          </div>
        )}
      </div>

      {/* Step List */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            {step.completed ? (
              <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
            ) : step.required ? (
              <AlertCircle className="w-4 h-4 text-accent-dark mr-2 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
            )}
            <span className={`text-xs ${
              step.completed ? 'text-accent-light' :
              step.required ? 'text-text-primary font-medium' : 'text-text-muted'
            }`}>
              {step.label}
              {step.required && !step.completed && <span className="text-accent ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
