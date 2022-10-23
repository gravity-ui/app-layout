export type Attributes = Record<string, string | number | boolean | undefined>;

export interface Script {
    src: string;
    defer?: boolean;
    async?: boolean;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export interface Stylesheet {
    href: string;
}

export interface Link {
    as?: string;
    href: string;
    rel?: string;
    type?: string;
    title?: HTMLLinkElement['title'];
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export interface Icon {
    type?: string;
    sizes?: string;
    href?: string;
}

export type Meta = {name: string; content: string};

interface CommonOptions {
    title: string;
    lang?: string;
    isMobile?: boolean;
}

interface RenderContent {
    meta: Meta[];
    links: Link[];
    scripts: Script[];
    styleSheets: Stylesheet[];
    inlineScripts: string[];
    inlineStyleSheets: string[];
    bodyContent: {
        className: string[];
        beforeRoot: string[];
        root?: string;
        afterRoot: string[];
    };
}

export interface RenderHelpers {
    renderScript(script: Script): string;
    renderInlineScript(content: string): string;
    renderStyle(style: Stylesheet): string;
    renderInlineStyle(content: string): string;
    renderMeta(meta: Meta): string;
    renderLink(link: Link): string;
}
export interface Plugin<Options = any, K extends string = never> {
    name: K;
    apply: (params: {
        options: Options | undefined;
        renderContent: RenderContent;
        commonOptions: CommonOptions;
        utils: RenderHelpers;
    }) => void;
}

type InferPluginOptions<T> = T extends {name: infer K; apply: infer ApplyFn}
    ? K extends string
        ? ApplyFn extends (...args: infer Args) => any
            ? Args[0] extends {options: infer O}
                ? Record<K, O>
                : {}
            : {}
        : {}
    : {};

export type ArrayPluginOptions<T extends readonly [...items: any]> = First<T> & Rest<T>;

type First<T> = T extends readonly [f: infer F, ...r: any] ? InferPluginOptions<F> : {};
type Rest<T> = T extends readonly [first: any, ...rest: infer R] ? ArrayPluginOptions<R> : {};

export interface RenderParams<Data, PluginsOptions = unknown> extends CommonOptions {
    data?: Data;
    icon?: Icon;
    nonce?: string;
    // content
    meta?: Meta[];
    links?: Link[];
    scripts?: Script[];
    styleSheets?: Stylesheet[];
    inlineScripts?: string[];
    inlineStyleSheets?: string[];
    bodyContent: {
        className?: string;
        beforeRoot?: string;
        root?: string;
        afterRoot?: string;
    };
    // plugins options
    pluginsOptions?: Partial<PluginsOptions>;
}
