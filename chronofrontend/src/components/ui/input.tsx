'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const inputClasses = clsx(
      'w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-white placeholder-gray-400 focus:outline-none',
      {
        'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200': error,
        'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200': !error,
        'pl-11': leftIcon,
        'pr-11': rightIcon || isPassword,
      },
      className
    );

    const containerClasses = clsx(
      'relative',
      fullWidth ? 'w-full' : 'w-auto'
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium mb-2 transition-colors duration-200',
              error ? 'text-red-700' : 'text-gray-700',
              isFocused && !error && 'text-primary-600'
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={clsx(
                'text-gray-400 transition-colors duration-200',
                isFocused && !error && 'text-primary-500'
              )}>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={inputClasses}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <span className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={clsx(
                'text-gray-400 transition-colors duration-200',
                isFocused && !error && 'text-primary-500'
              )}>
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-red-600 animate-slide-up">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;



