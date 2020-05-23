module.exports = {
  purge: ['./components/**/*.tsx', './pages/**/*.tsx'],
  theme: {
    extend: {},
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
}
