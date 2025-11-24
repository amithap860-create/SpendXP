import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'sm';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'normal', ...props }) => {
  const baseClasses = 'font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-green text-white hover:bg-emerald-600',
    secondary: 'bg-brand-blue-light text-brand-text-secondary hover:bg-blue-900',
  };

  const sizeClasses = {
    normal: 'px-4 py-2',
    sm: 'px-3 py-1 text-sm'
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;