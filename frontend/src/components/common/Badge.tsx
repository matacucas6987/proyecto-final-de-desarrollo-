import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const variantStyles = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    danger: 'bg-rose-100 text-rose-800 border-rose-300',
    info: 'bg-sky-100 text-sky-800 border-sky-300',
    neutral: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
