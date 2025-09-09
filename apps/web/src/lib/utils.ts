import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLocalePath = (path: string, locale: string | string[] | undefined) => {
  const currentLocale = Array.isArray(locale) ? locale[0] : locale
  if (currentLocale) {
    return `/${currentLocale}${path}`
  }
  // Fallback to the path without locale if it's not present
  return path
}
