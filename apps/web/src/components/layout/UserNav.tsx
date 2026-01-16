"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@repo/ui/components/dropdown-menu";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";

export function UserNav() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const t = useTranslations("user");

  // While loading, show a placeholder to prevent flicker
  if (isLoading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />;
  }

  // If the user is logged in, show the avatar and dropdown menu
  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              {/* The new backend doesn't provide an image, so we use a fallback */}
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{user.email?.split("@")[0]}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>{t("logOut")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
