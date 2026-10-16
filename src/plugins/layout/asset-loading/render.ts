import type {AssetRenderState, RenderHelpers, Script, Stylesheet} from '../../../types.js';

import {createScriptAsset, createStyleAsset} from './assets.js';
import {serializeAssetRegistration, serializeBootstrap} from './serialization.js';
import type {Asset, AssetLoadingConfig} from './types.js';

export function createAssetRenderer(
    helpers: RenderHelpers,
    config: AssetLoadingConfig,
    state: AssetRenderState,
) {
    function renderAsset(asset: Asset, originalHtml: string): string {
        return helpers.renderInlineScript(serializeAssetRegistration(asset, originalHtml));
    }

    return {
        bootstrap(): string {
            if (state.bootstrapEmitted) {
                return '';
            }
            const html = helpers.renderInlineScript(serializeBootstrap(config));
            state.bootstrapEmitted = true;
            return html;
        },
        script(script: Script): string {
            const asset = createScriptAsset(script, config.publicPath);
            return asset
                ? renderAsset(asset, helpers.renderScript(script))
                : helpers.renderScript(script);
        },
        style(style: Stylesheet): string {
            const asset = createStyleAsset(style, config.publicPath);
            return asset
                ? renderAsset(asset, helpers.renderStyle(style))
                : helpers.renderStyle(style);
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
