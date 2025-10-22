import React from 'react';
import { Check, Save, AlertCircle, Loader2 } from 'lucide-react';

interface SaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ status, className = '' }) => {
  if (status === 'idle') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: 'Saved',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-300 animate-fadeIn ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      {config.icon}
      <span className="ml-2">{config.text}</span>
    </div>
  );
};

export default SaveStatus;
