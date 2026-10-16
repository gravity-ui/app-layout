import type {Script, Stylesheet} from '../../../types.js';

import type {Asset} from './types.js';

export function createScriptAsset(script: Script, publicPath: string): Asset | undefined {
    if (!script.defer || script.async || script.type) {
        return undefined;
    }

    const path = getAssetPath(script.src, publicPath);

    if (!path) {
        return undefined;
    }

    return {
        type: 'script',
        path,
        originalUrl: script.src,
        crossOrigin: script.crossOrigin,
    };
}

export function createStyleAsset(style: Stylesheet, publicPath: string): Asset | undefined {
    const path = getAssetPath(style.href, publicPath);

    if (!path) {
        return undefined;
    }

    return {
        type: 'style',
        path,
        originalUrl: style.href,
        crossOrigin: style.crossOrigin,
    };
}

function getAssetPath(url: string, publicPath: string): string | undefined {
    if (!url || !url.startsWith(publicPath)) {
        return undefined;
    }

    const suffix = url.slice(publicPath.length);

    return suffix && !suffix.startsWith('/') ? suffix : undefined;
}
