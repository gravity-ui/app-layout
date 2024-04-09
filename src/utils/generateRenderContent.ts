import htmlescape from 'htmlescape';

import type {
    Attributes,
    BodyContent,
    Icon,
    Meta,
    Plugin,
    RenderContent,
    RenderParams,
} from '../types.js';
import {getRenderHelpers, hasProperty} from '../utils.js';

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
    const htmlAttributes: Attributes = {...params.htmlAttributes};
    const meta = [...(params.meta ?? [])];
    // in terms of sets: meta = params.meta ∪ (defaultMeta ∖ params.meta)
    defaultMeta.forEach((defaultMetaItem) => {
        if (!meta.find(({name}) => name === defaultMetaItem.name)) {
            meta.push(defaultMetaItem);
        }
    });
    const styleSheets = [...(params.styleSheets || [])];
    const scripts = [...(params.scripts || [])];
    const inlineStyleSheets = [...(params.inlineStyleSheets || [])];
    const inlineScripts = [...(params.inlineScripts || [])];
    const links = [...(params.links || [])];

    inlineScripts.unshift(`window.__DATA__ = ${htmlescape(params.data || {})};`);

    const content = params.bodyContent ?? {};
    const bodyContent: BodyContent = {
        attributes: {
            class: content.className,
            ...content.attributes,
        },
        root: content.root,
        beforeRoot: content.beforeRoot ? [content.beforeRoot] : [],
        afterRoot: content.afterRoot ? [content.afterRoot] : [],
    };

    const icon: Icon = {
        ...defaultIcon,
        ...params.icon,
    };

    if (icon.href) {
        links.unshift({rel: 'icon', type: icon.type, sizes: icon.sizes, href: icon.href});
    }

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
                helpers,
                title,
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
        helpers,
        title,
    };
}
