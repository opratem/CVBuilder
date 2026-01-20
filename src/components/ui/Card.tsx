import type React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const hoverClasses = hover
    ? 'hover:shadow-glow-lg hover:border-accent hover:-translate-y-2 transition-all duration-300 hover-lift'
    : 'transition-all duration-200';

  return (
    <div className={`glass-card rounded-lg md:rounded-xl p-4 md:p-6 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
