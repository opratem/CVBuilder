import type React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:border-accent/50 hover:-translate-y-1 transition-all duration-300'
    : '';

  return (
    <div className={`bg-surface-elevated rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;