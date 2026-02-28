import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '../components/ui/toast';
import ResponsiveWrapper from '../components/ResponsiveWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chrono-Carto',
  description: 'Plateforme éducative dédiée aux élèves préparant le bac français en Histoire-Géographie. Accédez à des cours, quiz interactifs, et ressources pour réussir votre bac.',
  keywords: 'histoire, géographie, bac, éducation, cours, quiz, EMC, grand oral, parcoursup',
  authors: [{ name: 'Chrono-Carto' }],
  icons: {
    icon: '/images/chrono_carto_logo.png',
    shortcut: '/images/chrono_carto_logo.png',
    apple: '/images/chrono_carto_logo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0369a1' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chrono-Carto',
  },
  formatDetection: {
    telephone: false,
  },
};

import AntiInspect from '../components/AntiInspect';
import FetchInterceptor from '../components/FetchInterceptor';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} bg-slate-900`}>
      <body className="font-sans antialiased bg-slate-900">
        <FetchInterceptor />
        <AntiInspect />
        <ResponsiveWrapper>
          <ToastProvider>
            <div id="root">
              {children}
            </div>
            <div id="modal-root"></div>
          </ToastProvider>
        </ResponsiveWrapper>
      </body>
    </html>
  );
}


