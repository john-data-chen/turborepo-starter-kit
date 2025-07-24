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
import useAuthForm from '@/hooks/useAuthForm';
import { useTranslations } from 'next-intl';

export default function UserAuthForm() {
  const { form, loading, onSubmit } = useAuthForm();
  const t = useTranslations('login');

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
                  disabled={loading}
                  data-testid="email-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={loading}
          className="ml-auto w-full"
          type="submit"
          data-testid="submit-button"
        >
          {t('continueButton')}
        </Button>
      </form>
    </Form>
  );
}
