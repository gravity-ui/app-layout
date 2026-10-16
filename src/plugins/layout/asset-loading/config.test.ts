import {createAssetLoadingConfig} from './config.js';

test('disables fallback loading for omitted or empty lists', () => {
    expect(createAssetLoadingConfig('/build', undefined)).toBeUndefined();
    expect(createAssetLoadingConfig('/build', [])).toBeUndefined();
});

test('normalizes bases and keeps defaults for explicit undefined options', () => {
    expect(
        createAssetLoadingConfig('/build', ['/backup', '/backup/'], {
            retries: undefined,
            delayMs: undefined,
            factor: undefined,
            maxDelayMs: undefined,
            timeoutMs: undefined,
        }),
    ).toEqual({
        publicPath: '/build/',
        fallbacks: ['/backup/'],
        retry: {retries: 0, delayMs: 500, factor: 2, maxDelayMs: 3000, timeoutMs: 10000},
    });
});

test('preserves explicit retries and zero delay/timeout', () => {
    expect(
        createAssetLoadingConfig('/build/', ['/backup/'], {
            retries: 2,
            delayMs: 0,
            timeoutMs: 0,
        })?.retry,
    ).toEqual({retries: 2, delayMs: 0, factor: 2, maxDelayMs: 3000, timeoutMs: 0});
});
