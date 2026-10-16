/** @jest-environment jsdom */
import {createAssetLoadingConfig} from './config.js';
import {installAssetLoader} from './runtime.js';
import type {Asset, AssetLoader, AssetRetryOptions} from './types.js';

const globals = window as Window & {__APP_LAYOUT_ASSET_LOADER__?: AssetLoader};
let listeners: {
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
}[];

beforeEach(() => {
    jest.useFakeTimers();
    document.head.innerHTML = '';
    delete globals.__APP_LAYOUT_ASSET_LOADER__;
    listeners = [];
    const add = window.addEventListener.bind(window);
    jest.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
        listeners.push({type, listener, options});
        add(type, listener, options);
    });
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
});

afterEach(() => {
    for (const {type, listener, options} of listeners) {
        window.removeEventListener(type, listener, options);
    }
    jest.restoreAllMocks();
    jest.useRealTimers();
});

function install(retry?: AssetRetryOptions, fallbacks = ['/backup/']) {
    const config = createAssetLoadingConfig('/build/', fallbacks, retry);
    if (!config) throw new Error('Missing config');
    installAssetLoader(config);
    if (!globals.__APP_LAYOUT_ASSET_LOADER__) throw new Error('Missing loader');
    return globals.__APP_LAYOUT_ASSET_LOADER__;
}

function asset(type: Asset['type'], path: string): Asset {
    return {type, path, originalUrl: '/build/' + path, crossOrigin: 'anonymous'};
}

function element(selector: string): HTMLLinkElement | HTMLScriptElement {
    const result = document.querySelector<HTMLLinkElement | HTMLScriptElement>(selector);
    if (!result) throw new Error('Missing ' + selector);
    return result;
}

const fail = (node: Element) => node.dispatchEvent(new Event('error'));
const succeed = (node: Element) => node.dispatchEvent(new Event('load'));
const flush = () => jest.advanceTimersByTimeAsync(0);

test('default retries immediately switch and remember the successful base', async () => {
    const loader = install();
    loader.enqueue(asset('script', 'app.js'), 'nonce');
    loader.enqueue(asset('script', 'next.js'), 'nonce');
    await flush();
    fail(element('script'));
    await flush();
    const backup = element('script');
    expect(backup.getAttribute('src')).toBe('/backup/app.js');
    expect(backup.nonce).toBe('nonce');
    expect(backup.crossOrigin).toBe('anonymous');
    succeed(backup);
    await flush();
    expect(element('script[src="/backup/next.js"]')).toBeDefined();
});

test('rotates candidates from the last successful base, including primary', async () => {
    const loader = install(undefined, ['/backup/', '/second/']);
    loader.enqueue(asset('script', 'first.js'), '');
    await flush();
    fail(element('script'));
    await flush();
    succeed(element('script'));
    loader.enqueue(asset('script', 'next.js'), '');
    await flush();
    fail(element('script[src="/backup/next.js"]'));
    await flush();
    fail(element('script[src="/second/next.js"]'));
    await flush();
    expect(element('script[src="/build/next.js"]')).toBeDefined();
});

test('explicit retries retain exponential delays before trying a backup', async () => {
    const loader = install({retries: 2});
    loader.enqueue(asset('style', 'app.css'), '');
    for (const delay of [500, 1000]) {
        fail(element('link'));
        await jest.advanceTimersByTimeAsync(delay - 1);
        expect(document.querySelector('link')).toBeNull();
        await jest.advanceTimersByTimeAsync(1);
        expect(element('link').getAttribute('href')).toBe('/build/app.css');
    }
    fail(element('link'));
    await flush();
    expect(element('link').getAttribute('href')).toBe('/backup/app.css');
});

test.each<Asset['type']>(['style', 'script'])(
    '%s timeout switches addresses and ignores late callbacks',
    async (type) => {
        const loader = install({timeoutMs: 10});
        const selector = type === 'style' ? 'link' : 'script';
        const urlAttribute = type === 'style' ? 'href' : 'src';
        const path = type === 'style' ? 'app.css' : 'app.js';
        loader.enqueue(asset(type, path), 'nonce');
        await flush();
        const primary = element(selector);
        const onload = primary.onload;
        await jest.advanceTimersByTimeAsync(11);
        expect(primary.isConnected).toBe(false);
        const backup = element(selector);
        expect(backup.getAttribute(urlAttribute)).toBe('/backup/' + path);
        onload?.call(primary, new Event('load'));
        expect(jest.getTimerCount()).toBe(1);
        succeed(backup);
        expect(jest.getTimerCount()).toBe(0);
        await flush();
        loader.enqueue(asset('script', 'next.js'), '');
        await flush();
        expect(element('script[src="/backup/next.js"]')).toBeDefined();
    },
);

