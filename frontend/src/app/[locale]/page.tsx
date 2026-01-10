import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HomeContent from '@/components/organisms/HomeContent';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  
  return {
    title: t('title'),
    description: 'Banque AVENIR offre des solutions bancaires complètes.',
  };
}

export default function LocaleHome() {
  return <HomeContent />;
}

