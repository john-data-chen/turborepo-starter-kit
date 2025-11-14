import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the textarea.'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled.'
    },
    value: {
      control: 'text',
      description: 'The current value of the textarea.'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.'
  }
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <label htmlFor="message">Your message</label>
      <Textarea placeholder="Type your message here." id="message" {...args} />
    </div>
  ),
  args: {
    placeholder: 'Type your message here.'
  }
}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'This is a default message.'
  }
}

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled.',
    disabled: true
  }
}
