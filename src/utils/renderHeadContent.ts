import type {HeadContent} from '../types.js';

export function renderHeadContent(content: HeadContent): string {
    const {scripts, helpers, links, meta, styleSheets, inlineStyleSheets, inlineScripts, title} =
        content;

    return `
        <meta charset="utf-8">
        <title>${title}</title>
        ${[
            ...scripts.map(({src, crossOrigin}) =>
                helpers.renderLink({href: src, crossOrigin, rel: 'preload', as: 'script'}),
            ),
            ...links.map((link) => helpers.renderLink(link)),
            ...meta.map((metaData) => helpers.renderMeta(metaData)),
            ...styleSheets.map((style) => helpers.renderStyle(style)),
            ...inlineStyleSheets.map((text) => helpers.renderInlineStyle(text)),
            ...scripts.map((script) => helpers.renderScript(script)),
            ...inlineScripts.map((text) => helpers.renderInlineScript(text)),
        ]
            .filter(Boolean)
            .join('\n')}
    `.trim();
}
