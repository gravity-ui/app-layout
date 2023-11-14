type UserParams = {
    [x: string]: boolean | string | number | null | UserParams;
};

export interface MetrikaCounter {
    id: number;
    /** @default false */
    defer?: boolean;
    /** @default true */
    clickmap?: boolean;
    /** @default true */
    trackLinks?: boolean;
    /** @default true */
    accurateTrackBounce?: boolean | number;
    /** @default false */
    webvisor?: boolean;
    nonce?: string;
    encryptedExperiments?: string;
    /** @default false */
    triggerEvent?: boolean;
    /** @default false */
    trackHash?: boolean;
    /** @default false */
    ecommerce?: boolean | string;
    /** @default 0 */
    type?: number;
    /** @default {} */
    userParams?: UserParams;
}

export type MetrikaPluginOptions = {
    /**
     * metrics script source
     *
     * @defaults https://mc.yandex.ru/metrika/tag.js
     */
    src?: string;
    counter: MetrikaCounter | MetrikaCounter[];
};
