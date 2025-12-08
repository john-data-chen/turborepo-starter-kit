import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered'
  },

  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator.'
    },
    decorative: {
      control: 'boolean',
      description: 'Whether the separator is purely decorative.'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Radix Primitives</h4>
        <p className="text-muted-foreground text-sm">An open-source UI component library.</p>
      </div>
      <Separator className="my-4" {...args} />
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Next.js</h4>
        <p className="text-muted-foreground text-sm">The React Framework for the Web.</p>
      </div>
    </div>
  )
}

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Blog</div>
      <Separator orientation="vertical" {...args} />
      <div>Docs</div>
      <Separator orientation="vertical" {...args} />
      <div>Source</div>
    </div>
  )
}

export const InNavigation: Story = {
  render: (args) => (
    <nav className="flex items-center space-x-4">
      <a href="#" className="text-sm">
        Home
      </a>
      <Separator orientation="vertical" className="h-4" {...args} />
      <a href="#" className="text-sm">
        About
      </a>
      <Separator orientation="vertical" className="h-4" {...args} />
      <a href="#" className="text-sm">
        Contact
      </a>
    </nav>
  )
}
