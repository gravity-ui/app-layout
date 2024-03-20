export {generateRenderContent} from './utils/generateRenderContent.js';
export {renderHeadContent} from './utils/renderHeadContent.js';
export {renderBodyContent} from './utils/renderBodyContent.js';
export {createRenderFunction} from './render.js';
export {
    createGoogleAnalyticsPlugin,
    createYandexMetrikaPlugin,
    createLayoutPlugin,
    createUikitPlugin,
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

export type {
    MetrikaCounter,
    MetrikaPluginOptions,
    UserParams,
} from './plugins/yandex-metrika/index.js';
export type {
    GoogleAnalyticsCounter,
    GoogleAnalyticsPluginOptions,
} from './plugins/google-analytics/index.js';
export type {LayoutPluginOptions, Manifest} from './plugins/layout/index.js';
export type {UikitPluginOptions} from './plugins/uikit/index.js';
