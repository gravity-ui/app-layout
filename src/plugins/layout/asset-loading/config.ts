import type {AssetLoadingConfig, AssetRetryOptions, PublicPathFallbacks} from './types.js';

const DEFAULT_RETRY: Required<AssetRetryOptions> = {
    retries: 0,
    timeoutMs: 10000,
    delayMs: 500,
    factor: 2,
    maxDelayMs: 3000,
};

export function createAssetLoadingConfig(
    publicPath: string,
    fallbacks: PublicPathFallbacks | undefined,
    retry?: AssetRetryOptions,
): AssetLoadingConfig | undefined {
    if (fallbacks === undefined || (Array.isArray(fallbacks) && !fallbacks.length)) {
        return undefined;
    }

    return {
        publicPath: normalizePath(publicPath),
        fallbacks: normalizeFallbacks(fallbacks),
        retry: normalizeRetry(retry),
    };
}

function normalizePath(value: string): string {
    return value.endsWith('/') ? value : `${value}/`;
}

function normalizeFallbacks(fallbacks: PublicPathFallbacks): PublicPathFallbacks {
    if (typeof fallbacks === 'function') {
        return fallbacks;
    }

    return Array.from(new Set(fallbacks.map(normalizePath)));
}

function normalizeRetry(retry?: AssetRetryOptions): Required<AssetRetryOptions> {
    return {
        ...DEFAULT_RETRY,
        ...Object.fromEntries(
            Object.entries(retry ?? {}).filter(([, value]) => value !== undefined),
        ),
    };
}
