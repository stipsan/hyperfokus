module.exports = {
  stories: ['../components/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
        controls: false,
        docs: false,
      },
    },
    {
      name: '@storybook/addon-postcss',
      options: {
        rule: { test: /(?<!\.module)\.css$/ },
        cssLoaderOptions: {
          modules: false,
        },
      },
    },
    {
      name: '@storybook/addon-postcss',
      options: {
        rule: { test: /\.module\.css$/ },
        cssLoaderOptions: {
          modules: {
            mode: 'pure',
          },
        },
      },
    },
    'storybook-dark-mode',
  ],
}
