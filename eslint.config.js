import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const reactRules = {
  'react/jsx-uses-vars': 'error',
  'react/prop-types': 'off',
  'react/no-unescaped-entities': 'off',
  'react/no-unstable-nested-components': 'error',
  'react/no-array-index-key': 'warn',
  'react/jsx-no-useless-fragment': 'warn',
  'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
  'react/self-closing-comp': 'warn',
}

export default defineConfig([
  globalIgnores(['dist', 'convex/_generated']),
  {
    // JS/JSX — i18n, gömülü font ve test dosyaları
    files: ['**/*.{js,jsx}'],
    plugins: { react },
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...reactRules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', caughtErrors: 'none' }],
    },
  },
  {
    // TS/TSX — uygulama kaynağı (typescript-eslint parser + öneri kuralları)
    files: ['**/*.{ts,tsx}'],
    plugins: { react },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...reactRules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
  },
  {
    // Node bağlamında çalışan config/test dosyaları
    files: ['playwright.config.js', 'e2e/**/*.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
