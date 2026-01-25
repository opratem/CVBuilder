import type React from 'react';
import { Check, Loader2, AlertCircle, Cloud, CloudOff } from 'lucide-react';

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
          glassClass: 'glass-info',
          textColor: 'text-blue-400'
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: 'Saved',
          glassClass: 'glass-success',
          textColor: 'text-emerald-400'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          glassClass: 'glass-error',
          textColor: 'text-red-400'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 animate-fadeIn ${config.glassClass} ${config.textColor} ${className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

export default SaveStatus;
