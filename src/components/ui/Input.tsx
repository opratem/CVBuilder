import type React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const baseClasses = 'px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base rounded-lg border border-border bg-surface-input text-text-primary shadow-sm focus:border-accent focus:ring-accent focus:ring-2 focus:shadow-glow-sm placeholder-text-muted transition-all duration-200 form-input';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-3 md:mb-4`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm md:text-base font-medium text-text-secondary mb-1.5 md:mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseClasses} ${errorClasses} ${widthClass} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
