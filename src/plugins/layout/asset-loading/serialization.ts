import htmlescape from 'htmlescape';

import {installAssetLoader} from './runtime.js';
import type {Asset, AssetLoadingConfig, PublicPathFallbacks} from './types.js';

export function serializeBootstrap(config: AssetLoadingConfig): string {
    const installSource = installAssetLoader.toString();
    const configSource = serializeRuntimeConfig(config);

    return `(${installSource})(${configSource});`;
}

export function serializeAssetRegistration(asset: Asset): string {
    return `window.__APP_LAYOUT_ASSET_LOADER__.enqueue(
    ${serializeInlineValue(asset)},
    document.currentScript.nonce
);`;
}

function serializeRuntimeConfig(config: AssetLoadingConfig): string {
    return `{
    publicPath: ${serializeInlineValue(config.publicPath)},
    fallbacks: ${serializeFallbacks(config.fallbacks)},
    retry: ${serializeInlineValue(config.retry)}
}`;
}

function serializeFallbacks(fallbacks: PublicPathFallbacks): string {
    return typeof fallbacks === 'function'
        ? `(${serializeSelector(fallbacks)})`
        : serializeInlineValue(fallbacks);
}

function serializeSelector(selector: Exclude<PublicPathFallbacks, string[]>): string {
    const source = selector.toString().trim();
    const isMethodShorthand = /^(?!function\b)[\w$]+\s*\(/.test(source);
    const expression = isMethodShorthand ? `function ${source}` : source;

    return expression.replace(/<\/script/gi, '<\\/script');
}

function serializeInlineValue(value: unknown): string {
    return htmlescape(value);
}
