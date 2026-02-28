'use client';

import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-xl overflow-hidden transition-all duration-300';

    const variantClasses = {
      default: 'bg-white shadow-soft border border-gray-100',
      outlined: 'bg-white border-2 border-gray-200',
      elevated: 'bg-white shadow-medium',
      glass: 'glass-effect shadow-soft',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const hoverClasses = hover
      ? 'hover:shadow-strong hover:-translate-y-1 cursor-pointer'
      : '';

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      hoverClasses,
      className
    );

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divider = false, children, ...props }, ref) => {
    const classes = clsx(
      'flex flex-col space-y-1.5',
      divider && 'pb-4 border-b border-gray-200',
      className
    );

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    const classes = clsx('flex-1', className);

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divider = false, children, ...props }, ref) => {
    const classes = clsx(
      'flex items-center',
      divider && 'pt-4 border-t border-gray-200',
      className
    );

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx('font-heading text-2xl font-semibold leading-none tracking-tight text-gray-900', className)}
    {...props}
  >
    {children}
  </h3>
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-sm text-gray-600 leading-relaxed', className)}
    {...props}
  >
    {children}
  </p>
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription };



