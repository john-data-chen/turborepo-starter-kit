"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@repo/ui";
import { useTranslations } from "next-intl";
import React from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";

import { defaultEmail } from "@/constants/demoData";
import { useAuthForm } from "@/hooks/useAuth";

const formSchema = z.object({
  email: z.string().email("Invalid email address")
});

export default function UserAuthForm() {
  const { handleSubmit, isLoading, error, isNavigating } = useAuthForm();
  const t = useTranslations("login");

  // Map backend error messages to i18n keys
  const getErrorMessage = (error: string | null): string | null => {
    if (!error) {
      return null;
    }
    if (error.includes("The login email is incorrect")) {
      return t("invalidEmail");
    }
    return error;
  };

  const displayError = getErrorMessage(error);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await handleSubmit(values.email);
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
          render={({
            field
          }: {
            field: ControllerRenderProps<z.infer<typeof formSchema>, "email">;
          }) => (
            <FormItem>
              <FormLabel>{t("emailLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  disabled={isLoading || isNavigating}
                  data-testid="email-input"
                  className="h-10 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {displayError && (
          <div className="mt-2 text-sm text-red-600" data-testid="error-message">
            {displayError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isNavigating}
          data-testid="submit-button"
        >
          {isLoading || isNavigating ? (
            <div className="h-4 w-4 animate-spin" />
          ) : (
            t("continueButton")
          )}
        </Button>
      </form>
    </Form>
  );
}
