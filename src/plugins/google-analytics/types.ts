export interface GoogleAnalyticsCounter {
    id: string;
}

export interface GoogleAnalyticsPluginOptions {
    useBeaconTransport?: boolean;
    counter: GoogleAnalyticsCounter;
    defaultConsent?: {
        adStorage?: 'denied' | 'granted';
        analyticsStorage?: 'denied' | 'granted';
        waitForUpdate?: number;
    };
}
