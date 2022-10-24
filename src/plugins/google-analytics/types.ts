export interface GoogleAnalyticsCounter {
    id: string;
}

export interface GoogleAnalyticsOptions {
    useBeaconTransport?: boolean;
    counter: GoogleAnalyticsCounter;
}
