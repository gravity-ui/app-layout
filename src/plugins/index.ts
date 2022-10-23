import {createGoogleAnalyticsPlugin} from './google-analytics/index.js';
import {createYandexMetrikaPlugin} from './yandex-metrika/index.js';
import {createLayoutPlugin, LayoutInitOptions} from './layout/index.js';

export function createDefaultPlugins({layout}: {layout: LayoutInitOptions}) {
    return [
        createGoogleAnalyticsPlugin(),
        createYandexMetrikaPlugin(),
        createLayoutPlugin(layout),
    ] as const;
}

export {createGoogleAnalyticsPlugin, createYandexMetrikaPlugin, createLayoutPlugin};
