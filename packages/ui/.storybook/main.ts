import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs', '@storybook/addon-themes', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    defaultName: 'Docs'
  },
  typescript: {
    check: false
  }
}

export default config
