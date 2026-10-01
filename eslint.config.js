import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': ['warn', { max: 40 }],
      'max-depth': ['warn', 3],
      'complexity': ['warn', 10],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**', 'scripts/**']
  }
);
