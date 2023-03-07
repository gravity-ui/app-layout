import htmlescape from 'htmlescape';
import {attrs, getRenderHelpers, hasProperty} from './utils.js';
import type {Icon, Meta, RenderParams, Plugin} from './types.js';

const defaultIcon: Icon = {
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon.png',
};

const defaultMeta: Meta[] = [
    {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
    },
];

export function createRenderFunction<Plugins extends Plugin[]>(plugins?: Plugins) {
    return function render<Data>(params: RenderParams<Data, Plugins>) {
        const helpers = getRenderHelpers(params);

        const htmlAttributes = {};
        const icon: Icon = {
            ...defaultIcon,
            ...params.icon,
        };
        const meta = [...defaultMeta, ...(params.meta ?? [])];
        const styleSheets = params.styleSheets || [];
        const scripts = params.scripts || [];
        const inlineStyleSheets = params.inlineStyleSheets || [];
        const inlineScripts = params.inlineScripts || [];
        const links = params.links || [];

        inlineScripts.unshift(`window.__DATA__ = ${htmlescape(params.data || {})};`);

        const content = params.bodyContent ?? {};
        const bodyContent = {
            className: content.className ? [content.className] : [],
            root: content.root,
            beforeRoot: content.beforeRoot ? [content.beforeRoot] : [],
            afterRoot: content.afterRoot ? [content.afterRoot] : [],
        };

        const {lang, isMobile, title, pluginsOptions = {}} = params;
        for (const plugin of plugins ?? []) {
            plugin.apply({
                options: hasProperty(pluginsOptions, plugin.name)
                    ? pluginsOptions[plugin.name]
                    : undefined,
                renderContent: {
                    htmlAttributes,
                    meta,
                    links,
                    styleSheets,
                    scripts,
                    inlineStyleSheets,
                    inlineScripts,
                    bodyContent,
                },
                commonOptions: {title, lang, isMobile},
                utils: helpers,
            });
        }

        return `
<!DOCTYPE html>
<html ${attrs({...htmlAttributes, lang})}>
<head>
    <meta charset="utf-8">
    <title>${params.title}</title>
    <link ${attrs({rel: 'icon', type: icon.type, sizes: icon.sizes, href: icon.href})}>
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
</head>
<body ${attrs({class: bodyContent.className.filter(Boolean).join(' ')})}>
    ${bodyContent.beforeRoot.join('\n')}
    <div id="root">
        ${bodyContent.root}
    </div>
    ${bodyContent.afterRoot.join('\n')}
</body>
</html>
    `.trim();
    };
}
