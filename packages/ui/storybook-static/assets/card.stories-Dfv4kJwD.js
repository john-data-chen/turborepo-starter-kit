import { j as e, c as a } from './utils-Cg71Lysi.js'
import { B as d } from './button-DfUCyaSU.js'
import './index-CNRqX-28.js'
import './iframe-l6Qa-wLU.js'
import './preload-helper-PPVm8Dsz.js'
function n({ className: r, ...t }) {
  return e.jsx('div', {
    'data-slot': 'card',
    className: a('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', r),
    ...t
  })
}
function u({ className: r, ...t }) {
  return e.jsx('div', {
    'data-slot': 'card-header',
    className: a(
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
      r
    ),
    ...t
  })
}
function o({ className: r, ...t }) {
  return e.jsx('div', { 'data-slot': 'card-title', className: a('leading-none font-semibold', r), ...t })
}
function i({ className: r, ...t }) {
  return e.jsx('div', { 'data-slot': 'card-description', className: a('text-muted-foreground text-sm', r), ...t })
}
function h({ className: r, ...t }) {
  return e.jsx('div', {
    'data-slot': 'card-action',
    className: a('col-start-2 row-span-2 row-start-1 self-start justify-self-end', r),
    ...t
  })
}
function s({ className: r, ...t }) {
  return e.jsx('div', { 'data-slot': 'card-content', className: a('px-6', r), ...t })
}
function C({ className: r, ...t }) {
  return e.jsx('div', { 'data-slot': 'card-footer', className: a('flex items-center px-6 [.border-t]:pt-6', r), ...t })
}
n.__docgenInfo = { description: '', methods: [], displayName: 'Card' }
u.__docgenInfo = { description: '', methods: [], displayName: 'CardHeader' }
C.__docgenInfo = { description: '', methods: [], displayName: 'CardFooter' }
o.__docgenInfo = { description: '', methods: [], displayName: 'CardTitle' }
h.__docgenInfo = { description: '', methods: [], displayName: 'CardAction' }
i.__docgenInfo = { description: '', methods: [], displayName: 'CardDescription' }
s.__docgenInfo = { description: '', methods: [], displayName: 'CardContent' }
const b = {
    title: 'UI/Card',
    component: n,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: { className: { control: 'text' } }
  },
  c = {
    render: () =>
      e.jsxs(n, {
        className: 'w-[350px]',
        children: [
          e.jsxs(u, {
            children: [e.jsx(o, { children: 'Card Title' }), e.jsx(i, { children: 'Card description goes here' })]
          }),
          e.jsx(s, { children: e.jsx('p', { children: 'Card content area with some text' }) }),
          e.jsx(C, { children: e.jsx(d, { children: 'Action' }) })
        ]
      })
  },
  l = {
    render: () =>
      e.jsxs(n, {
        className: 'w-[350px]',
        children: [
          e.jsxs(u, {
            children: [
              e.jsx(o, { children: 'Advanced Card' }),
              e.jsx(i, { children: 'Card with actions and content' }),
              e.jsx(h, { children: e.jsx(d, { variant: 'outline', size: 'sm', children: 'Edit' }) })
            ]
          }),
          e.jsxs(s, {
            children: [
              e.jsx('p', { children: 'This card includes a title, description, content, and action buttons.' }),
              e.jsx('p', {
                className: 'text-sm text-muted-foreground mt-2',
                children: 'It demonstrates the full structure of a card component.'
              })
            ]
          }),
          e.jsxs(C, {
            children: [
              e.jsx(d, { children: 'Save' }),
              e.jsx(d, { variant: 'outline', className: 'ml-2', children: 'Cancel' })
            ]
          })
        ]
      })
  },
  m = {
    render: () =>
      e.jsx(n, {
        className: 'w-[300px]',
        children: e.jsx(s, { children: e.jsx('p', { children: 'Simple card with just content' }) })
      })
  },
  p = {
    render: () =>
      e.jsxs(n, {
        className: 'w-[350px]',
        children: [
          e.jsxs(u, { children: [e.jsx(o, { children: 'Jane Doe' }), e.jsx(i, { children: 'Software Engineer' })] }),
          e.jsx(s, {
            children: e.jsxs('div', {
              className: 'flex items-center space-x-4',
              children: [
                e.jsx('div', {
                  className: 'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center',
                  children: e.jsx('span', { className: 'text-primary font-semibold', children: 'JD' })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('p', { className: 'text-sm font-medium', children: 'Frontend Developer' }),
                    e.jsx('p', { className: 'text-sm text-muted-foreground', children: 'React, TypeScript, Next.js' })
                  ]
                })
              ]
            })
          })
        ]
      })
  },
  x = {
    render: () =>
      e.jsx(n, {
        className: 'w-[280px]',
        children: e.jsxs(s, {
          className: 'p-0',
          children: [
            e.jsx('div', { className: 'aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl' }),
            e.jsxs('div', {
              className: 'p-6',
              children: [
                e.jsx(o, { className: 'text-lg', children: 'Product Name' }),
                e.jsx(i, { className: 'mt-2', children: 'A brief description of the product features and benefits.' }),
                e.jsxs('div', {
                  className: 'mt-4 flex items-center justify-between',
                  children: [
                    e.jsx('span', { className: 'text-2xl font-bold', children: '$99' }),
                    e.jsx(d, { size: 'sm', children: 'Add to Cart' })
                  ]
                })
              ]
            })
          ]
        })
      })
  }
c.parameters = {
  ...c.parameters,
  docs: {
    ...c.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <Card className="w-[350px]">
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
}`,
      ...c.parameters?.docs?.source
    }
  }
}
l.parameters = {
  ...l.parameters,
  docs: {
    ...l.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <Card className="w-[350px]">
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
        <p className="text-sm text-muted-foreground mt-2">
          It demonstrates the full structure of a card component.
        </p>
      </CardContent>
      <CardFooter>
        <Button>Save</Button>
        <Button variant="outline" className="ml-2">
          Cancel
        </Button>
      </CardFooter>
    </Card>
}`,
      ...l.parameters?.docs?.source
    }
  }
}
m.parameters = {
  ...m.parameters,
  docs: {
    ...m.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <Card className="w-[300px]">
      <CardContent>
        <p>Simple card with just content</p>
      </CardContent>
    </Card>
}`,
      ...m.parameters?.docs?.source
    }
  }
}
p.parameters = {
  ...p.parameters,
  docs: {
    ...p.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <Card className="w-[350px]">
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
}`,
      ...p.parameters?.docs?.source
    }
  }
}
x.parameters = {
  ...x.parameters,
  docs: {
    ...x.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <Card className="w-[280px]">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl"></div>
        <div className="p-6">
          <CardTitle className="text-lg">Product Name</CardTitle>
          <CardDescription className="mt-2">
            A brief description of the product features and benefits.
          </CardDescription>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold">$99</span>
            <Button size="sm">Add to Cart</Button>
          </div>
        </div>
      </CardContent>
    </Card>
}`,
      ...x.parameters?.docs?.source
    }
  }
}
const w = ['Basic', 'WithActions', 'Simple', 'ProfileCard', 'ProductCard']
export {
  c as Basic,
  x as ProductCard,
  p as ProfileCard,
  m as Simple,
  l as WithActions,
  w as __namedExportsOrder,
  b as default
}
