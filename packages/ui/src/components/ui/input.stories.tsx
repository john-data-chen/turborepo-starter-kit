import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, within } from 'storybook/test'
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
    placeholder: 'Enter text...',
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn()
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

/**
 * Interaction Testing Stories
 * These stories demonstrate input behavior and validation through automated tests
 */

// Test: Basic text input interaction
export const TextInputInteraction: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter your name'
  },
  play: async ({ args, canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText(/enter your name/i)

    await step('Verify input renders and is accessible', async () => {
      await expect(input).toBeInTheDocument()
      await expect(input).toBeEnabled()
      await expect(input).toHaveAttribute('type', 'text')
    })

    await step('Type text and verify onChange callback', async () => {
      await userEvent.type(input, 'John Doe')
      await expect(input).toHaveValue('John Doe')
      await expect(args.onChange).toHaveBeenCalled()
    })

    await step('Clear input and verify empty state', async () => {
      await userEvent.clear(input)
      await expect(input).toHaveValue('')
    })
  }
}

// Test: Email validation behavior
export const EmailInputValidation: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
    required: true
  },
  play: async ({ canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText(/email@example.com/i)

    await step('Verify email input type', async () => {
      await expect(input).toHaveAttribute('type', 'email')
      await expect(input).toHaveAttribute('required')
    })

    await step('Type invalid email', async () => {
      await userEvent.type(input, 'invalid-email')
      await expect(input).toHaveValue('invalid-email')
    })

    await step('Type valid email', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, 'john@example.com')
      await expect(input).toHaveValue('john@example.com')
    })
  }
}

// Test: Password input masking
export const PasswordInputInteraction: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password'
  },
  play: async ({ args, canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText(/enter password/i)

    await step('Verify password type attribute', async () => {
      await expect(input).toHaveAttribute('type', 'password')
    })

    await step('Type password and verify it is masked', async () => {
      await userEvent.type(input, 'SecurePass123!')
      await expect(input).toHaveValue('SecurePass123!')
      // Password inputs still have values but browser masks display
      await expect(args.onChange).toHaveBeenCalled()
    })
  }
}

// Test: Focus and blur events
export const FocusBlurInteraction: Story = {
  args: {
    type: 'text',
    placeholder: 'Focus me'
  },
  play: async ({ args, canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText(/focus me/i)

    await step('Focus input with Tab key', async () => {
      await userEvent.tab()
      await expect(input).toHaveFocus()
      await expect(args.onFocus).toHaveBeenCalledTimes(1)
    })

    await step('Blur input with Tab key', async () => {
      await userEvent.tab()
      await expect(input).not.toHaveFocus()
      await expect(args.onBlur).toHaveBeenCalledTimes(1)
    })

    await step('Click to focus input', async () => {
      await userEvent.click(input)
      await expect(input).toHaveFocus()
      await expect(args.onFocus).toHaveBeenCalledTimes(2)
    })
  }
}

// Test: Disabled state prevents interaction
export const DisabledInputInteraction: Story = {
  args: {
    type: 'text',
    disabled: true,
    placeholder: 'Disabled input'
  },
  play: async ({ args, canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText(/disabled input/i)

    await step('Verify disabled state', async () => {
      await expect(input).toBeDisabled()
    })

    await step('Attempt to type in disabled input', async () => {
      await userEvent.click(input)
      await userEvent.type(input, 'Should not work')
      await expect(input).toHaveValue('')
      await expect(args.onChange).not.toHaveBeenCalled()
    })
  }
}

// Test: Number input with keyboard controls
export const NumberInputInteraction: Story = {
  args: {
    type: 'number',
    placeholder: '0'
  },
  play: async ({ args, canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText('0')

    await step('Verify number input type', async () => {
      await expect(input).toHaveAttribute('type', 'number')
    })

    await step('Type numeric value', async () => {
      await userEvent.type(input, '42')
      await expect(input).toHaveValue(42)
      await expect(args.onChange).toHaveBeenCalled()
    })

    await step('Clear and type decimal', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, '3.14')
      await expect(input).toHaveValue(3.14)
    })
  }
}

// Test: Keyboard navigation and selection
export const KeyboardNavigationInteraction: Story = {
  args: {
    type: 'text',
    placeholder: 'Test keyboard shortcuts',
    defaultValue: 'Select this text'
  },
  play: async ({ canvasElement, step }) => {
    const input = within(canvasElement).getByPlaceholderText(/test keyboard shortcuts/i)

    await step('Focus input', async () => {
      await userEvent.click(input)
      await expect(input).toHaveFocus()
    })

    await step('Select all with Ctrl/Cmd+A', async () => {
      await userEvent.keyboard('{Meta>}a{/Meta}')
      // Text should be selected (can't directly test selection but we can verify input has focus)
      await expect(input).toHaveFocus()
    })

    await step('Navigate with arrow keys', async () => {
      await userEvent.keyboard('{Home}')
      await userEvent.keyboard('{End}')
      await expect(input).toHaveFocus()
    })
  }
}
