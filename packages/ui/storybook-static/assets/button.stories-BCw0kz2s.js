import { j as e } from './utils-Cg71Lysi.js'
import { B as r } from './button-DfUCyaSU.js'
import './index-CNRqX-28.js'
import './iframe-l6Qa-wLU.js'
import './preload-helper-PPVm8Dsz.js'
const w = {
    title: 'UI/Button',
    component: r,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
      variant: { control: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
      size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
      disabled: { control: 'boolean' }
    },
    args: { children: 'Button' }
  },
  s = { args: { variant: 'default', size: 'default' } },
  n = { args: { variant: 'secondary', children: 'Secondary' } },
  a = { args: { variant: 'destructive', children: 'Delete' } },
  t = { args: { variant: 'outline', children: 'Outline' } },
  o = { args: { variant: 'ghost', children: 'Ghost' } },
  i = { args: { variant: 'link', children: 'Link' } },
  c = { args: { size: 'sm', children: 'Small' } },
  l = { args: { size: 'lg', children: 'Large' } },
  d = {
    args: {
      size: 'icon',
      children: e.jsxs('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        children: [
          e.jsx('path', { d: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' }),
          e.jsx('line', { x1: '3', x2: '21', y1: '6', y2: '6' })
        ]
      })
    }
  },
  u = { args: { disabled: !0, children: 'Disabled' } },
  m = {
    render: () =>
      e.jsxs('div', {
        className: 'flex flex-wrap gap-4',
        children: [
          e.jsx(r, { children: 'Default' }),
          e.jsx(r, { variant: 'secondary', children: 'Secondary' }),
          e.jsx(r, { variant: 'destructive', children: 'Destructive' }),
          e.jsx(r, { variant: 'outline', children: 'Outline' }),
          e.jsx(r, { variant: 'ghost', children: 'Ghost' }),
          e.jsx(r, { variant: 'link', children: 'Link' })
        ]
      })
  },
  p = {
    render: () =>
      e.jsxs('div', {
        className: 'flex flex-wrap items-center gap-4',
        children: [
          e.jsx(r, { size: 'sm', children: 'Small' }),
          e.jsx(r, { size: 'default', children: 'Default' }),
          e.jsx(r, { size: 'lg', children: 'Large' }),
          e.jsx(r, {
            size: 'icon',
            children: e.jsxs('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '24',
              height: '24',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              children: [
                e.jsx('path', { d: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' }),
                e.jsx('line', { x1: '3', x2: '21', y1: '6', y2: '6' })
              ]
            })
          })
        ]
      })
  }
s.parameters = {
  ...s.parameters,
  docs: {
    ...s.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    variant: 'default',
    size: 'default'
  }
}`,
      ...s.parameters?.docs?.source
    }
  }
}
n.parameters = {
  ...n.parameters,
  docs: {
    ...n.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    variant: 'secondary',
    children: 'Secondary'
  }
}`,
      ...n.parameters?.docs?.source
    }
  }
}
a.parameters = {
  ...a.parameters,
  docs: {
    ...a.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
}`,
      ...a.parameters?.docs?.source
    }
  }
}
t.parameters = {
  ...t.parameters,
  docs: {
    ...t.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}`,
      ...t.parameters?.docs?.source
    }
  }
}
o.parameters = {
  ...o.parameters,
  docs: {
    ...o.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    variant: 'ghost',
    children: 'Ghost'
  }
}`,
      ...o.parameters?.docs?.source
    }
  }
}
i.parameters = {
  ...i.parameters,
  docs: {
    ...i.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    variant: 'link',
    children: 'Link'
  }
}`,
      ...i.parameters?.docs?.source
    }
  }
}
c.parameters = {
  ...c.parameters,
  docs: {
    ...c.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    size: 'sm',
    children: 'Small'
  }
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
  args: {
    size: 'lg',
    children: 'Large'
  }
}`,
      ...l.parameters?.docs?.source
    }
  }
}
d.parameters = {
  ...d.parameters,
  docs: {
    ...d.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    size: 'icon',
    children: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" x2="21" y1="6" y2="6" />
      </svg>
  }
}`,
      ...d.parameters?.docs?.source
    }
  }
}
u.parameters = {
  ...u.parameters,
  docs: {
    ...u.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    disabled: true,
    children: 'Disabled'
  }
}`,
      ...u.parameters?.docs?.source
    }
  }
}
m.parameters = {
  ...m.parameters,
  docs: {
    ...m.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
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
  render: () => <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" x2="21" y1="6" y2="6" />
        </svg>
      </Button>
    </div>
}`,
      ...p.parameters?.docs?.source
    }
  }
}
const B = [
  'Default',
  'Secondary',
  'Destructive',
  'Outline',
  'Ghost',
  'Link',
  'Small',
  'Large',
  'Icon',
  'Disabled',
  'AllVariants',
  'AllSizes'
]
export {
  p as AllSizes,
  m as AllVariants,
  s as Default,
  a as Destructive,
  u as Disabled,
  o as Ghost,
  d as Icon,
  l as Large,
  i as Link,
  t as Outline,
  n as Secondary,
  c as Small,
  B as __namedExportsOrder,
  w as default
}
