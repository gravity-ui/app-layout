import htmlescape from 'htmlescape';
import {getAbsoluteUrl, getJSONContent} from './helpers.js';

import type {Plugin} from '../../types.js';
import type {Manifest, LayoutOptions} from './types.js';

export interface LayoutInitOptions {
    publicPath?: string;
    manifest: string;
}
export function createLayoutPlugin({
    publicPath = '/build/',
    manifest,
}: LayoutInitOptions): Plugin<LayoutOptions, 'layout'> {
    return {
        name: 'layout',
        apply({options, renderContent}) {
            if (!options) {
                return;
            }

            const manifestFile: Manifest = getJSONContent(manifest, (err) => {
                console.error('Unable to read manifest file', err);
                process.exit(1);
            });

            function getWebpackAssetUrl(name: string) {
                return getAbsoluteUrl(publicPath, manifestFile[name], options?.prefix);
            }

            renderContent.inlineScripts.unshift(
                `window.__PUBLIC_PATH__ = ${htmlescape(publicPath)}`,
            );

            const entrypointSpec = manifestFile.entrypoints
                ? manifestFile.entrypoints[options.name]
                : undefined;
            if (entrypointSpec && entrypointSpec.assets) {
                const jsAssets = Array.isArray(entrypointSpec.assets.js)
                    ? entrypointSpec.assets.js
                    : [];
                const cssAssets = Array.isArray(entrypointSpec.assets.css)
                    ? entrypointSpec.assets.css
                    : [];

                // return manifest-based preset
                renderContent.scripts.push(
                    ...jsAssets.map((js) => ({
                        src: getAbsoluteUrl(publicPath, js, options?.prefix),
                        defer: true,
                        crossOrigin: 'anonymous' as const,
                    })),
                );

                renderContent.styleSheets.push(
                    ...cssAssets.map((css) => ({
                        href: getAbsoluteUrl(publicPath, css, options?.prefix),
                    })),
                );
            } else {
                renderContent.scripts.push(
                    {src: getWebpackAssetUrl('runtime.js'), defer: true, crossOrigin: 'anonymous'},
                    {src: getWebpackAssetUrl('vendors.js'), defer: true, crossOrigin: 'anonymous'},
                    {src: getWebpackAssetUrl('commons.js'), defer: true, crossOrigin: 'anonymous'},
                    {
                        src: getWebpackAssetUrl(`${options.name}.js`),
                        defer: true,
                        crossOrigin: 'anonymous',
                    },
                );
                renderContent.styleSheets.push(
                    {href: getWebpackAssetUrl('vendors.css')},
                    {href: getWebpackAssetUrl('commons.css')},
                    {href: getWebpackAssetUrl(`${options.name}.css`)},
                );
            }
        },
    };
}
