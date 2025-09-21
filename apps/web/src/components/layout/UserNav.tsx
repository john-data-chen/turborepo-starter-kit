'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@repo/ui/components/dropdown-menu'
import { useTranslations } from 'next-intl'

export function UserNav() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const t = useTranslations('user')

  // While loading, show a placeholder to prevent flicker
  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
  }

  // If the user is logged in, show the avatar and dropdown menu
  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* The new backend doesn't provide an image, so we use a fallback */}
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{user.email?.split('@')[0]}</p>
              <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>{t('logOut')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}
