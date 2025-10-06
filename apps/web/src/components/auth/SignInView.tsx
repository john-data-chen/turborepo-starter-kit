'use client'

import { Presentation } from 'lucide-react'
import { useTranslations } from 'next-intl'
import UserAuthForm from './UserAuthForm'

export default function SignInViewPage() {
  const t = useTranslations('login')
  return (
    <main
      aria-label="Sign in page"
      className="relative grid min-h-screen grid-rows-2 md:grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 lg:px-0"
    >
      <div className="bg-muted relative flex h-full flex-col p-10 text-white dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Presentation className="mr-2 h-6 w-6" />
          {t('title')}
        </div>
      </div>
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{t('description')}</h1>
            <p className="text-muted-foreground text-sm">{t('formHint')}</p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </main>
  )
}
