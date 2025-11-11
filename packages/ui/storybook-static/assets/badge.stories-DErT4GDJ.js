import { j as e, c as v } from './utils-Cg71Lysi.js'
import { S as p, c as g } from './index-CNRqX-28.js'
import './iframe-l6Qa-wLU.js'
import './preload-helper-PPVm8Dsz.js'
const m = g(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)
function r({ className: i, variant: d, asChild: c = !1, ...u }) {
  const l = c ? p : 'span'
  return e.jsx(l, { 'data-slot': 'badge', className: v(m({ variant: d }), i), ...u })
}
r.__docgenInfo = {
  description: '',
  methods: [],
  displayName: 'Badge',
  props: {
    asChild: {
      required: !1,
      tsType: { name: 'boolean' },
      description: '',
      defaultValue: { value: 'false', computed: !1 }
    }
  }
}
const h = {
    title: 'UI/Badge',
    component: r,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: { variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] } },
    args: { children: 'Badge' }
  },
  a = { args: { variant: 'default' } },
  t = { args: { variant: 'secondary' } },
  s = { args: { variant: 'destructive' } },
  n = { args: { variant: 'outline' } },
  o = {
    render: () =>
      e.jsxs('div', {
        className: 'flex flex-wrap gap-2',
        children: [
          e.jsx(r, { children: 'Default' }),
          e.jsx(r, { variant: 'secondary', children: 'Secondary' }),
          e.jsx(r, { variant: 'destructive', children: 'Destructive' }),
          e.jsx(r, { variant: 'outline', children: 'Outline' })
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
    variant: 'default'
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
    variant: 'secondary'
  }
}`,
      ...t.parameters?.docs?.source
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
    variant: 'destructive'
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
    variant: 'outline'
  }
}`,
      ...n.parameters?.docs?.source
    }
  }
}
o.parameters = {
  ...o.parameters,
  docs: {
    ...o.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
}`,
      ...o.parameters?.docs?.source
    }
  }
}
const B = ['Default', 'Secondary', 'Destructive', 'Outline', 'AllVariants']
export {
  o as AllVariants,
  a as Default,
  s as Destructive,
  n as Outline,
  t as Secondary,
  B as __namedExportsOrder,
  h as default
}
