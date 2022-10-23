export interface GoogleAnalyticsCounter {
    id: string;
}

export interface GoogleAnalytisCounterPluginOptions {
    useBeaconTransport?: boolean;
    counter: GoogleAnalyticsCounter;
}
