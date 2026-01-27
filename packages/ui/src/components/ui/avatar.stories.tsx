import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered'
  },

  argTypes: {
    children: {
      control: {
        type: 'object'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args: ComponentProps<typeof Avatar>) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}

export const Fallback: Story = {
  render: (args: ComponentProps<typeof Avatar>) => (
    <Avatar {...args}>
      <AvatarImage src="https://thissitedoesnotexist.com/image.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}
