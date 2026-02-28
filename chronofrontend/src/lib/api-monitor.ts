// Système de monitoring des APIs
interface ApiCall {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  success?: boolean;
  error?: string;
}

interface ApiStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  slowestCall?: ApiCall;
  fastestCall?: ApiCall;
  callsByEndpoint: Map<string, number>;
  recentCalls: ApiCall[];
}

class ApiMonitor {
  private calls: ApiCall[] = [];
  private maxCalls = 1000; // Garder seulement les 1000 dernières appels
  private slowThreshold = 1000; // Seuil pour les appels lents (ms)

  startCall(url: string, method: string = 'GET'): string {
    const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const call: ApiCall = {
      url,
      method,
      startTime: Date.now()
    };
    
    this.calls.push(call);
    
    // Nettoyer les anciens appels
    if (this.calls.length > this.maxCalls) {
      this.calls = this.calls.slice(-this.maxCalls);
    }
    
    return callId;
  }

  endCall(callId: string, status: number, error?: string): void {
    const call = this.calls.find(c => c.url.includes(callId.split('-')[0]));
    if (call) {
      call.endTime = Date.now();
      call.duration = call.endTime - call.startTime;
      call.status = status;
      call.success = status >= 200 && status < 300;
      call.error = error;
    }
  }

  getStats(): ApiStats {
    const completedCalls = this.calls.filter(c => c.duration !== undefined);
    const successfulCalls = completedCalls.filter(c => c.success);
    const failedCalls = completedCalls.filter(c => !c.success);
    
    const totalDuration = completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageDuration = completedCalls.length > 0 ? totalDuration / completedCalls.length : 0;
    
    const slowestCall = completedCalls.reduce((slowest, current) => 
      !slowest || (current.duration || 0) > (slowest.duration || 0) ? current : slowest, 
      undefined as ApiCall | undefined
    );
    
    const fastestCall = completedCalls.reduce((fastest, current) => 
      !fastest || (current.duration || 0) < (fastest.duration || 0) ? current : fastest, 
      undefined as ApiCall | undefined
    );
    
    const callsByEndpoint = new Map<string, number>();
    completedCalls.forEach(call => {
      const endpoint = `${call.method} ${call.url}`;
      callsByEndpoint.set(endpoint, (callsByEndpoint.get(endpoint) || 0) + 1);
    });
    
    return {
      totalCalls: completedCalls.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      averageDuration: Math.round(averageDuration),
      slowestCall,
      fastestCall,
      callsByEndpoint,
      recentCalls: completedCalls.slice(-10) // 10 derniers appels
    };
  }

  getSlowCalls(threshold?: number): ApiCall[] {
    const limit = threshold || this.slowThreshold;
    return this.calls.filter(c => c.duration && c.duration > limit);
  }

  getCallsByEndpoint(endpoint: string): ApiCall[] {
    return this.calls.filter(c => c.url.includes(endpoint));
  }

  getErrorRate(): number {
    const completedCalls = this.calls.filter(c => c.duration !== undefined);
    if (completedCalls.length === 0) return 0;
    return (completedCalls.filter(c => !c.success).length / completedCalls.length) * 100;
  }

  clear(): void {
    this.calls = [];
  }

  // Fonction pour logger les appels dans la console
  logStats(): void {
    const stats = this.getStats();
    console.group('📊 API Monitor Stats');
    console.log(`Total calls: ${stats.totalCalls}`);
    console.log(`Success rate: ${((stats.successfulCalls / stats.totalCalls) * 100).toFixed(1)}%`);
    console.log(`Average duration: ${stats.averageDuration}ms`);
    console.log(`Error rate: ${this.getErrorRate().toFixed(1)}%`);
    
    if (stats.slowestCall) {
      console.log(`Slowest call: ${stats.slowestCall.method} ${stats.slowestCall.url} (${stats.slowestCall.duration}ms)`);
    }
    
    if (stats.fastestCall) {
      console.log(`Fastest call: ${stats.fastestCall.method} ${stats.fastestCall.url} (${stats.fastestCall.duration}ms)`);
    }
    
    console.log('Recent calls:');
    stats.recentCalls.forEach(call => {
      const status = call.success ? '✅' : '❌';
      console.log(`  ${status} ${call.method} ${call.url} (${call.duration}ms)`);
    });
    
    console.groupEnd();
  }
}

// Instance globale du monitor
export const apiMonitor = new ApiMonitor();

// Hook React pour utiliser le monitor
export const useApiMonitor = () => {
  const getStats = () => apiMonitor.getStats();
  const getSlowCalls = (threshold?: number) => apiMonitor.getSlowCalls(threshold);
  const getErrorRate = () => apiMonitor.getErrorRate();
  const clear = () => apiMonitor.clear();
  const logStats = () => apiMonitor.logStats();

  return {
    getStats,
    getSlowCalls,
    getErrorRate,
    clear,
    logStats
  };
};

// Fonction utilitaire pour wrapper les appels fetch
export const monitoredFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const callId = apiMonitor.startCall(url, options.method || 'GET');
  
  try {
    const response = await fetch(url, options);
    apiMonitor.endCall(callId, response.status);
    return response;
  } catch (error) {
    apiMonitor.endCall(callId, 0, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};
