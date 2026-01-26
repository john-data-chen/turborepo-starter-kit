import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './button'

interface StoryContext {
  args: ComponentProps<typeof Button> & { onClick?: () => void }
  canvasElement: HTMLElement
  step: (name: string, fn: () => Promise<void>) => Promise<void>
}

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon']
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    children: 'Button',
    onClick: fn()
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost'
  }
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link'
  }
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small'
  }
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large'
  }
}

export const Icon: Story = {
  args: {
    size: 'icon',
    children: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" x2="21" y1="6" y2="6" />
      </svg>
    )
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled'
  }
}

// 展示所有變體的總覽
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

// 展示所有尺寸的總覽
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" x2="21" y1="6" y2="6" />
        </svg>
      </Button>
    </div>
  )
}

/**
 * Interaction Testing Stories
 * These stories demonstrate component behavior through automated interaction tests
 */

// Test: Button click interaction
export const ClickInteraction: Story = {
  args: {
    variant: 'default',
    children: 'Click Me'
  },
  play: async ({ args, canvasElement, step }: StoryContext) => {
    const button = within(canvasElement).getByRole('button', { name: /click me/i })

    await step('Verify button renders correctly', async () => {
      await expect(button).toBeInTheDocument()
      await expect(button).toBeEnabled()
    })

    await step('Click button and verify callback', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })

    await step('Double click verification', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledTimes(2)
    })
  }
}

// Test: Keyboard navigation
export const KeyboardInteraction: Story = {
  args: {
    variant: 'secondary',
    children: 'Press Enter or Space'
  },
  play: async ({ args, canvasElement, step }: StoryContext) => {
    const button = within(canvasElement).getByRole('button')

    await step('Focus button with Tab key', async () => {
      await userEvent.tab()
      await expect(button).toHaveFocus()
    })

    await step('Trigger with Enter key', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })

    await step('Trigger with Space key', async () => {
      await userEvent.keyboard(' ')
      await expect(args.onClick).toHaveBeenCalledTimes(2)
    })
  }
}

// Test: Disabled state prevents interaction
export const DisabledInteraction: Story = {
  args: {
    variant: 'default',
    disabled: true,
    children: 'Disabled Button'
  },
  play: async ({ args, canvasElement, step }: StoryContext) => {
    const button = within(canvasElement).getByRole('button')

    await step('Verify disabled state', async () => {
      await expect(button).toBeDisabled()
    })

    await step('Attempt click on disabled button', async () => {
      await userEvent.click(button)
      await expect(args.onClick).not.toHaveBeenCalled()
    })
  }
}

// Test: Multiple button variants accessibility
export const VariantsAccessibility: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4" role="group" aria-label="Button variants">
      <Button variant="default">Primary Action</Button>
      <Button variant="secondary">Secondary Action</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  ),
  play: async ({ canvasElement, step }: Omit<StoryContext, 'args'>) => {
    const buttons = within(canvasElement).getAllByRole('button')

    await step('Verify all buttons are accessible', async () => {
      expect(buttons).toHaveLength(4)
      buttons.forEach((button) => {
        expect(button).toBeVisible()
        expect(button).toBeEnabled()
      })
    })

    await step('Verify keyboard navigation through buttons', async () => {
      await userEvent.tab()
      await expect(buttons[0]).toHaveFocus()

      await userEvent.tab()
      await expect(buttons[1]).toHaveFocus()

      await userEvent.tab()
      await expect(buttons[2]).toHaveFocus()

      await userEvent.tab()
      await expect(buttons[3]).toHaveFocus()
    })
  }
}
