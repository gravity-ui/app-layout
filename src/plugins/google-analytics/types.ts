export interface GoogleAnalyticsCounter {
    id: string;
}

export interface PluginOptions {
    useBeaconTransport?: boolean;
    counter: GoogleAnalyticsCounter;
}

declare module '../../types.js' {
    export interface PluginsOptions {
        googleAnalytics: PluginOptions;
    }
}
