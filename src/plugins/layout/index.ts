import htmlescape from 'htmlescape';

import type {CommonOptions, Plugin} from '../../types.js';

import {getAbsoluteUrl, getJSONContent} from './helpers.js';
import type {LayoutPluginOptions, Manifest} from './types.js';

export type {LayoutPluginOptions, Manifest} from './types.js';

export interface LayoutInitOptions {
    publicPath?: string;
    manifest: string | Manifest | ((commonOptions: CommonOptions) => string | Manifest);
}
export function createLayoutPlugin({
    publicPath = '/build/',
    manifest,
}: LayoutInitOptions): Plugin<LayoutPluginOptions, 'layout'> {
    let manifestContent: Manifest | undefined;
    if (typeof manifest === 'string') {
        manifestContent = getJSONContent(manifest, (err) => {
            throw new Error(`Layout: Unable to read manifest file. ${err}`);
        });
    } else if (typeof manifest === 'object') {
        manifestContent = manifest;
    }
    return {
        name: 'layout',
        apply({options, renderContent, commonOptions}) {
            if (!options) {
                return;
            }

            if (typeof manifest === 'function') {
                const m = manifest(commonOptions);
                if (typeof m === 'string') {
                    manifestContent = getJSONContent(m, (err) => {
                        throw new Error(`Layout: Unable to read manifest file. ${err}`);
                    });
                } else {
                    manifestContent = m;
                }
            }

            if (!manifestContent || typeof manifestContent !== 'object') {
                throw new Error('Layout: manifest content is not defined.');
            }

            renderContent.inlineScripts.unshift(
                `window.__PUBLIC_PATH__ = ${htmlescape(publicPath)}`,
            );

            const entrypointSpec = manifestContent.entrypoints
                ? manifestContent.entrypoints[options.name]
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
                        crossOrigin: options.scriptsCrossOrigin || 'anonymous',
                    })),
                );

                renderContent.styleSheets.push(
                    ...cssAssets.map((css) => ({
                        href: getAbsoluteUrl(publicPath, css, options?.prefix),
                        crossOrigin: options.stylesCrossOrigin,
                    })),
                );
            } else {
                const manifestEntries = manifestContent;
                const getWebpackAssetUrl = (name: string) => {
                    return getAbsoluteUrl(publicPath, manifestEntries[name], options?.prefix);
                };
                renderContent.scripts.push(
                    {
                        src: getWebpackAssetUrl('runtime.js'),
                        defer: true,
                        crossOrigin: options.scriptsCrossOrigin || 'anonymous',
                    },
                    {
                        src: getWebpackAssetUrl('vendors.js'),
                        defer: true,
                        crossOrigin: options.scriptsCrossOrigin || 'anonymous',
                    },
                    {
                        src: getWebpackAssetUrl('commons.js'),
                        defer: true,
                        crossOrigin: options.scriptsCrossOrigin || 'anonymous',
                    },
                    {
                        src: getWebpackAssetUrl(`${options.name}.js`),
                        defer: true,
                        crossOrigin: options.scriptsCrossOrigin || 'anonymous',
                    },
                );
                renderContent.styleSheets.push(
                    {
                        href: getWebpackAssetUrl('vendors.css'),
                        crossOrigin: options.stylesCrossOrigin,
                    },
                    {
                        href: getWebpackAssetUrl('commons.css'),
                        crossOrigin: options.stylesCrossOrigin,
                    },
                    {
                        href: getWebpackAssetUrl(`${options.name}.css`),
                        crossOrigin: options.stylesCrossOrigin,
                    },
                );
            }
        },
    };
}
