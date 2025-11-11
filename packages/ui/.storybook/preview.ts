import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      // 這個元素是為了確保 Storybook 容器有適當的最小高度
      element: '#storybook-root',
      manual: false
    },
    themes: {
      default: 'light',
      list: [
        {
          name: 'light',
          class: 'light',
          color: '#ffffff'
        },
        {
          name: 'dark',
          class: 'dark',
          color: '#0f172a'
        }
      ]
    }
  }
}

export default preview
