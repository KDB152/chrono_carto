'use client';

import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  sidebarOpen = false,
  sidebarCollapsed = false
}) => {
  return (
    <div className={`min-h-screen ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  isOpen,
  className = ''
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
      isOpen ? 'sidebar-responsive' : 'sidebar-collapsed'
    } ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveContentProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  className?: string;
}

export const ResponsiveContent: React.FC<ResponsiveContentProps> = ({
  children,
  sidebarOpen,
  className = ''
}) => {
  return (
    <div className={`transition-all duration-300 ${
      sidebarOpen ? 'content-expanded' : 'content-responsive'
    } flex flex-col min-h-screen ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`container-responsive ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  minWidth = '280px'
}) => {
  return (
    <div 
      className={`grid-responsive ${className}`}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))` }}
    >
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'base',
  className = ''
}) => {
  const sizeClass = `text-responsive-${size}`;
  return (
    <span className={`${sizeClass} ${className}`}>
      {children}
    </span>
  );
};

interface ResponsiveSpacingProps {
  children: React.ReactNode;
  type?: 'padding' | 'margin';
  direction?: 'all' | 'x' | 'y';
  className?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  type = 'padding',
  direction = 'all',
  className = ''
}) => {
  const spacingClass = type === 'padding' 
    ? (direction === 'all' ? 'p-responsive' : direction === 'x' ? 'px-responsive' : 'py-responsive')
    : (direction === 'all' ? 'm-responsive' : direction === 'x' ? 'mx-responsive' : 'my-responsive');
  
  return (
    <div className={`${spacingClass} ${className}`}>
      {children}
    </div>
  );
};
