import { themes } from '@storybook/theming'
import { darken } from 'polished'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config.js'

import 'tailwindcss/tailwind.css'
import '../styles/_app.css'

const config = resolveConfig(tailwindConfig)
const { theme } = config

export const parameters = {
  layout: 'centered',
  darkMode: {
    classTarget: 'html',
    darkClass: 'dark',
    lightClass: 'light',
    stylePreview: true,
    dark: {
      ...themes.dark,
      appBg: darken(0.01, theme.colors.gray[900]),
      appContentBg: theme.colors.gray[900],
      barBg: darken(0.015, theme.colors.gray[900]),
      barSelectedColor: theme.colors.blue[600],
    },
    light: { ...themes.normal },
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Design System', 'App'],
    },
  },
}
