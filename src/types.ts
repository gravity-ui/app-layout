export type Attributes = Record<string, string | number | boolean | undefined>;

export interface Script {
    src: string;
    defer?: boolean;
    async?: boolean;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
    type?: 'importmap' | 'module' | (string & {});
}

export interface Stylesheet {
    href: string;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export interface Link {
    as?: string;
    href: string;
    rel?: string;
    type?: string;
    sizes?: string;
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

export interface CommonOptions {
    title: string;
    lang?: string;
    isMobile?: boolean;
}

export interface HeadContent {
    scripts: Script[];
    helpers: RenderHelpers;
    links: Link[];
    meta: Meta[];
    styleSheets: Stylesheet[];
    inlineStyleSheets: string[];
    inlineScripts: string[];
    title: string;
}

export interface BodyContent {
    attributes: Attributes;
    beforeRoot: string[];
    root?: string;
    afterRoot: string[];
}

export interface RenderContent extends HeadContent {
    htmlAttributes: Attributes;
    bodyContent: BodyContent;
}

export interface RenderHelpers {
    renderScript(script: Script): string;
    renderInlineScript(content: string): string;
    renderStyle(style: Stylesheet): string;
    renderInlineStyle(content: string): string;
    renderMeta(meta: Meta): string;
    renderLink(link: Link): string;
    attrs(obj: Attributes): string;
}
export interface Plugin<Options = any, Name extends string = string> {
    name: Name;
    apply: (params: {
        options: Options | undefined;
        renderContent: RenderContent;
        commonOptions: CommonOptions;
        /** @deprecated use `renderContent.helpers` instead */
        utils: RenderHelpers;
    }) => void;
}
export interface RenderParams<Data, Plugins extends Plugin[] = []> extends CommonOptions {
    data?: Data;
    icon?: Icon;
    nonce?: string;
    // content
    htmlAttributes?: Attributes;
    meta?: Meta[];
    links?: Link[];
    scripts?: Script[];
    styleSheets?: Stylesheet[];
    inlineScripts?: string[];
    inlineStyleSheets?: string[];
    bodyContent?: {
        className?: string;
        attributes?: Attributes;
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
