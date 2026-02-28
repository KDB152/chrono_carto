
'use client';

import React, { useState } from 'react';
import { Menu, X, User, LogOut, Settings, Search, Bell } from 'lucide-react';

interface UniversalSidebarProps {
  type: 'admin' | 'parent' | 'student';
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userData?: any;
}

const UniversalSidebar: React.FC<UniversalSidebarProps> = ({
  type,
  isCollapsed,
  onToggle,
  activeTab,
  onTabChange,
  userData
}) => {
  const navigationConfig = {
    admin: {
      title: 'Chrono-Carto',
      subtitle: 'Administration',
      items: [
        { id: 'overview', label: 'Vue d'ensemble', icon: 'BarChart3' },
        { id: 'users', label: 'Utilisateurs', icon: 'Users' },
        { id: 'quizzes', label: 'Quiz', icon: 'BookOpen' },
        { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
        { id: 'rendez-vous', label: 'Rendez-vous', icon: 'Calendar' },
        { id: 'attendance', label: 'Présence', icon: 'Clock' },
        { id: 'payments', label: 'Paiements', icon: 'CreditCard' },
        { id: 'files', label: 'Fichiers', icon: 'FileText' },
        { id: 'profile', label: 'Profil', icon: 'User' }
      ]
    },
    parent: {
      title: 'Chrono-Carto',
      subtitle: 'Parent',
      items: [
        { id: 'overview', label: 'Vue d'ensemble', icon: 'Home' },
        { id: 'children-progress', label: 'Progression', icon: 'TrendingUp' },
        { id: 'quiz-results', label: 'Résultats Quiz', icon: 'FileText' },
        { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
        { id: 'calendar', label: 'Calendrier', icon: 'Calendar' },
        { id: 'meetings', label: 'Rendez-vous', icon: 'Users' },
        { id: 'payments', label: 'Paiements', icon: 'CreditCard' },
        { id: 'profile', label: 'Profil', icon: 'User' }
      ]
    },
    student: {
      title: 'Chrono-Carto',
      subtitle: 'Espace Étudiant',
      items: [
        { id: 'home', label: 'Accueil', icon: 'Home' },
        { id: 'quizzes', label: 'Quiz', icon: 'BookOpen' },
        { id: 'quiz-take', label: 'Passer Quiz', icon: 'PenTool' },
        { id: 'results', label: 'Résultats', icon: 'BarChart3' },
        { id: 'progress', label: 'Progression', icon: 'TrendingUp' },
        { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
        { id: 'profile', label: 'Profil', icon: 'User' },
        { id: 'achievements', label: 'Récompenses', icon: 'Award' },
        { id: 'calendar', label: 'Calendrier', icon: 'Calendar' },
        { id: 'resources', label: 'Ressources', icon: 'Library' }
      ]
    }
  };

  const config = navigationConfig[type];
  const themeClasses = {
    admin: 'bg-blue-900/80 backdrop-blur-xl border-r border-blue-700/50',
    parent: 'bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-xl',
    student: 'bg-blue-900/80 backdrop-blur-xl border-r border-blue-700/50'
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      <div className={`h-full ${themeClasses[type]} flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-blue-100">{config.title}</h1>
                <p className="text-blue-300 text-sm">{config.subtitle}</p>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 text-blue-200 hover:text-blue-100 hover:bg-blue-800/50 rounded-lg transition-all"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {config.items.map((item) => {
            const IconComponent = require('lucide-react')[item.icon];
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:bg-blue-800/50 hover:text-blue-100'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        {!isCollapsed && userData && (
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-100">
                  {userData.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-blue-300">
                  {userData.email || 'email@example.com'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalSidebar;
