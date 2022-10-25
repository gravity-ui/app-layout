import type {Plugin, RenderHelpers} from '../../types.js';
import type {MetrikaPluginOptions} from './types.js';

export type {MetrikaCounter, MetrikaPluginOptions} from './types.js';

export function createYandexMetrikaPlugin(): Plugin<MetrikaPluginOptions, 'yandexMetrika'> {
    return {
        name: 'yandexMetrika',
        apply({options, renderContent, utils}) {
            if (!options || !options.counter) {
                return;
            }

            renderContent.bodyContent.afterRoot.push(renderMetrika(options, utils));
        },
    };
}

const defaultCounterConfig = {
    defer: false,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
    triggerEvent: false,
    trackHash: false,
    ecommerce: false,
    type: 0,
};

export function renderMetrika(params: MetrikaPluginOptions, utils: RenderHelpers): string {
    let counters = params.counter;
    if (!Array.isArray(counters)) {
        counters = [counters];
    }

    counters = counters.map((config) => Object.assign({}, defaultCounterConfig, config || {}));

    if (counters.some((config) => !config.id)) {
        throw new Error('Counter id should be specified');
    }

    const webvisorCount = counters.reduce((acc, config) => acc + (config.webvisor ? 1 : 0), 0);
    if (webvisorCount > 1) {
        throw new Error('Webvisor cannot be specified in more than one counter');
    }

    return `
        <!-- Yandex.Metrika counter -->
        ${utils.renderInlineScript(`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "${
                params.src || 'https://mc.yandex.ru/metrika/tag.js'
            }", "ym");

            try {
            ${counters
                .map(
                    (config) => `
                ym(${config.id}, "init", {
                    defer: ${Boolean(config.defer)},
                    clickmap: ${Boolean(config.clickmap)},
                    trackLinks: ${Boolean(config.trackLinks)},
                    accurateTrackBounce: ${config.accurateTrackBounce},
                    webvisor: ${Boolean(config.webvisor)},
                    triggerEvent: ${Boolean(config.triggerEvent)},
                    trackHash: ${Boolean(config.trackHash)},
                    ecommerce: ${config.ecommerce},
                    type: ${Number(config.type)},
                    experiments: "${config.encryptedExperiments || ''}"
                });
            `,
                )
                .join('\n')}
            } catch(e) {}

            ${counters
                .filter((config) => config.triggerEvent)
                .map(
                    (config) => `
                document.addEventListener('yacounter${config.id}inited', function () {
                    if (typeof window.yaCounter${config.id}Callback === 'function') {
                        window.yaCounter${config.id}Callback();
                    }

                    delete window.yaCounter${config.id}Callback;
                });
            `,
                )
                .join('\n')}
        `)}
        <noscript>
            <div>
                ${counters
                    .map(
                        (config) => `
                <img src="https://mc.yandex.ru/watch/${config.id}" style="position:absolute; left:-9999px;" alt="" />
                `,
                    )
                    .join('\n')}
            </div>
        </noscript>
        <!-- /Yandex.Metrika counter -->
    `;
}
