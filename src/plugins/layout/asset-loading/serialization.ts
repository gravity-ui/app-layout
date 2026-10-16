import htmlescape from 'htmlescape';

import {installAssetLoader} from './runtime.js';
import type {Asset, AssetLoadingConfig, PublicPathFallbacks} from './types.js';

export function serializeBootstrap(config: AssetLoadingConfig): string {
    const installSource = installAssetLoader.toString();
    const configSource = serializeRuntimeConfig(config);

    return `try {
    (${installSource})(${configSource});
} catch (error) {
    delete window.__APP_LAYOUT_ASSET_LOADER__;
}`;
}

export function serializeAssetRegistration(asset: Asset, originalHtml: string): string {
    return `(function () {
    var loader = window.__APP_LAYOUT_ASSET_LOADER__;
    var current = document.currentScript;
    if (loader) {
        loader.enqueue(${serializeInlineValue(asset)}, current ? current.nonce : '');
    } else if (current && document.readyState === 'loading') {
        document.write(${serializeInlineValue(originalHtml)});
    }
})();`;
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
