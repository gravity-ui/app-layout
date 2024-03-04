import htmlescape from 'htmlescape';

import type {BodyContent, Icon, Meta, Plugin, RenderContent, RenderParams} from '../types.js';
import {getRenderHelpers, hasProperty} from '../utils.js';

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

    if (!params.skipRenderDataScript) {
        inlineScripts.unshift(`window.__DATA__ = ${htmlescape(params.data || {})};`);
    }

    const content = params.bodyContent ?? {};
    const {theme, className} = content;
    const bodyClasses = Array.from(
        new Set([...getRootClassName(theme), ...(className ? className.split(' ') : [])]),
    );
    const bodyContent: BodyContent = {
        attributes: {
            class: bodyClasses.filter(Boolean).join(' '),
        },
        className: bodyClasses,
        root: content.root,
        beforeRoot: content.beforeRoot ? [content.beforeRoot] : [],
        afterRoot: content.afterRoot ? [content.afterRoot] : [],
    };

    const icon: Icon = {
        ...defaultIcon,
        ...params.icon,
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
                helpers,
                icon,
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
        icon,
        title,
    };
}
