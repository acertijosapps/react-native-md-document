module.exports = {
    root: true,
    extends: '@react-native',
    plugins: ['simple-import-sort'],
    rules: {
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    ['^\\u0000'],
                    ['^react', '^react-native'],
                    ['^@?\\w'],
                    ['^\\.'],
                ],
            },
        ],
        'simple-import-sort/exports': 'error',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'react/display-name': 'off',
        'react-native/no-inline-styles': 'off',
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        argsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                        caughtErrorsIgnorePattern: '^_',
                    },
                ],
                '@typescript-eslint/explicit-function-return-type': 'off',
            },
        },
        {
            files: ['*.test.ts', '*.test.tsx'],
            env: { 'jest/globals': true, jest: true },
        },
    ],
};
