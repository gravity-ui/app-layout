export interface GoogleAnalyticsCounter {
    id: string;
}

export interface GoogleAnalyticsPluginOptions {
    useBeaconTransport?: boolean;
    counter: GoogleAnalyticsCounter;
}
