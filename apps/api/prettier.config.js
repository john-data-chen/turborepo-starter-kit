const baseConfig = require('style-formatter-config')

const apiConfig = {
  ...baseConfig,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['^nestjs$', '<THIRD_PARTY_MODULES>', '^@/modules/(.*)$', '^[./]']
}

module.exports = apiConfig
