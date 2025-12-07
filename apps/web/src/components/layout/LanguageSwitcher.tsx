'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Button } from '@repo/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@repo/ui/components/dropdown-menu'
import { useParams } from 'next/navigation'

export default function LanguageSwitcher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as 'en' | 'de'

  const handleLanguageChange = (nextLocale: 'en' | 'de') => {
    // The pathname from the hook can be inconsistent, sometimes including the
    // locale and sometimes not. To ensure we always have a clean base path,
    // we derive it from the reliable `params.locale`.
    const currentLocale = params.locale as string
    const basePath = pathname.startsWith(`/${currentLocale}`)
      ? pathname.substring(currentLocale.length + 1)
      : pathname

    startTransition(() => {
      router.replace(basePath || '/', { locale: nextLocale })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          {locale?.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('de')}>Deutsch</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
