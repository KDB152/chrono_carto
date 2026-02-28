
'use client';

import React, { useState } from 'react';
import { Search, Bell, User, Settings, Sun, Moon, Menu } from 'lucide-react';

interface UniversalTopBarProps {
  type: 'admin' | 'parent' | 'student';
  title: string;
  onMenuToggle?: () => void;
  userData?: any;
  darkMode?: boolean;
  onThemeToggle?: () => void;
}

const UniversalTopBar: React.FC<UniversalTopBarProps> = ({
  type,
  title,
  onMenuToggle,
  userData,
  darkMode = false,
  onThemeToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  const themeClasses = {
    admin: 'bg-white/10 backdrop-blur-md border-b border-white/20',
    parent: 'bg-green-600/90 backdrop-blur-md border-b border-green-500/20',
    student: 'bg-blue-600/90 backdrop-blur-md border-b border-blue-500/20'
  };

  return (
    <div className={`sticky top-0 z-40 ${themeClasses[type]} px-6 py-4`}>
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>

        {/* Center - Search removed per request */}
        <div className="flex-1 max-w-md mx-8" />

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {userData && (
              <span className="text-white text-sm font-medium">
                {userData.name || 'Utilisateur'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalTopBar;
