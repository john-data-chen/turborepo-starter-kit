import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered'
  },

  argTypes: {
    htmlFor: {
      control: 'text',
      description: 'The ID of the form element the label is associated with.'
    },
    children: {
      control: 'text',
      description: 'The content of the label.'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Your Name',
    htmlFor: 'name'
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Label {...args} />
      <Input id="name" type="text" placeholder="Enter your name" />
    </div>
  )
}

export const WithDisabledInput: Story = {
  args: {
    children: 'Disabled Field',
    htmlFor: 'disabled-field'
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Label {...args} />
      <Input id="disabled-field" type="text" placeholder="This is disabled" disabled />
    </div>
  )
}
