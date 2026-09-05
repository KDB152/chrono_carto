'use client';

import React from 'react';
import AdminDashboard from './AdminDashboard';

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Composant AdminDashboard complet */}
      <div className="flex-1 overflow-y-auto">
        <AdminDashboard />
      </div>

    </div>
  );
};

export default AdminPage;


