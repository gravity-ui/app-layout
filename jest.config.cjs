/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    transform: {
        '^.+\\.ts$': ['ts-jest', {tsconfig: './tsconfig.jest.json'}],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transformIgnorePatterns: ['node_modules/(?!(@gravity-ui)/)'],
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.ts'],
};
