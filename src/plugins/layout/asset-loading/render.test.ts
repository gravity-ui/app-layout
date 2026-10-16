import {createRenderFunction} from '../../../render.js';
import {generateRenderContent} from '../../../utils/generateRenderContent.js';
import {renderHeadContent} from '../../../utils/renderHeadContent.js';
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
    expect(html.match(/function installAssetLoader/g)).toHaveLength(1);
    expect(html.indexOf('function installAssetLoader')).toBeLessThan(
        html.indexOf('data-app-layout-preload'),
    );
    expect(html).toContain('<script src="/build/async.js"');
    expect(html).toContain('<script src="/build/module.js"');
    expect(html).toContain('<script src="https://other.test/app.js"');
    expect(html).toContain('<script nonce="test-nonce">');
    expect(render(params)).toContain('function installAssetLoader');
});

test('disabled fallbacks preserve original HTML', () => {
    const original = createRenderFunction([createLayoutPlugin({manifest})])(params);
    expect(
        createRenderFunction([createLayoutPlugin({manifest, publicPathFallbacks: []})])(params),
    ).toBe(original);
});

test('streaming helpers share bootstrap state with head rendering', () => {
    const content = generateRenderContent(
        [createLayoutPlugin({manifest, publicPathFallbacks: ['/backup/']})],
        params,
    );
    const first = content.helpers.renderStyle({href: '/build/first.css'});
    expect(first).toContain('function installAssetLoader');
    expect(renderHeadContent(content)).not.toContain('function installAssetLoader');
});
