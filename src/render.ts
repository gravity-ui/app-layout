import htmlescape from 'htmlescape';

import type {Icon, Meta, Plugin, RenderContent, RenderParams} from './types.js';
import {attrs, getRenderHelpers, hasProperty} from './utils.js';

function getRootClassName(theme?: string) {
    if (!theme) {
        return [];
    }
    const classes = ['g-root'];
    if (theme) {
        classes.push(`g-root_theme_${theme}`);
    }
    return classes;
}

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

/**
 * Generates the content to be rendered in an HTML page.
 * @param plugins - An array of plugins.
 * @param params - An object containing various parameters for rendering the content.
 * @returns An object containing the generated content for an HTML page.
 */
export function generateRenderContent<Plugins extends Plugin[], Data>(
    plugins: Plugins | undefined,
    params: RenderParams<Data, Plugins>,
): RenderContent {
    const helpers = getRenderHelpers(params);
    const htmlAttributes: Record<string, string> = {};
    const meta = params.meta ?? [];
    // in terms of sets: meta = params.meta ∪ (defaultMeta ∖ params.meta)
    defaultMeta.forEach((defaultMetaItem) => {
        if (!meta.find(({name}) => name === defaultMetaItem.name)) {
            meta.push(defaultMetaItem);
        }
    });
    const styleSheets = params.styleSheets || [];
    const scripts = params.scripts || [];
    const inlineStyleSheets = params.inlineStyleSheets || [];
    const inlineScripts = params.inlineScripts || [];
    const links = params.links || [];

    inlineScripts.unshift(`window.__DATA__ = ${htmlescape(params.data || {})};`);

    const content = params.bodyContent ?? {};
    const {theme, className} = content;
    const bodyClasses = Array.from(
        new Set([...getRootClassName(theme), ...(className ? className.split(' ') : [])]),
    );
    const bodyContent = {
        className: bodyClasses,
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

    if (lang) {
        htmlAttributes.lang = lang;
    }

    return {
        htmlAttributes,
        meta,
        links,
        styleSheets,
        scripts,
        inlineStyleSheets,
        inlineScripts,
        bodyContent,
    };
}

export function createRenderFunction<Plugins extends Plugin[]>(plugins?: Plugins) {
    return function render<Data>(params: RenderParams<Data, Plugins>) {
        const {
            htmlAttributes,
            meta,
            styleSheets,
            scripts,
            inlineStyleSheets,
            inlineScripts,
            links,
            bodyContent,
        } = generateRenderContent(plugins, params);

        const helpers = getRenderHelpers(params);

        const icon: Icon = {
            ...defaultIcon,
            ...params.icon,
        };

        return `
<!DOCTYPE html>
<html ${attrs({...htmlAttributes})}>
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
        ${bodyContent.root ?? ''}
    </div>
    ${bodyContent.afterRoot.join('\n')}
</body>
</html>
    `.trim();
    };
}
