import { j as e, c as u } from './utils-Cg71Lysi.js'
function r({ className: i, type: c, ...m }) {
  return e.jsx('input', {
    type: c,
    'data-slot': 'input',
    className: u(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      i
    ),
    ...m
  })
}
r.__docgenInfo = { description: '', methods: [], displayName: 'Input' }
const h = {
    title: 'UI/Input',
    component: r,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
      type: { control: 'select', options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'] },
      disabled: { control: 'boolean' }
    },
    args: { placeholder: 'Enter text...' }
  },
  a = { args: { type: 'text' } },
  s = { args: { type: 'email', placeholder: 'email@example.com' } },
  t = { args: { type: 'password', placeholder: 'Password' } },
  o = { args: { type: 'number', placeholder: '123' } },
  l = { args: { type: 'search', placeholder: 'Search...' } },
  n = { args: { disabled: !0, placeholder: 'Disabled input' } },
  p = {
    render: () =>
      e.jsxs('div', {
        className: 'grid w-full max-w-sm items-center gap-1.5',
        children: [
          e.jsx('label', {
            className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            children: 'Email'
          }),
          e.jsx(r, { type: 'email', placeholder: 'email@example.com' })
        ]
      })
  },
  d = {
    render: () =>
      e.jsxs('div', {
        className: 'grid w-full max-w-sm gap-4',
        children: [
          e.jsx(r, { type: 'text', placeholder: 'Text input' }),
          e.jsx(r, { type: 'email', placeholder: 'Email input' }),
          e.jsx(r, { type: 'password', placeholder: 'Password input' }),
          e.jsx(r, { type: 'number', placeholder: 'Number input' }),
          e.jsx(r, { type: 'search', placeholder: 'Search input' })
        ]
      })
  }
a.parameters = {
  ...a.parameters,
  docs: {
    ...a.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    type: 'text'
  }
}`,
      ...a.parameters?.docs?.source
    }
  }
}
s.parameters = {
  ...s.parameters,
  docs: {
    ...s.parameters?.docs,
    source: {
      originalSource: `{
  args: {
    type: 'email',
    placeholder: 'email@example.com'
  }
}`,
      ...s.parameters?.docs?.source
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
    type: 'password',
    placeholder: 'Password'
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
    type: 'number',
    placeholder: '123'
  }
}`,
      ...o.parameters?.docs?.source
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
    type: 'search',
    placeholder: 'Search...'
  }
}`,
      ...l.parameters?.docs?.source
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
    disabled: true,
    placeholder: 'Disabled input'
  }
}`,
      ...n.parameters?.docs?.source
    }
  }
}
p.parameters = {
  ...p.parameters,
  docs: {
    ...p.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="grid w-full max-w-sm items-center gap-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Email
      </label>
      <Input type="email" placeholder="email@example.com" />
    </div>
}`,
      ...p.parameters?.docs?.source
    }
  }
}
d.parameters = {
  ...d.parameters,
  docs: {
    ...d.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="grid w-full max-w-sm gap-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
    </div>
}`,
      ...d.parameters?.docs?.source
    }
  }
}
const b = ['Default', 'Email', 'Password', 'Number', 'Search', 'Disabled', 'WithLabel', 'AllVariants']
export {
  d as AllVariants,
  a as Default,
  n as Disabled,
  s as Email,
  o as Number,
  t as Password,
  l as Search,
  p as WithLabel,
  b as __namedExportsOrder,
  h as default
}
