import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent-hover text-white focus:ring-accent shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    purple: 'bg-gradient-to-r from-purple via-purple-dark to-purple-darker hover:from-purple-light hover:via-purple hover:to-purple-dark text-white focus:ring-purple shadow-lg hover:shadow-xl hover:shadow-purple/50 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-secondary hover:bg-secondary-light text-white focus:ring-secondary shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    outline: 'bg-transparent border-2 border-secondary-light hover:border-accent hover:bg-accent/10 text-gray-200 hover:text-white focus:ring-accent hover:scale-[1.02] active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-5 py-2.5',
    lg: 'text-lg px-6 py-3.5',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;