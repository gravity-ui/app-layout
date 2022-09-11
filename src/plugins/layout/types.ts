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

export interface PluginOptions {
    name: string;
    prefix?: string;
}

declare module '../../types.js' {
    export interface PluginsOptions {
        layout: PluginOptions;
    }
}
