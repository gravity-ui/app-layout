/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    transform: {
        '^.+\\.ts$': ['ts-jest', {useESM: true}],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    extensionsToTreatAsEsm: ['.ts'],
    transformIgnorePatterns: ['node_modules/(?!(@gravity-ui)/)'],
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.ts'],
    passWithNoTests: true,
};
