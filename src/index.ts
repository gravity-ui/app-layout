export {createRenderFunction, generateRenderContent} from './render.js';
export {
    createGoogleAnalyticsPlugin,
    createYandexMetrikaPlugin,
    createLayoutPlugin,
    createDefaultPlugins,
} from './plugins/index.js';

export type {
    Plugin,
    Icon,
    Link,
    Script,
    Stylesheet,
    Meta,
    RenderFunction,
    RenderHelpers,
    RenderParams,
} from './types.js';

export type {MetrikaCounter, MetrikaPluginOptions} from './plugins/yandex-metrika/index.js';
export type {
    GoogleAnalyticsCounter,
    GoogleAnalyticsPluginOptions,
} from './plugins/google-analytics/index.js';
export type {LayoutPluginOptions} from './plugins/layout/index.js';
