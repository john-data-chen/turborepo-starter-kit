import { routing } from '@/i18n/routing'
import { ClientProviders } from '@/providers/client-providers'
import '@/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Roboto } from 'next/font/google'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap'
})

interface Props {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function LocaleLayout({ children, params }: Readonly<Props>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={roboto.className} suppressHydrationWarning>
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            {children}
            <Analytics />
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
