import {createGoogleAnalyticsPlugin} from './google-analytics/index.js';
import {createLayoutPlugin} from './layout/index.js';
import type {LayoutInitOptions} from './layout/index.js';
import {createYandexMetrikaPlugin} from './yandex-metrika/index.js';

export function createDefaultPlugins({layout}: {layout: LayoutInitOptions}) {
    return [createGoogleAnalyticsPlugin(), createYandexMetrikaPlugin(), createLayoutPlugin(layout)];
}

export {createGoogleAnalyticsPlugin, createYandexMetrikaPlugin, createLayoutPlugin};
