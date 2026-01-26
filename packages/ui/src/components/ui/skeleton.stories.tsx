import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered'
  },

  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling.'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args: ComponentProps<typeof Skeleton>) => <Skeleton className="h-[20px] w-[200px]" {...args} />
}

export const Circle: Story = {
  render: (args: ComponentProps<typeof Skeleton>) => <Skeleton className="h-12 w-12 rounded-full" {...args} />
}

export const Card: Story = {
  render: (_args: ComponentProps<typeof Skeleton>) => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