test.each<Asset['type']>(['style', 'script'])(
    '%s timeout applies same-URL retries and reports exhaustion once',
    async (type) => {
        const errors = jest.fn();
        window.addEventListener('app-layout:asset-load-error', errors);
        const loader = install({timeoutMs: 10, retries: 2, delayMs: 5, factor: 2});
        const selector = type === 'style' ? 'link' : 'script';
        const urlAttribute = type === 'style' ? 'href' : 'src';
        const path = type === 'style' ? 'app.css' : 'app.js';
        loader.enqueue(asset(type, path), '');
        await flush();
        for (const base of ['/build/', '/backup/']) {
            for (const delay of [5, 10]) {
                expect(element(selector).getAttribute(urlAttribute)).toBe(base + path);
                await jest.advanceTimersByTimeAsync(10);
                expect(document.querySelector(selector)).toBeNull();
                await jest.advanceTimersByTimeAsync(delay - 1);
                expect(document.querySelector(selector)).toBeNull();
                await jest.advanceTimersByTimeAsync(1);
            }
            expect(element(selector).getAttribute(urlAttribute)).toBe(base + path);
            await jest.advanceTimersByTimeAsync(11);
        }
        expect(errors).toHaveBeenCalledTimes(1);
        expect(errors.mock.calls[0][0].detail.attempts).toEqual([
            ...Array(3).fill('/build/' + path),
            ...Array(3).fill('/backup/' + path),
        ]);
        expect(jest.getTimerCount()).toBe(0);
        expect(document.querySelector(selector)).toBeNull();
        await jest.advanceTimersByTimeAsync(100);
        expect(errors).toHaveBeenCalledTimes(1);
    },
);

test('CSS exhaustion by timeout reports once and allows JS to start on primary', async () => {
    const errors = jest.fn();
    window.addEventListener('app-layout:asset-load-error', errors);
    const loader = install({timeoutMs: 10});
    loader.enqueue(asset('style', 'missing.css'), '');
    loader.enqueue(asset('script', 'app.js'), '');
    await jest.advanceTimersByTimeAsync(25);
    expect(errors).toHaveBeenCalledTimes(1);
    expect(errors.mock.calls[0][0].detail.attempts).toEqual([
        '/build/missing.css',
        '/backup/missing.css',
    ]);
    expect(element('script').getAttribute('src')).toBe('/build/app.js');
    succeed(element('script'));
    expect(jest.getTimerCount()).toBe(0);
});

test('zero disables both CSS and script attempt timeouts', async () => {
    const loader = install({timeoutMs: 0});
    loader.enqueue(asset('style', 'app.css'), '');
    expect(jest.getTimerCount()).toBe(0);
    succeed(element('link'));
    loader.enqueue(asset('script', 'app.js'), '');
    await flush();
    expect(jest.getTimerCount()).toBe(0);
});

test('parallel styles keep candidate order and scripts wait for newly registered styles', async () => {
    const loader = install();
    loader.enqueue(asset('style', 'first.css'), '');
    loader.enqueue(asset('style', 'second.css'), '');
    loader.enqueue(asset('script', 'app.js'), '');
    fail(element('link[href="/build/first.css"]'));
    await flush();
    succeed(element('link[href="/backup/first.css"]'));
    expect(element('link[href="/build/second.css"]')).toBeDefined();
    succeed(element('link[href="/build/second.css"]'));
    loader.enqueue(asset('style', 'late.css'), '');
    await flush();
    expect(document.querySelector('script')).toBeNull();
    succeed(element('link[href="/build/late.css"]'));
    await flush();
    expect(document.querySelector('script')).not.toBeNull();
});

test('script timeout exhaustion stops queued scripts', async () => {
    const errors = jest.fn();
    window.addEventListener('app-layout:asset-load-error', errors);
    const loader = install({timeoutMs: 10});
    loader.enqueue(asset('script', 'app.js'), '');
    loader.enqueue(asset('script', 'next.js'), '');
    await jest.advanceTimersByTimeAsync(25);
    expect(errors).toHaveBeenCalledTimes(1);
    expect(errors.mock.calls[0][0].detail.type).toBe('script');
    expect(document.querySelector('script')).toBeNull();
    expect(jest.getTimerCount()).toBe(0);
});

test.each<Asset['type']>(['style', 'script'])(
    '%s load error cancels its attempt timer before retrying',
    async (type) => {
        const loader = install({timeoutMs: 10, retries: 1, delayMs: 20});
        const selector = type === 'style' ? 'link' : 'script';
        const path = type === 'style' ? 'app.css' : 'app.js';
        loader.enqueue(asset(type, path), '');
        await flush();
        fail(element(selector));
        expect(jest.getTimerCount()).toBe(1);
        await jest.advanceTimersByTimeAsync(19);
        expect(document.querySelector(selector)).toBeNull();
        await jest.advanceTimersByTimeAsync(1);
        succeed(element(selector));
        expect(jest.getTimerCount()).toBe(0);
    },
);
