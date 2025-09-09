'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const BoardFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional()
})

type BoardFormValues = z.infer<typeof BoardFormSchema>

interface BoardFormProps {
  defaultValues?: Partial<BoardFormValues>
  onSubmit: (values: BoardFormValues) => Promise<void>
  children?: React.ReactNode
}

export function BoardForm({ defaultValues, onSubmit, children }: BoardFormProps) {
  const t = useTranslations('kanban.actions')
  const form = useForm<BoardFormValues>({
    resolver: zodResolver(BoardFormSchema),
    defaultValues: {
      title: '',
      description: '',
      ...defaultValues
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('boardTitleLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('boardTitlePlaceholder')}
                  {...field}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('descriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('descriptionPlaceholder')}
                  className="resize-none"
                  {...field}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  )
}
