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
    hreflang?: HTMLLinkElement['hreflang'];
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
export interface Plugin<Options = any, Name extends string = string> {
    name: Name;
    apply: (params: {
        options: Options | undefined;
        renderContent: RenderContent;
        commonOptions: CommonOptions;
        utils: RenderHelpers;
    }) => void;
}
export interface RenderParams<Data, Plugins extends Plugin[] = []> extends CommonOptions {
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
    bodyContent?: {
        className?: string;
        beforeRoot?: string;
        root?: string;
        afterRoot?: string;
    };
    // plugins options
    pluginsOptions?: Partial<PluginsOptions<Plugins>>;
}

type PluginOptions<PluginType> = PluginType extends {
    name: infer Name;
    apply(args: {options: infer Options}): void;
}
    ? {[K in Name & string]: Options}
    : {};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

type PluginsOptions<Plugins extends Plugin[]> = UnionToIntersection<PluginOptions<Plugins[number]>>;

export type RenderFunction<Plugins extends Plugin[] = []> = <Data>(
    params: RenderParams<Data, Plugins>,
) => string;
