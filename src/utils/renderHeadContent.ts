import escapeHTML from 'escape-html';

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

    const baseAttrs = base ? helpers.attrs({...base}) : '';

    return `
        <meta charset="utf-8">
        ${baseAttrs ? `<base ${baseAttrs}>` : ''}
        <title>${escapeHTML(title)}</title>
        ${[
            loader?.bootstrap() ?? '',
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
            ...styleSheets.map((style) => loader?.style(style) ?? helpers.renderStyle(style)),
            ...inlineStyleSheets.map((text) => helpers.renderInlineStyle(text)),
            ...scripts.map((script) => loader?.script(script) ?? helpers.renderScript(script)),
            ...inlineScripts.map((text) => helpers.renderInlineScript(text)),
        ]
            .filter(Boolean)
            .join('\n')}
    `.trim();
}
