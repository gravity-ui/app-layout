import type {RenderContent} from '../types.js';

export function renderHeadContent(content: RenderContent): string {
    const {
        icon,
        scripts,
        helpers,
        links,
        meta,
        styleSheets,
        inlineStyleSheets,
        inlineScripts,
        title,
    } = content;

    return `
        <meta charset="utf-8">
        <title>${title}</title>
        <link ${helpers.attrs({rel: 'icon', type: icon.type, sizes: icon.sizes, href: icon.href})}>
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
