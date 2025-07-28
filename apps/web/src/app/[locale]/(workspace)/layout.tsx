import RootWrapper from '@/components/layout/RootWrapper';
import { AuthService } from '@/lib/auth/nest-auth';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AppLayout(props: Readonly<AppLayoutProps>) {
  const { children, params } = props;
  const { locale } = params;
  const cookie = (await headers()).get('cookie') || '';

  // Server-side session validation
  let isAuthenticated = false;
  try {
    const session = await AuthService.validateSession(cookie);
    isAuthenticated = !!session;
  } catch (error) {
    console.error('Session validation error:', error);
  }

  const t = await getTranslations({ locale, namespace: 'sidebar' });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  );
}
