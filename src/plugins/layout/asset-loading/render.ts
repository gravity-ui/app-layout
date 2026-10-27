import type {AssetRenderState, RenderHelpers, Script, Stylesheet} from '../../../types.js';

import {createScriptAsset, createStyleAsset} from './assets.js';
import {serializeAssetRegistrations, serializeBootstrap} from './serialization.js';
import type {Asset, AssetLoadingConfig} from './types.js';

export type StyleRenderDecision = {action: 'render'; dataId?: string} | {action: 'skip'};

/** Asset registration and render decisions for one fragment. */
export interface AssetBatch {
    html: string;
    hasScript(script: Script): boolean;
    /** Allows each managed stylesheet to render once; unmanaged styles are always rendered. */
    takeStyle(style: Stylesheet): StyleRenderDecision;
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
            const managedScripts = new Set<Script>();
            const managedStyles = new Map<string, StyleRenderDecision>();
            const assets: Asset[] = [];

            for (const style of styles) {
                const asset = createStyleAsset(style, config.publicPath);
                if (!asset || managedStyles.has(style.href)) {
                    continue;
                }

                const nativeAsset = {...asset, dataId: String(managedStyles.size)};
                assets.push(nativeAsset);
                managedStyles.set(style.href, {action: 'render', dataId: nativeAsset.dataId});
            }

            for (const script of scripts) {
                const asset = createScriptAsset(script, config.publicPath);
                if (asset) {
                    managedScripts.add(script);
                    assets.push(asset);
                }
            }

            return {
                html: assets.length
                    ? helpers.renderInlineScript(
                          serializeAssetRegistrations(assets, config.publicPath),
                      )
                    : '',
                hasScript: (script) => managedScripts.has(script),
                takeStyle(style) {
                    const decision = managedStyles.get(style.href);
                    if (!decision) {
                        return {action: 'render'};
                    }
                    managedStyles.set(style.href, {action: 'skip'});
                    return decision;
                },
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
