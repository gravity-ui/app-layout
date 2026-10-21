/** Selectors run synchronously in the browser and must be self-contained: no closures or imports. */
export type PublicPathFallbacks = string[] | ((context: {publicPath: string}) => string[]);

export interface AssetRetryOptions {
    /** Asset attempt timeout in milliseconds; 0 disables it. Default: 10000. */
    timeoutMs?: number;
    /** Additional attempts per URL after the first. Default: 0. */
    retries?: number;
    /** Delay before the first retry, in milliseconds. Default: 500. */
    delayMs?: number;
    /** Delay multiplier for subsequent retries. Default: 2. */
    factor?: number;
    /** Maximum retry delay, in milliseconds. Default: 3000. */
    maxDelayMs?: number;
}

export interface AssetLoadError {
    type: 'script' | 'style';
    originalUrl: string;
    attempts: string[];
}

/** Serialized into HTML; the primary URL is `publicPath + path`, so it is not repeated here. */
export interface Asset {
    type: 'script' | 'style';
    path: string;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export interface AssetLoadingConfig {
    publicPath: string;
    fallbacks: PublicPathFallbacks;
    retry: Required<AssetRetryOptions>;
}

export interface AssetLoader {
    enqueue(asset: Asset, nonce: string): void;
}
