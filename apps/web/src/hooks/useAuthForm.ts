'use client';

import { defaultEmail } from '@/constants/demoData';
import { ROUTES } from '@/constants/routes';
import { NAVIGATION_DELAY_MS } from '@/constants/ui';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';
import { useTaskStore } from '@/lib/workspace-store';
import { SignInFormValue, SignInValidation } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AuthFormState {
  message?: string;
  status: 'error' | 'success' | 'idle' | 'loading';
}

export default function useAuthForm() {
  const [isNavigating, startNavigationTransition] = useTransition();
  const { setUserInfo } = useTaskStore();
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<AuthFormState>({ status: 'idle' });
  const t = useTranslations('login');
  const { login } = useAuthStore();

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    console.log('Form submitted with data:', data);

    try {
      console.log('Attempting to login with email:', data.email);
      const loginPromise = login(data.email);
      console.log('Login promise created, showing toast...');

      toast.promise(loginPromise, {
        success: (result) => {
          console.log('Login successful, result:', result);
          const navigationDelay = NAVIGATION_DELAY_MS;
          const locale = (params.locale as string) || 'en';
          const targetPath = `${ROUTES.BOARDS.ROOT}?login_success=true`;

          console.log(`Will navigate to ${targetPath} in ${navigationDelay}ms`);

          setTimeout(() => {
            console.log('Starting navigation transition...');
            startNavigationTransition(() => {
              console.log('Navigation transition started, pushing route...');
              router.push(targetPath, { locale });
              console.log('Route push complete');
            });
          }, navigationDelay);

          console.log('Setting user info in store...');
          setUserInfo(data.email);
          console.log('User info set in store');
          return t('authSuccessRedirect');
        },
        error: (err) => {
          console.error('Login failed with error:', err);
          console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
          });
          setStatus({
            status: 'error',
            message: err.message
          });
          return err.message || t('login_failed');
        }
      });
    } catch (error) {
      console.error('Unexpected error in onSubmit:', error);
      toast.error('An unexpected error occurred');
      setStatus({
        status: 'error',
        message: 'An unexpected error occurred'
      });
    }
  };

  return {
    form,
    loading: isNavigating,
    onSubmit,
    status
  };
}
