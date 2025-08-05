const baseConfig = require('style-formatter-config');

const apiConfig = {
  ...baseConfig,
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript',
        plugins: ['@trivago/prettier-plugin-sort-imports'],
        importOrder: [
          '^@core/(.*)$',
          '^@server/(.*)$',
          '^@/modules/(.*)$',
          '^[./]'
        ],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
        importOrderCaseInsensitive: true,
        importOrderParserPlugins: ['typescript', 'decorators-legacy']
      }
    }
  ]
};

module.exports = apiConfig;
