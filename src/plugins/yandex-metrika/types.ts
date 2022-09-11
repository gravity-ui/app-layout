export interface MetrikaCounter {
    id: number;
    defer: boolean;
    clickmap: boolean;
    trackLinks: boolean;
    accurateTrackBounce: boolean | number;
    webvisor?: boolean;
    nonce?: string;
    encryptedExperiments?: string;
    triggerEvent?: boolean;
    trackHash?: boolean;
    ecommerce?: boolean | string;
    type?: number;
}

export type PluginOptions = {
    /**
     * metrics script source
     *
     * @defaults https://mc.yandex.ru/metrika/tag.js
     */
    src?: string;
    counter: MetrikaCounter | MetrikaCounter[];
};

declare module '../../types.js' {
    export interface PluginsOptions {
        yandexMetrika: PluginOptions;
    }
}
