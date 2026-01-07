import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'
import jest from 'eslint-plugin-jest'
import stylistic from '@stylistic/eslint-plugin'
import sonarjs from 'eslint-plugin-sonarjs'
import * as depend from 'eslint-plugin-depend'
import jsdoc from 'eslint-plugin-jsdoc'
import pluginSecurity from 'eslint-plugin-security'
const tsParser = await import('@typescript-eslint/parser')
export default [
  depend.configs['flat/recommended'],
  {
    ignores: [
      '**/*.js',
      '**/api-definitions.ts',
      '**/.expo/**/*.ts*',
      '**/dist',
      '**/.next/**',
      '**/node_modules/**',
      '**/web/public/ggtype.d.ts', // Generated file
    ],
  },
  pluginSecurity.configs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  jsdoc.configs['flat/recommended-typescript'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      jest,
      ts: tseslint,
      '@stylistic': stylistic,
      jsdoc,
    },
    languageOptions: {
      parser: tsParser.default,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'sonarjs/new-cap': 'off',
      'sonarjs/deprecation': 'warn',
      'sonarjs/function-return-type': 'off',
      'sonarjs/no-empty-test-file': 'off',
      'sonarjs/cognitive-complexity': 'error',
      'sonarjs/prefer-immediate-return': 0,
      'sonarjs/no-duplicate-string': 0,
      'sonarjs/no-nested-template-literals': 0,
      'sonarjs/no-redundant-jump': 0,
      'sonarjs/no-small-switch': 0,
      'sonarjs/todo-tag': 0,
      'sonarjs/no-misused-promises': 0,

      'prefer-destructuring': 2,
      camelcase: 2,
      'object-shorthand': 2,
      'no-nested-ternary': 1,
      'no-shadow': 'error',
      '@typescript-eslint/no-shadow': 2,
      'no-unused-vars': 0,

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/strict-boolean-expressions':
        'off',
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
          },
          singleline: {
            delimiter: 'semi', // This is the default for prettier that is not configurable
            requireLast: false,
          },
        },
      ],
      '@stylistic/comma-dangle': [
        'error',
        'always-multiline',
      ],
      '@stylistic/indent': 'off',

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/method-signature-style': [
        'error',
      ],
      '@typescript-eslint/prefer-ts-expect-error': ['off'],
      '@typescript-eslint/ban-ts-comment': ['error'],
      '@typescript-eslint/restrict-template-expressions': [
        'off',
      ],
      '@typescript-eslint/return-await': ['off'],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'off',
      ],
      '@typescript-eslint/no-dynamic-delete': ['off'],
      // '@typescript-eslint/prefer-optional-chain': ['error'], slow
      '@typescript-eslint/no-var-requires': ['warn'],
      '@typescript-eslint/no-invalid-void-type': ['off'],
      '@typescript-eslint/explicit-function-return-type': [
        'off',
      ],
      '@typescript-eslint/no-unused-vars': [
        'error', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'security/detect-object-injection': 'off',
      'no-console': 'error',
      'no-unneeded-ternary': 'error',
      'no-undef': 'off', // TypeScript handles this

      'unicorn/prefer-module': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-unreadable-iife': 'error',
      'unicorn/no-keyword-prefix': 'off',
      'unicorn/prefer-ternary': [
        'error',
        'only-single-line',
      ],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            doc: false,
            utils: false,
            refs: false,
            fn: false,
            props: false,
            ref: false,
            params: false,
            args: false,
            vars: false,
            env: false,
            class: false,
            ctx: false,
            db: false,
            cb: false,
          },
        },
      ],

      // Override jsdoc recommended rules as needed
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/check-alignment': 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/check-param-names': 'off',
      'jsdoc/check-tag-names': 'off',
      'jsdoc/check-types': 'off',
      'jsdoc/implements-on-classes': 'off',
      'jsdoc/match-description': 'off',
      'jsdoc/newline-after-description': 'off',
      'jsdoc/no-types': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/valid-types': 'off',
    },
  },
  {
    files: [
      'scripts/**/*.mjs',
      '**/*.mjs',
      'web/scripts/**/*.mjs',
    ],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'unicorn/no-process-exit': 'off',
      'jsdoc/require-jsdoc': 'off',
      'sonarjs/os-command': 'off',
      'sonarjs/no-os-command-from-path': 'off',
    },
  },
]
