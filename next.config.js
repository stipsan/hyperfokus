const withTM = require('next-transpile-modules')([
  '@react-spring/core',
  '@react-spring/web',
])

module.exports = withTM({
  devIndicators: {
    autoPrerender: false,
  },
  experimental: {
    reactMode: 'concurrent',
    productionBrowserSourceMaps: true,
  },
})
