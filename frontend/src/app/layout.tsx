import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Banque AVENIR - Votre partenaire financier',
    template: '%s | Banque AVENIR',
  },
  description: 'Solutions bancaires, investissement en actions, crédits personnalisés et conseils d\'experts. Banque AVENIR, votre partenaire financier de confiance.',
  keywords: ['banque', 'investissement', 'actions', 'crédit', 'épargne', 'conseil financier'],
  authors: [{ name: 'Banque AVENIR' }],
  creator: 'Banque AVENIR',
  publisher: 'Banque AVENIR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  openGraph: {
    title: 'Banque AVENIR',
    description: 'Votre partenaire financier de confiance',
    url: '/',
    siteName: 'Banque AVENIR',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Banque AVENIR',
    description: 'Votre partenaire financier de confiance',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${lexend.variable}`}>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
