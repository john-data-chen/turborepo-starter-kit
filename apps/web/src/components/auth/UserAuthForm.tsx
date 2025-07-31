'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { defaultEmail } from '@/constants/demoData';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address')
});

export default function UserAuthForm() {
  const { login, isLoading: _isLoading, error: _error } = useAuth();
  const t = useTranslations('login');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values.email);
    } catch (err) {
      // Error is already handled by the useAuth hook
      console.error('Login error:', err);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-2"
        aria-label="Sign in form"
        data-testid="auth-form"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('emailLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  disabled={_isLoading}
                  data-testid="email-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={_isLoading}
          data-testid="submit-button"
        >
          {_isLoading ? (
            <div className="h-4 w-4 animate-spin" />
          ) : (
            t('continueButton')
          )}
        </Button>
      </form>
    </Form>
  );
}
