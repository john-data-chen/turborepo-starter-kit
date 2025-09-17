const baseConfig = require('style-formatter-config')

const webConfig = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss', '@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['^react$', '<THIRD_PARTY_MODULES>', '^@ui/(.*)$', '^[./]']
}

module.exports = webConfig
