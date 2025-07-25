'use client';

import { defaultEmail } from '@/constants/demoData';
import { ROUTES } from '@/constants/routes';
import { NAVIGATION_DELAY_MS } from '@/constants/ui';
import { useRouter } from '@/i18n/navigation';
import { useTaskStore } from '@/lib/store';
import { SignInFormValue, SignInValidation } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
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

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    const signInProcessPromise = async () => {
      const result = await signIn('credentials', {
        email: data.email,
        redirect: false
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          throw new Error('Invalid email, retry again.');
        }
        throw new Error(result.error || 'Authentication failed.');
      }
      setUserInfo(data.email);
    };

    toast.promise(signInProcessPromise(), {
      loading: 'Authenticating...',
      success: () => {
        const navigationDelay = NAVIGATION_DELAY_MS;
        const locale = (params.locale as string) || 'en';
        const targetPath = `${ROUTES.BOARDS.ROOT}?login_success=true`;

        setTimeout(() => {
          startNavigationTransition(() => {
            // Provide the base path and the target locale separately.
            // The router will construct the correct path (e.g., /de/boards).
            router.push(targetPath, { locale });
          });
        }, navigationDelay);

        return t('authSuccessRedirect');
      },
      error: (err: Error) => {
        console.error('Sign-in promise error:', err);
        setStatus({ status: 'error', message: err.message });
        return err.message || 'An unknown authentication error occurred.';
      }
    });
  };

  return {
    form,
    loading: isNavigating,
    onSubmit,
    status
  };
}
