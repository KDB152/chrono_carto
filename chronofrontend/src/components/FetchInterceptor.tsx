'use client';
import { useEffect } from 'react';

export default function FetchInterceptor() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const originalFetch = window.fetch;
            window.fetch = async function (...args) {
                let resource = args[0];
                let config = args[1] || {};

                const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : '');

                // Inject token for backend or local Next.js API calls
                if (url.includes(':3001') || url.includes('/api') || url.includes('chronocarto.tn') || url.startsWith('/')) {
                    const token = localStorage.getItem('token');
                    if (token) {
                        // @ts-ignore
                        config.headers = { ...config.headers };

                        // Check if Authorization header already exists (ignoring case)
                        // @ts-ignore
                        const hasAuth = Object.keys(config.headers).some(key => key.toLowerCase() === 'authorization');

                        if (!hasAuth) {
                            // @ts-ignore
                            config.headers['Authorization'] = `Bearer ${token}`;
                        }
                    }
                }

                args[1] = config;
                // @ts-ignore
                return originalFetch.apply(this, args);
            };

            return () => {
                window.fetch = originalFetch;
            };
        }
    }, []);

    return null;
}
