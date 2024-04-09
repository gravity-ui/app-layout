import {createUikitPlugin} from './plugins/index.js';
import {createRenderFunction} from './render.js';
import type {Link, Meta, Plugin, Script, Stylesheet} from './types.js';

function dirPlugin(): Plugin<void> {
    return {
        name: 'dirPlugin',
        apply({renderContent: {htmlAttributes}}) {
            htmlAttributes.dir = 'ltr';
        },
    };
}

test('should allow `<html>` attributes override', () => {
    expect(createRenderFunction()({title: 'Foobar'})).toMatch('<html >');
    expect(createRenderFunction([dirPlugin()])({title: 'Foobar'})).toMatch('<html dir="ltr">');
});

test('should render root content', () => {
    expect(createRenderFunction()({title: 'Foobar'})).toMatch(/<div id="root">\s*<\/div>/);
    expect(createRenderFunction()({title: 'Foobar', bodyContent: {root: 'content'}})).toMatch(
        /<div id="root">\s*content\s*<\/div>/,
    );
});

test('should render body classes', () => {
    expect(
        createRenderFunction()({
            title: 'Foobar',
            bodyContent: {root: 'content', className: 'test'},
        }),
    ).toMatch(/<body class="test">\s*<div id="root">\s*content\s*<\/div>\s*<\/body>/);
    expect(
        createRenderFunction([createUikitPlugin()])({
            title: 'Foobar',
            bodyContent: {root: 'content'},
            pluginsOptions: {
                uikit: {theme: 'light'},
            },
        }),
    ).toMatch(
        /<body class="g-root g-root_theme_light">\s*<div id="root">\s*content\s*<\/div>\s*<\/body>/,
    );
    expect(
        createRenderFunction([createUikitPlugin()])({
            title: 'Foobar',
            bodyContent: {root: 'content', className: 'test'},
            pluginsOptions: {
                uikit: {theme: 'light'},
            },
        }),
    ).toMatch(
        /<body class="test g-root g-root_theme_light">\s*<div id="root">\s*content\s*<\/div>\s*<\/body>/,
    );
});

function modifyPlugin(): Plugin<void> {
    return {
        name: 'modifyPlugin',
        apply({
            renderContent: {meta, links, scripts, inlineScripts, styleSheets, inlineStyleSheets},
        }) {
            meta.push({name: 'test', content: 'test'});
            links.push({rel: 'test', href: 'test'});
            scripts.push({src: 'test.js'});
            inlineScripts.push('console.log("test")');
            styleSheets.push({href: 'test.css'});
            inlineStyleSheets.push('body { color: red; }');
        },
    };
}

test('should not modify users params', () => {
    const meta: Meta[] = [];
    const links: Link[] = [];
    const scripts: Script[] = [];
    const inlineScripts: string[] = [];
    const styleSheets: Stylesheet[] = [];
    const inlineStyleSheets: string[] = [];

    createRenderFunction([modifyPlugin()])({
        title: 'test',
        meta,
        links,
        scripts,
        inlineScripts,
        styleSheets,
        inlineStyleSheets,
    });

    expect(meta).toEqual([]);
    expect(links).toEqual([]);
    expect(scripts).toEqual([]);
    expect(inlineScripts).toEqual([]);
    expect(styleSheets).toEqual([]);
    expect(inlineStyleSheets).toEqual([]);
});
