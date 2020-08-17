const withTM = require('next-transpile-modules')(
  ['@react-spring/core', '@react-spring/web'],
  { unstable_webpack5: true }
)

module.exports = withTM({
  devIndicators: {
    autoPrerender: false,
  },
  experimental: {
    reactMode: 'concurrent',
    productionBrowserSourceMaps: true,
  },
})
