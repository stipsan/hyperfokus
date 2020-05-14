module.exports = {
  plugins: [
    'tailwindcss',
    ['postcss-preset-env', { importFrom: './styles/_config.css', stage: 0 }],
  ],
}
