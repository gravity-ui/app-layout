import type {AssetRenderState, RenderHelpers, Script, Stylesheet} from '../../../types.js';

import {createScriptAsset, createStyleAsset} from './assets.js';
import {serializeAssetRegistrations, serializeBootstrap} from './serialization.js';
import type {Asset, AssetLoadingConfig} from './types.js';

/** Managed assets of one fragment: their single registration script and which items it covers. */
export interface AssetBatch {
    html: string;
    has(item: Script | Stylesheet): boolean;
}

export function createAssetRenderer(
    helpers: RenderHelpers,
    config: AssetLoadingConfig,
    state: AssetRenderState,
) {
    return {
        bootstrap(): string {
            if (state.bootstrapEmitted) {
                return '';
            }
            const html = helpers.renderInlineScript(serializeBootstrap(config));
            state.bootstrapEmitted = true;
            return html;
        },
        /**
         * Collects every managed stylesheet and script of a fragment into one
         * registration script, in head order: stylesheets first, then scripts.
         */
        register(styles: Stylesheet[], scripts: Script[]): AssetBatch {
            const managed = new Set<Script | Stylesheet>();
            const assets: Asset[] = [];

            for (const style of styles) {
                const asset = createStyleAsset(style, config.publicPath);
                if (asset) {
                    managed.add(style);
                    assets.push(asset);
                }
            }
            for (const script of scripts) {
                const asset = createScriptAsset(script, config.publicPath);
                if (asset) {
                    managed.add(script);
                    assets.push(asset);
                }
            }

            return {
                html: assets.length
                    ? helpers.renderInlineScript(
                          serializeAssetRegistrations(assets, config.publicPath),
                      )
                    : '',
                has: (item) => managed.has(item),
            };
        },
        preload(script: Script): string {
            const link = {
                href: script.src,
                crossOrigin: script.crossOrigin,
                rel: 'preload',
                as: 'script',
                ...(createScriptAsset(script, config.publicPath)
                    ? {'data-app-layout-preload': ''}
                    : {}),
            };
            return helpers.renderLink(link);
        },
    };
}
