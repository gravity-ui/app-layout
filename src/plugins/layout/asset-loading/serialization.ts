import htmlescape from 'htmlescape';

import {runtimeSource} from './runtime-source.js';
import type {Asset, AssetLoadingConfig, PublicPathFallbacks} from './types.js';

export function serializeBootstrap(config: AssetLoadingConfig): string {
    const configSource = serializeRuntimeConfig(config);

    return `try {
    (${runtimeSource})(${configSource});
} catch (error) {
    delete window.__APP_LAYOUT_ASSET_LOADER__;
}`;
}

/**
 * One inline script registering every managed asset of a fragment, in order.
 * Without a loader (bootstrap failed) the original tags are rebuilt from the same
 * list and written back while the HTML is still being parsed, so the page loads
 * exactly as without fallbacks.
 * @param assets - Managed assets in head order.
 * @param publicPath - Primary base URL of those assets.
 * @returns Inline script content.
 */
export function serializeAssetRegistrations(assets: Asset[], publicPath: string): string {
    return `(function () {
    var base = ${serializeInlineValue(publicPath)};
    var assets = ${serializeInlineValue(assets)};
    var loader = window.__APP_LAYOUT_ASSET_LOADER__;
    var current = document.currentScript;
    var nonce = current ? current.nonce : '';
    if (loader) {
        assets.forEach(function (asset) {
            loader.enqueue(asset, nonce);
        });
    } else if (current && document.readyState === 'loading') {
        document.write(assets.map(function (asset) {
            var attrs = ' crossorigin="' + asset.crossOrigin + '"';
            if (asset.crossOrigin === undefined) attrs = '';
            var url = (base + asset.path).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            if (asset.type === 'style') return '<link rel="stylesheet" href="' + url + '"' + attrs + '>';
            return '<script src="' + url + '" defer' + attrs + (nonce ? ' nonce="' + nonce + '"' : '') + '><\\/script>';
        }).join(''));
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
