/** @jest-environment jsdom */
import {createAssetLoadingConfig} from './config.js';
import {installAssetLoader} from './runtime.js';
import type {Asset, AssetLoader, AssetRetryOptions} from './types.js';

const globals = window as Window & {__APP_LAYOUT_ASSET_LOADER__?: AssetLoader};
let observers: MutationObserver[];
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
    observers = [];
    const Observer = window.MutationObserver;
    jest.spyOn(window, 'MutationObserver').mockImplementation((callback) => {
        const observer = new Observer(callback);
        observers.push(observer);
        return observer;
    });
    const add = window.addEventListener.bind(window);
    jest.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
        listeners.push({type, listener, options});
        add(type, listener, options);
    });
    const addDocument = document.addEventListener.bind(document);
    jest.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
        listeners.push({type, listener, options});
        addDocument(type, listener, options);
    });
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
});

afterEach(() => {
    observers.forEach((observer) => observer.disconnect());
    for (const {type, listener, options} of listeners) {
        window.removeEventListener(type, listener, options);
        document.removeEventListener(type, listener, options);
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
    return {type, path, crossOrigin: 'anonymous'};
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

test('script timeout neutralizes the hanging primary so the fallback runs first', async () => {
    const errors = jest.fn();
    window.addEventListener('app-layout:asset-load-error', errors);
    const loader = install({timeoutMs: 10});
    loader.enqueue(asset('script', 'runtime.js'), 'nonce');
    loader.enqueue(asset('script', 'app.js'), 'nonce');
    await flush();
    const primary = element('script') as HTMLScriptElement;
    expect(primary.getAttribute('src')).toBe('/build/runtime.js');
    expect(primary.async).toBe(true);
    await jest.advanceTimersByTimeAsync(11);
    expect(primary.isConnected).toBe(false);
    expect(primary.ownerDocument).not.toBe(document);
    const backup = element('script') as HTMLScriptElement;
    expect(backup.getAttribute('src')).toBe('/backup/runtime.js');
    expect(backup.async).toBe(true);
    expect(backup.nonce).toBe('nonce');
    succeed(backup);
    await flush();
    expect(element('script[src="/backup/app.js"]')).toBeDefined();
    expect(document.querySelectorAll('script')).toHaveLength(2);
    expect(primary.onload).toBeNull();
    primary.dispatchEvent(new Event('load'));
    expect(document.querySelectorAll('script')).toHaveLength(2);
    expect(errors).not.toHaveBeenCalled();
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

function nativeStyle(path = 'app.css', dataId = '0') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/build/' + path;
    link.crossOrigin = 'anonymous';
    link.setAttribute('data-app-layout-style', dataId);
    document.head.appendChild(link);
    return link;
}

test('native style timeout starts when its streamed link appears, not at registration', async () => {
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const loader = install({timeoutMs: 10});
    const style = {...asset('style', 'app.css'), dataId: '0'};
    loader.enqueue(style, 'nonce');
    loader.enqueue(asset('script', 'app.js'), 'nonce');
    await jest.advanceTimersByTimeAsync(30);
    expect(document.querySelector('link')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
    const primary = nativeStyle();
    const following = document.createElement('style');
    document.head.appendChild(following);
    await flush();
    expect(document.querySelectorAll('link')).toHaveLength(1);
    const oldLoad = primary.onload;
    await jest.advanceTimersByTimeAsync(11);
    expect(primary.isConnected).toBe(false);
    const backup = element('link');
    expect(backup.getAttribute('href')).toBe('/backup/app.css');
    expect(backup.nonce).toBe('nonce');
    expect(backup.crossOrigin).toBe('anonymous');
    expect(backup.compareDocumentPosition(following)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    oldLoad?.call(primary, new Event('load'));
    expect(document.querySelector('script')).toBeNull();
    succeed(backup);
    await flush();
    expect(document.querySelector('script')).toBeNull();
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('interactive');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flush();
    const script = element('script');
    expect(script.getAttribute('src')).toBe('/backup/app.js');
    succeed(script);
});

test('native CSS exhaustion removes owned links, preserves other links, and releases JS', async () => {
    const loader = install({timeoutMs: 10});
    const errors = jest.fn();
    window.addEventListener('app-layout:asset-load-error', errors);
    const other = document.createElement('link');
    other.rel = 'stylesheet';
    other.href = '/build/app.css';
    document.head.appendChild(other);
    const style = {...asset('style', 'app.css'), dataId: '0'};
    loader.enqueue(style, 'nonce');
    loader.enqueue(asset('script', 'app.js'), 'nonce');
    const primary = nativeStyle();
    await flush();
    await jest.advanceTimersByTimeAsync(25);
    expect(primary.isConnected).toBe(false);
    expect(document.querySelectorAll('link')).toHaveLength(1);
    expect(other.isConnected).toBe(true);
    expect(errors).toHaveBeenCalledTimes(1);
    expect(errors.mock.calls[0][0].detail).toEqual({
        type: 'style',
        originalUrl: '/build/app.css',
        attempts: ['/build/app.css', '/backup/app.css'],
    });
    expect(element('script').getAttribute('src')).toBe('/build/app.js');
    succeed(element('script'));
});

test('later native CSS keeps primary first after a successful backup script', async () => {
    const loader = install();
    loader.enqueue(asset('script', 'early.js'), 'nonce');
    await flush();
    fail(element('script'));
    await flush();
    succeed(element('script'));
    const style = {...asset('style', 'app.css'), dataId: '0'};
    loader.enqueue(style, 'nonce');
    const primary = nativeStyle();
    await flush();
    expect(document.querySelectorAll('link')).toHaveLength(1);
    expect(element('link')).toBe(primary);
    fail(primary);
    await flush();
    expect(element('link').getAttribute('href')).toBe('/backup/app.css');
    succeed(element('link'));
});
