import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content area with some text</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  )
}

export const WithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Advanced Card</CardTitle>
        <CardDescription>Card with actions and content</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>This card includes a title, description, content, and action buttons.</p>
        <p className="text-sm text-muted-foreground mt-2">It demonstrates the full structure of a card component.</p>
      </CardContent>
      <CardFooter>
        <Button>Save</Button>
        <Button variant="outline" className="ml-2">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent>
        <p>Simple card with just content</p>
      </CardContent>
    </Card>
  )
}

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Jane Doe</CardTitle>
        <CardDescription>Software Engineer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Frontend Developer</p>
            <p className="text-sm text-muted-foreground">React, TypeScript, Next.js</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[280px]">
      <CardContent className="p-0">
        <div className="aspect-video bg-linear-to-br from-blue-500 to-purple-600 rounded-t-xl" />
        <div className="p-6">
          <CardTitle className="text-lg">Product Name</CardTitle>
          <CardDescription className="mt-2">A brief description of the product features and benefits.</CardDescription>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold">$99</span>
            <Button size="sm">Add to Cart</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
