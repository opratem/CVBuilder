import React from 'react';
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
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
        <h3 className="text-sm font-semibold text-gray-800">CV Completion</h3>
        <span className="text-xs text-gray-500">
          {completedRequiredSteps}/{requiredSteps.length} required sections
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="text-center mb-3">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progressPercentage)}% Complete
        </span>
        {completedRequiredSteps === requiredSteps.length && (
          <div className="flex items-center justify-center mt-1">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs text-green-600">Ready to export!</span>
          </div>
        )}
      </div>

      {/* Step List */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            {step.completed ? (
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            ) : step.required ? (
              <AlertCircle className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
            )}
            <span className={`text-xs ${
              step.completed ? 'text-green-700' :
              step.required ? 'text-gray-700 font-medium' : 'text-gray-500'
            }`}>
              {step.label}
              {step.required && !step.completed && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
