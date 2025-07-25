'use client';

import { defaultEmail } from '@/constants/demoData';
import { ROUTES } from '@/constants/routes';
import { NAVIGATION_DELAY_MS } from '@/constants/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { useTaskStore } from '@/lib/store';
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
  const { login } = useAuth();

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    const loginPromise = login(data.email);

    toast.promise(loginPromise, {
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

        setUserInfo(data.email);
        return t('authSuccessRedirect');
      },
      error: (err) => {
        console.error('Login failed:', err);
        setStatus({ status: 'error', message: err.message });
        return err.message || t('login_failed');
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
