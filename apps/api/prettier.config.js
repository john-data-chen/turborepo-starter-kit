const baseConfig = require('style-formatter-config');

const apiConfig = {
  ...baseConfig,
  plugins: ['@prettier/plugin-oxc','@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['^nestjs$', '<THIRD_PARTY_MODULES>', '^@/modules/(.*)$', '^[./]']
};

module.exports = apiConfig;
