import escapeHTML from 'escape-html';

import type {StyleRenderDecision} from '../plugins/layout/asset-loading/render.js';
import {createAssetRenderer} from '../plugins/layout/asset-loading/render.js';
import type {AssetRenderState, HeadContent} from '../types.js';

export function renderHeadContent(content: HeadContent, state: AssetRenderState = {}): string {
    const {
        base,
        scripts,
        helpers,
        links,
        meta,
        styleSheets,
        inlineStyleSheets,
        inlineScripts,
        title,
    } = content;

    const loader = content.assetLoading
        ? createAssetRenderer(helpers, content.assetLoading, state)
        : undefined;

    // Register before native stylesheets: an inline script placed after a hanging
    // stylesheet could itself be blocked before installing the recovery handlers.
    const batch = loader?.register(styleSheets, scripts);
    const baseAttrs = base ? helpers.attrs({...base}) : '';

    return `
        <meta charset="utf-8">
        ${baseAttrs ? `<base ${baseAttrs}>` : ''}
        <title>${escapeHTML(title)}</title>
        ${[
            loader?.bootstrap() ?? '',
            batch?.html ?? '',
            ...scripts.map(
                (script) =>
                    loader?.preload(script) ??
                    helpers.renderLink({
                        href: script.src,
                        crossOrigin: script.crossOrigin,
                        rel: 'preload',
                        as: 'script',
                    }),
            ),
            ...links.map((link) => helpers.renderLink(link)),
            ...meta.map((metaData) => helpers.renderMeta(metaData)),
            ...styleSheets.map((style) => {
                const decision: StyleRenderDecision = batch?.takeStyle(style) ?? {action: 'render'};
                if (decision.action === 'skip') return '';
                return helpers.renderStyle({...style, dataId: decision.dataId});
            }),
            ...inlineStyleSheets.map((text) => helpers.renderInlineStyle(text)),
            ...scripts.map((script) =>
                batch?.hasScript(script) ? '' : helpers.renderScript(script),
            ),
            ...inlineScripts.map((text) => helpers.renderInlineScript(text)),
        ]
            .filter(Boolean)
            .join('\n')}
    `.trim();
}
