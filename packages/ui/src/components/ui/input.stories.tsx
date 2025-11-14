import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search']
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    placeholder: 'Enter text...'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'text'
  }
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com'
  }
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Password'
  }
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '123'
  }
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...'
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input'
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Email
      </label>
      <Input type="email" placeholder="email@example.com" />
    </div>
  )
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
    </div>
  )
}
