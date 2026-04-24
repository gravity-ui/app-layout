import {createGoogleAnalyticsPlugin} from './google-analytics/index.js';
import {createIncompatibleWarningPlugin} from './incompatible-warning/index.js';
import {createLayoutPlugin} from './layout/index.js';
import type {LayoutInitOptions} from './layout/index.js';
import {createRemoteVersionsPlugin} from './remote-versions/index.js';
import {createUikitPlugin} from './uikit/index.js';
import {createYandexMetrikaPlugin} from './yandex-metrika/index.js';

export function createDefaultPlugins({layout}: {layout: LayoutInitOptions}) {
    return [
        // Must run first: short-circuits the chain via `return false` to keep the stub page self-contained.
        createIncompatibleWarningPlugin(),
        createGoogleAnalyticsPlugin(),
        createYandexMetrikaPlugin(),
        createUikitPlugin(),
        createLayoutPlugin(layout),
    ];
}

export {
    createGoogleAnalyticsPlugin,
    createYandexMetrikaPlugin,
    createLayoutPlugin,
    createUikitPlugin,
    createRemoteVersionsPlugin,
    createIncompatibleWarningPlugin,
};
