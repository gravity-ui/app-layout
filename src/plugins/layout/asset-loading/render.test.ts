import {createRenderFunction} from '../../../render.js';
import {generateRenderContent} from '../../../utils/generateRenderContent.js';
import {renderHeadContent} from '../../../utils/renderHeadContent.js';
import {renderScripts} from '../../../utils/renderScripts.js';
import {createLayoutPlugin} from '../index.js';

const manifest = {'app.js': 'app.js', 'app.css': 'app.css'};
const params = {title: 'App', nonce: 'test-nonce', pluginsOptions: {layout: {name: 'app'}}};

test('emits bootstrap once before managed preloads and preserves unrelated scripts', () => {
    const render = createRenderFunction([
        createLayoutPlugin({manifest, publicPathFallbacks: ['/backup/']}),
    ]);
    const html = render({
        ...params,
        scripts: [
            {src: '/build/async.js', async: true},
            {src: '/build/module.js', defer: true, type: 'module'},
            {src: 'https://other.test/app.js', defer: true},
        ],
    });
    expect(html.match(/var appLayoutAssetLoader=/g)).toHaveLength(1);
    expect(html.indexOf('appLayoutAssetLoader')).toBeLessThan(
        html.indexOf('data-app-layout-preload'),
    );
    expect(html).toContain('<script src="/build/async.js"');
    expect(html).toContain('<script src="/build/module.js"');
    expect(html).toContain('<script src="https://other.test/app.js"');
    expect(html).toContain('<script nonce="test-nonce">');
    expect(render(params)).toContain('appLayoutAssetLoader');
});

test('disabled fallbacks preserve original HTML', () => {
    const original = createRenderFunction([createLayoutPlugin({manifest})])(params);
    expect(
        createRenderFunction([createLayoutPlugin({manifest, publicPathFallbacks: []})])(params),
    ).toBe(original);
});

test('streaming shares bootstrap state across different content objects without patching helpers', () => {
    const plugins = [createLayoutPlugin({manifest, publicPathFallbacks: ['/backup/']})];
    const content = generateRenderContent(plugins, params);
    const state = {};
    const plain = content.helpers.renderScript({src: '/build/first.js', defer: true});
    expect(plain).not.toContain('enqueue');
    const first = renderScripts(content, [{src: '/build/first.js', defer: true}], state);
    expect(first).toContain('appLayoutAssetLoader');
    expect(first).toContain('loader.enqueue');
    const next = generateRenderContent(plugins, params);
    expect(renderHeadContent(next, state)).not.toContain('appLayoutAssetLoader');
    expect(renderHeadContent(next)).toContain('appLayoutAssetLoader');
    expect(content.helpers.renderScript({src: '/build/first.js', defer: true})).toBe(plain);
});

test('registers all managed assets in one inline script and drops their original tags', () => {
    const render = createRenderFunction([
        createLayoutPlugin({manifest, publicPathFallbacks: ['/backup/']}),
    ]);
    const html = render({...params, scripts: [{src: '/build/extra.js', defer: true}]});
    expect(html.match(/var loader = window\.__APP_LAYOUT_ASSET_LOADER__/g)).toHaveLength(1);
    // Head order: stylesheets, then scripts in the order they were contributed.
    expect(html).toMatch(/"path":"app\.css"[^]*"path":"extra\.js"[^]*"path":"app\.js"/);
    expect(html).not.toContain('<link rel="stylesheet"');
    expect(html).not.toContain('<script src="/build/app.js"');
    expect(html).not.toContain('<script src="/build/extra.js"');
    expect(html.indexOf('"path":"app.css"')).toBeLessThan(
        html.indexOf('rel="preload" data-app-layout-preload=""'),
    );
});
