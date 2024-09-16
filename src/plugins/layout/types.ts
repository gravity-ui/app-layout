interface EntrypointAssets {
    assets: {
        js: string[];
        'js.map': string[];
        css: string[];
    };
}

export type Manifest = Record<string, string> & {
    entrypoints?: Record<string, EntrypointAssets>;
};

export interface LayoutPluginOptions {
    name: string;
    prefix?: string;
    scriptsCrossOrigin?: '' | 'anonymous' | 'use-credentials';
    stylesCrossOrigin?: '' | 'anonymous' | 'use-credentials';
}
