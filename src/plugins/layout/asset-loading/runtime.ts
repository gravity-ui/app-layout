import type {Asset, AssetLoader, AssetLoadingConfig} from './types.js';

/**
 * Inlined into HTML using toString(). Keep all runtime dependencies inside this
 * function and avoid syntax that compiles to external TypeScript helpers.
 * @param config - Normalized asset loading configuration.
 * @returns Nothing; installs a single loader for the page.
 */
export function installAssetLoader(config: AssetLoadingConfig): void {
    const globals = window as Window & {
        __APP_LAYOUT_ASSET_LOADER__?: AssetLoader;
    };

    if (globals.__APP_LAYOUT_ASSET_LOADER__) {
        return;
    }

    const fallbacks = resolveFallbacks();
    const retries = fallbacks.length ? config.retry.retries : 0;
    const failures = new WeakMap<EventTarget, (event: Event) => void>();
    const registeredAssets = new Set<string>();
    const pendingStyles: Promise<boolean>[] = [];
    const scriptQueue: {asset: Asset; nonce: string}[] = [];
    let stopped = false;
    let processingScripts = false;
    let documentReady = document.readyState !== 'loading';

    globals.__APP_LAYOUT_ASSET_LOADER__ = {enqueue};

    window.addEventListener('error', handleResourceError, true);

    if (!documentReady) {
        document.addEventListener('DOMContentLoaded', handleDocumentReady, {once: true});
    }

    function resolveFallbacks(): string[] {
        const selected =
            typeof config.fallbacks === 'function'
                ? config.fallbacks({publicPath: config.publicPath})
                : config.fallbacks;

        return normalizeFallbacks(selected);
    }

    function normalizeFallbacks(selected: string[]): string[] {
        const primary = new URL(config.publicPath, location.href).href;
        const seen = new Set([primary]);
        const result: string[] = [];

        for (const candidate of selected) {
            const path = normalizePath(candidate);
            const absolute = new URL(path, location.href).href;

            if (!seen.has(absolute)) {
                seen.add(absolute);
                result.push(path);
            }
        }

        return result;
    }

    function normalizePath(value: string): string {
        return value.endsWith('/') ? value : value + '/';
    }

    function handleResourceError(event: Event): void {
        const target = event.target;

        if (target instanceof Element && target.hasAttribute('data-app-layout-preload')) {
            event.stopImmediatePropagation();
            return;
        }

        const onFailure = target && failures.get(target);

        if (onFailure) {
            onFailure(event);
        }
    }

    function handleDocumentReady(): void {
        documentReady = true;
        processScriptQueue();
    }

    function enqueue(asset: Asset, nonce: string): void {
        const key = asset.type + ':' + new URL(asset.originalUrl, location.href).href;

        if (registeredAssets.has(key) || stopped) {
            return;
        }

        if (asset.type === 'style') {
            const promise = loadAsset(asset, nonce);

            registeredAssets.add(key);
            pendingStyles.push(promise);
        } else {
            registeredAssets.add(key);
            scriptQueue.push({asset, nonce});
            processScriptQueue();
        }
    }

    async function processScriptQueue(): Promise<void> {
        if (!documentReady || processingScripts || stopped) {
            return;
        }

        processingScripts = true;

        try {
            while (scriptQueue.length) {
                await waitForStyles();

                if (stopped) {
                    break;
                }

                const next = scriptQueue.shift();

                if (next) {
                    await loadAsset(next.asset, next.nonce);
                }
            }
        } finally {
            processingScripts = false;
        }
    }

    async function waitForStyles(): Promise<void> {
        let count: number;

        do {
            count = pendingStyles.length;
            await Promise.all(pendingStyles);
        } while (pendingStyles.length !== count);
    }

    function loadAsset(asset: Asset, nonce: string): Promise<boolean> {
        const urls = [asset.originalUrl].concat(fallbacks.map((base) => base + asset.path));
        const attempts: string[] = [];
        let anchor: Comment | undefined;
        let element: HTMLScriptElement | HTMLLinkElement | undefined;
        let retryTimer: number | undefined;
        let candidateIndex = 0;
        let retryIndex = 0;
        let settled = false;

        return new Promise((resolve) => {
            runSafely(() => {
                anchor = createAssetAnchor(asset);
                startAttempt();
            });

            // Includes later retries and event callbacks, not only the initial attempt.
            function runSafely(action: () => void): void {
                if (settled) {
                    return;
                }

                try {
                    action();
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('[app-layout] Asset loader failed', error);
                    finish(false);
                }
            }

            function startAttempt(): void {
                const url = urls[candidateIndex] as string;

                attempts.push(url);
                element = createAssetElement(asset, url, nonce);
                element.onload = () => runSafely(() => finish(true));
                failures.set(element, (event) => runSafely(() => handleAttemptError(event)));
                anchor?.before(element);
            }

            function handleAttemptError(event: Event): void {
                if (element) {
                    clearAttemptHandlers(element);
                }

                const delay = advanceAttempt();

                if (delay === undefined) {
                    finish(false);
                    return;
                }

                event.stopImmediatePropagation();
                element?.remove();
                element = undefined;
                retryTimer = window.setTimeout(() => runSafely(startAttempt), delay);
            }

            function finish(success: boolean): void {
                if (settled) {
                    return;
                }

                settled = true;

                if (!success && asset.type === 'script') {
                    stopped = true;
                }

                try {
                    window.clearTimeout(retryTimer);

                    if (element) {
                        clearAttemptHandlers(element);
                    }

                    anchor?.remove();
                } finally {
                    try {
                        if (!success) {
                            reportAssetFailure(asset, attempts);
                        }
                    } finally {
                        resolve(success);
                    }
                }
            }
        });

        function advanceAttempt(): number | undefined {
            if (retryIndex < retries) {
                const delay = getRetryDelay(retryIndex);

                retryIndex++;

                return delay;
            }

            if (candidateIndex + 1 < urls.length) {
                candidateIndex++;
                retryIndex = 0;

                return 0;
            }

            return undefined;
        }
    }

    function getRetryDelay(retryIndex: number): number {
        if (config.retry.delayMs === 0) {
            return 0;
        }

        return Math.min(
            config.retry.delayMs * Math.pow(config.retry.factor, retryIndex),
            config.retry.maxDelayMs,
        );
    }

    function createAssetAnchor(asset: Asset): Comment {
        const anchor = document.createComment('app-layout ' + asset.type);

        document.head.appendChild(anchor);

        return anchor;
    }

    function createAssetElement(
        asset: Asset,
        url: string,
        nonce: string,
    ): HTMLScriptElement | HTMLLinkElement {
        const element =
            asset.type === 'script'
                ? document.createElement('script')
                : document.createElement('link');

        if (asset.crossOrigin !== undefined) {
            element.crossOrigin = asset.crossOrigin;
        }

        if (nonce) {
            element.nonce = nonce;
        }

        if (element instanceof HTMLScriptElement) {
            element.async = false;
            element.src = url;
        } else {
            element.rel = 'stylesheet';
            element.href = url;
        }

        return element;
    }

    function clearAttemptHandlers(element: HTMLScriptElement | HTMLLinkElement): void {
        failures.delete(element);
        element.onload = null;
    }

    function reportAssetFailure(asset: Asset, attempts: string[]): void {
        window.dispatchEvent(
            new CustomEvent('app-layout:asset-load-error', {
                detail: {
                    type: asset.type,
                    originalUrl: asset.originalUrl,
                    attempts,
                },
            }),
        );
    }
}
