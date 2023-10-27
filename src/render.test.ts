import type {Plugin} from './types.js';
import {createRenderFunction} from './render.js';

function dirPlugin(): Plugin<void> {
    return {
        name: 'dirPlugin',
        apply({renderContent: {htmlAttributes}}) {
            htmlAttributes.dir = 'ltr';
        },
    };
}

test('should allow `<html>` attributes override', () => {
    expect(createRenderFunction()({title: 'Foobar'})).toMatch('<html>');
    expect(createRenderFunction([dirPlugin()])({title: 'Foobar'})).toMatch('<html dir="ltr">');
});

test('should allow `<body>` attributes override', () => {
    expect(createRenderFunction()({title: 'Foobar'})).toMatch('<body>');
    expect(createRenderFunction()({title: 'Foobar', bodyAttributes: {dir: 'ltr'}})).toMatch(
        '<body dir="ltr">',
    );
});

test('should render root content', () => {
    expect(createRenderFunction()({title: 'Foobar'})).toMatch(/<div id="root">\s*<\/div>/);
    expect(createRenderFunction()({title: 'Foobar', bodyContent: {root: 'content'}})).toMatch(
        /<div id="root">\s*content\s*<\/div>/,
    );
    expect(createRenderFunction()({title: 'Foobar', body: '<div id="root">content</div>'})).toMatch(
        /<div id="root">content<\/div>/,
    );
});
