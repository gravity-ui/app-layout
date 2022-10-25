import type {GoogleAnalyticsPluginOptions} from './types.js';
import type {Plugin, RenderHelpers} from '../../types.js';

export type {GoogleAnalyticsCounter, GoogleAnalyticsPluginOptions} from './types.js';

export function createGoogleAnalyticsPlugin(): Plugin<
    GoogleAnalyticsPluginOptions,
    'googleAnalytics'
> {
    return {
        name: 'googleAnalytics',
        apply({options, renderContent, utils}) {
            if (!options || !options.counter) {
                return;
            }

            renderContent.bodyContent.afterRoot.push(renderGoogleAnalyticsCounter(options, utils));
        },
    };
}

function renderGoogleAnalyticsCounter(
    params: GoogleAnalyticsPluginOptions,
    utils: RenderHelpers,
): string {
    const counter = params.counter;
    const counterId = counter.id;

    if (!counterId) {
        throw new Error('Google counter id should be specified');
    }

    const useBeaconCode = params.useBeaconTransport ? ", {'transport_type': 'beacon'}" : '';

    return `
        <!-- Google Analytics -->
        ${utils.renderScript({
            async: true,
            src: `https://www.googletagmanager.com/gtag/js?id=${counterId}`,
        })}
        ${utils.renderInlineScript(
            `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${counterId}'${useBeaconCode});`,
        )}
        <!-- /Google Analytics -->
    `;
}
