export {generateRenderContent} from './utils/generateRenderContent.js';
export {renderHeadContent} from './utils/renderHeadContent.js';
export {renderBodyContent} from './utils/renderBodyContent.js';
export {createRenderFunction} from './render.js';
export {
    createGoogleAnalyticsPlugin,
    createYandexMetrikaPlugin,
    createLayoutPlugin,
    createUikitPlugin,
    createRemoteVersionsPlugin,
    createIncompatibleWarningPlugin,
    createDefaultPlugins,
} from './plugins/index.js';
export {
    INCOMPATIBLE_COOKIE,
    defaultIncompatibleWarningTranslationMap,
} from './plugins/incompatible-warning/index.js';
export type {
    BrowserInfo,
    IncompatibleI18n,
    IncompatibleOptions,
    ServiceIcon,
    ServiceIconImage,
    ServiceIconSvg,
    TechnicalInfo,
    TechnicalInfoItem,
} from './plugins/incompatible-warning/index.js';

export type {
    Base,
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
export type {LayoutPluginOptions, Manifest, LayoutInitOptions} from './plugins/layout/index.js';
export type {UikitPluginOptions} from './plugins/uikit/index.js';
export type {RemoteVersionsPluginOptions} from './plugins/remote-versions/index.js';
