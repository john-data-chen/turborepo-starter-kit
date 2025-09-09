import { DEBOUNCE_DELAY_MS } from '@/constants/common'
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || DEBOUNCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
