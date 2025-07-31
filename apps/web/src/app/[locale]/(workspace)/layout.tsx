import { isAuthenticated } from '@/actions/auth';
import RootWrapper from '@/components/layout/RootWrapper';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AppLayout({
  children,
  params
}: Readonly<AppLayoutProps>) {
  // Get the current locale
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: 'sidebar' });

  // Check if user is authenticated
  const { isAuthenticated: isUserAuthenticated } = await isAuthenticated();

  // If not authenticated, redirect to login
  if (!isUserAuthenticated) {
    redirect(`/${locale}/login`);
  }

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  );
}
