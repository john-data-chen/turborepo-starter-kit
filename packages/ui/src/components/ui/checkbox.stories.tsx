import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered'
  },

  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked.'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled.'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    checked: false,
    disabled: false
  }
}

export const Checked: Story = {
  args: {
    checked: true,
    disabled: false
  }
}

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true
  }
}

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true
  }
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" {...args} />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
  args: {
    checked: false,
    disabled: false
  }
}
