import {
    createDefaultPlugins,
    createRenderFunction,
    createGoogleAnalyticsPlugin,
    createYandexMetrikaPlugin,
} from './index.js';

import type {LayoutInitOptions} from './plugins/layout/index.js';

export function createDefaultRenderFunction({layout}: {layout: LayoutInitOptions}) {
    const plugins = createDefaultPlugins({layout});
    const renderFn = createRenderFunction(plugins);
    return renderFn;
}

const render = createDefaultRenderFunction({layout: {manifest: ''}});

render({
    title: 'Hello',
    bodyContent: {},
    pluginsOptions: {
        googleAnalytics: {
            counter: {id: 'g1'},
        },
        yandexMetrika: {
            counter: {
                id: 123,
                defer: false,
                clickmap: true,
                trackLinks: false,
                accurateTrackBounce: true,
            },
        },
        layout: {
            name: 'main',
            prefix: 'test',
        },
    },
});

const render2 = createRenderFunction([
    createGoogleAnalyticsPlugin(),
    createYandexMetrikaPlugin(),
] as const);

render2({
    title: 'World',
    bodyContent: {},
    pluginsOptions: {
        googleAnalytics: {
            counter: {id: 'g2'},
        },
    },
});
