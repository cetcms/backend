import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import tsEsLint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export default [
  js.configs.recommended,
  ...tsEsLint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript 相关规则
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'error',

      // 通用规则

      // Node.js 特定规则
      'node/no-unsupported-features/es-syntax': 'off', // 使用 TypeScript 转译
      'node/no-missing-import': 'off', // TypeScript 处理导入
      'node/no-missing-require': 'off', // 使用 ES modules
      'node/no-unpublished-import': 'off', // 开发依赖允许
      'node/no-unpublished-require': 'off',
      'node/shebang': 'off', // 不是 CLI 工具

      // 后端特定的优化规则
      'no-console': 'off', // 后端允许 console.log
      'no-process-exit': 'off',
      'no-process-env': 'off', // 后端需要访问环境变量
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      quotes: ['error', 'single', { avoidEscape: true }],

      // 异步处理
      'require-await': 'error',
      'no-return-await': 'error',

      // 错误处理
      'prefer-promise-reject-errors': 'error',

      // Import 相关规则
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off', // TypeScript 处理
      'import/no-duplicates': 'error',

      // Prettier 相关 - 只保留与格式化相关的配置
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
          tabWidth: 2,
          printWidth: 120,
        },
      ],
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      '**/generated/**',
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'public/**',
      '**/*.d.ts',
      'src/contracts/models-relation.contract.ts',
      'src/i18n/i18n.enum.ts',
    ],
  },
];
