/** @type {import('prettier').Config} */

module.exports = {
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: './packages/ui/src/styles/globals.css',
  tailwindFunctions: ['clsx'],
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 120,
  proseWrap: 'preserve',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  importOrder: ['^react$', '^nestjs$', '<THIRD_PARTY_MODULES>', '^@ui/(.*)$', '^@/modules/(.*)$', '^[./]'],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.9.2',
  importOrderCaseSensitive: false
}
