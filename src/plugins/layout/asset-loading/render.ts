import type {HeadContent, Link, RenderHelpers, Script, Stylesheet} from '../../../types.js';

import {createScriptAsset, createStyleAsset, isManagedPreload} from './assets.js';
import {serializeAssetRegistration, serializeBootstrap} from './serialization.js';
import type {Asset, AssetLoadingConfig} from './types.js';

// Подключаем fallback к общим helpers обычного и потокового рендера.
export function patchRenderHelpers(content: HeadContent, config: AssetLoadingConfig): void {
    const originalHelpers = {...content.helpers};
    const renderer = createAssetRenderer(originalHelpers, config, content);

    Object.assign(content.helpers, renderer);
}

function createAssetRenderer(
    helpers: RenderHelpers,
    config: AssetLoadingConfig,
    content: HeadContent,
) {
    let emitted = false;

    function bootstrap(): string {
        if (emitted) {
            return '';
        }
        emitted = true;
        return helpers.renderInlineScript(serializeBootstrap(config));
    }

    function renderAsset(asset: Asset): string {
        return bootstrap() + helpers.renderInlineScript(serializeAssetRegistration(asset));
    }

    return {
        renderScript(script: Script): string {
            const asset = createScriptAsset(script, config.publicPath);
            return asset ? renderAsset(asset) : helpers.renderScript(script);
        },
        renderStyle(style: Stylesheet): string {
            const asset = createStyleAsset(style, config.publicPath);
            return asset ? renderAsset(asset) : helpers.renderStyle(style);
        },
        renderLink(link: Link): string {
            if (!isManagedPreload(link, content.scripts, config.publicPath)) {
                return helpers.renderLink(link);
            }
            return (
                bootstrap() + helpers.renderLink({...link, 'data-app-layout-preload': ''} as Link)
            );
        },
    };
}
