import {createGoogleAnalyticsPlugin} from './google-analytics/index.js';
import {createLayoutPlugin} from './layout/index.js';
import type {LayoutInitOptions} from './layout/index.js';
import {createUikitPlugin} from './uikit/index.js';
import {createYandexMetrikaPlugin} from './yandex-metrika/index.js';

export function createDefaultPlugins({layout}: {layout: LayoutInitOptions}) {
    return [
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
};
