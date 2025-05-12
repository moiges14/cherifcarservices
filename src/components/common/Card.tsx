import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  padding = 'md',
  border = false,
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'transition-transform duration-200 hover:shadow-md hover:scale-[1.02]' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm
        ${paddingClasses[padding]}
        ${borderClass}
        ${hoverClass}
        ${cursorClass}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;