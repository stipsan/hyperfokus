// Defaults are defined in:
// node_modules/tailwindcss/stubs/defaultConfig.stub.js

const isStorybook = process.env.STORYBOOK === 'true'

// https://tobiasahlin.com/blog/layered-smooth-box-shadows/
const dreamySoftShadow = (length) =>
  Array.from(
    { length },
    (_, i) => `0 ${2 ** i}px ${2 ** (i + 1)}px rgba(0,0,0,${13 - length}%)`
  ).join(', ')

module.exports = {
  mode: 'jit',
  purge: ['./components/**/*.tsx', './pages/**/*.tsx'],
  darkMode: isStorybook ? 'class' : 'media',
  theme: {
    extend: {
      boxShadow: {
        xs: '0 0 0 1px rgba(0, 0, 0, 0.1)',
        sm: dreamySoftShadow(2),
        default: dreamySoftShadow(3),
        md: dreamySoftShadow(4),
        lg: dreamySoftShadow(5),
        xl: dreamySoftShadow(6),
        '2xl': dreamySoftShadow(7),
      },
    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    color: ['responsive', 'hover', 'focus', 'active'],
  },
  plugins: [
    require('@tailwindcss/custom-forms'),
    require('tailwindcss-skip-link')(),
    //require('tailwind-heropatterns')(),
    require('tailwindcss-gradients'),
    require('tailwindcss-touch')(),
  ],
  future: {
    removeDeprecatedGapUtilities: true,
  },
}
