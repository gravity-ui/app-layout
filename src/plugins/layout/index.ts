import htmlescape from 'htmlescape';

import type {CommonOptions, Plugin} from '../../types.js';

import {getAbsoluteUrl, getJSONContent} from './helpers.js';
import type {LayoutPluginOptions, Manifest} from './types.js';

export type {LayoutPluginOptions} from './types.js';

export interface LayoutInitOptions {
    publicPath?: string;
    manifest: string | ((commonOptions: CommonOptions) => string);
}
export function createLayoutPlugin({
    publicPath = '/build/',
    manifest,
}: LayoutInitOptions): Plugin<LayoutPluginOptions, 'layout'> {
    return {
        name: 'layout',
        apply({options, renderContent, commonOptions}) {
            if (!options) {
                return;
            }

            const manifestPath = typeof manifest === 'string' ? manifest : manifest(commonOptions);

            const manifestFile: Manifest = getJSONContent(manifestPath, (err) => {
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
