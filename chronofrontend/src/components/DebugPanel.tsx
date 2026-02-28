'use client';

import React, { useState, useEffect } from 'react';
import { useApiMonitor } from '@/lib/api-monitor';
import { apiCache } from '@/lib/api-cache';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const { getStats, getSlowCalls, getErrorRate, clear, logStats } = useApiMonitor();
  const [stats, setStats] = useState(getStats());
  const [slowCalls, setSlowCalls] = useState(getSlowCalls());
  const [cacheStats, setCacheStats] = useState(apiCache.getStats());

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setStats(getStats());
      setSlowCalls(getSlowCalls());
      setCacheStats(apiCache.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, getStats, getSlowCalls]);

  if (!isOpen) return null;

  const errorRate = getErrorRate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">🔧 Panel de Debug - Chrono Carto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📊 Total Calls</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalCalls}</p>
              <p className="text-sm text-blue-600">Appels API</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Success Rate</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalCalls > 0 ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-green-600">Taux de réussite</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error Rate</h3>
              <p className="text-3xl font-bold text-red-600">{errorRate.toFixed(1)}%</p>
              <p className="text-sm text-red-600">Taux d'erreur</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">⏱️ Avg Duration</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.averageDuration}ms</p>
              <p className="text-sm text-yellow-600">Durée moyenne</p>
            </div>
          </div>

          {/* Cache Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">💾 Cache Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-1">Cache Size</h4>
                <p className="text-2xl font-bold text-gray-600">{cacheStats.size}/{cacheStats.maxSize}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(cacheStats.size / cacheStats.maxSize) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-1">Hit Rate</h4>
                <p className="text-2xl font-bold text-gray-600">{cacheStats.hitRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Cache hits</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-1">Max Size</h4>
                <p className="text-2xl font-bold text-gray-600">{cacheStats.maxSize}</p>
                <p className="text-xs text-gray-500">Limite</p>
              </div>
            </div>
          </div>

          {/* Appels lents */}
          {slowCalls.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">🐌 Slow Calls (>1000ms)</h3>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                {slowCalls.map((call, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-red-200 last:border-b-0">
                    <div className="flex-1">
                      <span className="font-mono text-sm bg-red-100 px-2 py-1 rounded">{call.method}</span>
                      <span className="ml-2 text-sm text-gray-600 truncate">{call.url}</span>
                    </div>
                    <div className="text-red-600 font-semibold text-lg">{call.duration}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appels récents */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🕒 Recent Calls</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-200">
              {stats.recentCalls.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent calls</p>
              ) : (
                stats.recentCalls.map((call, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center flex-1">
                      <span className={`w-3 h-3 rounded-full mr-3 ${call.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-2">{call.method}</span>
                      <span className="text-sm text-gray-600 truncate flex-1">{call.url}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${call.duration && call.duration > 1000 ? 'text-red-600' : 'text-gray-600'}`}>
                        {call.duration}ms
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{call.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                logStats();
                console.log('Cache stats:', cacheStats);
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              📝 Log to Console
            </button>
            <button
              onClick={() => {
                clear();
                apiCache.invalidate();
                setStats(getStats());
                setSlowCalls(getSlowCalls());
                setCacheStats(apiCache.getStats());
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              🗑️ Clear All Data
            </button>
            <button
              onClick={() => {
                apiCache.invalidate();
                setCacheStats(apiCache.getStats());
              }}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              💾 Clear Cache
            </button>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
