import type React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface-elevated rounded-lg shadow-xl border border-secondary-light p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
