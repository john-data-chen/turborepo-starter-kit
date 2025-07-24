const baseConfig = require('style-formatter-config');

const webConfig = {
  ...baseConfig,
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports'
  ],
  importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true
};

module.exports = webConfig;
