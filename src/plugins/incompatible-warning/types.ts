export type IncompatibleI18n = Record<
    string,
    {
        title: string;
        /**
         * Description text shown under the title.
         * Supports the `{{serviceName}}` placeholder, replaced with the value passed via
         * `IncompatibleOptions.serviceName` (or removed when the option is empty).
         */
        description: string;
        action: string;
        browsers: {
            caption: string;
            href: string;
        }[];
        /**
         * Copy for the popup shown on hover over the current-browser warning icon.
         * When omitted, the popup is not rendered (only the icon is shown).
         */
        currentBrowserTooltip?: {
            /** Title of the popup. Supports the `{{version}}` placeholder, replaced with the detected browser version. */
            title: string;
            description: string;
            /**
             * Button label. Supports `{{browserName}}`, replaced with the localized name of the current
             * browser row (the same as that row’s `caption`).
             */
            action: string;
        };
    }
>;

/** Raster logo in the incompatible warning header (24×24). */
export interface ServiceIconImage {
    href: string;
    /** Alternative text; falls back to the service name (or the page title when no service name is set) when omitted. */
    alt?: string;
    /** @deprecated Header logo is always 24×24; kept for backward compatibility. */
    width?: number;
    /** @deprecated See `width`. */
    height?: number;
}

/** Inline SVG in the header (24×24). Markup is inserted as-is — use only trusted SVG. */
export interface ServiceIconSvg {
    /** Full `<svg>...</svg>` or equivalent markup. */
    svg: string;
    /** Accessible name; falls back to the service name (or the page title when no service name is set) when omitted. */
    alt?: string;
}

export type ServiceIcon = ServiceIconImage | ServiceIconSvg;

/** A single row in the technical info block. */
export interface TechnicalInfoItem {
    label: string;
    value: string;
}

/**
 * Technical request/environment details rendered under the browser list.
 * Rendered in the given order; items with an empty `value` are skipped.
 */
export type TechnicalInfo = TechnicalInfoItem[];

/** Detected end-user browser. Used to display which browser triggered the stub page. */
export interface BrowserInfo {
    name: string;
    version: string;
}

export interface IncompatibleOptions {
    enable?: boolean;
    /** Optional URL of a background image used in the full-page (desktop) layout. When omitted, a neutral background color is used. */
    backgroundImgUrl?: string;
    inlineStyleSheets?: string[];
    /** When omitted, the built-in default translation map from `defaultIncompatibleWarning` is used. */
    translationMap?: IncompatibleI18n;
    /** Optional service logo in the card header (24×24, next to the page title). Omit to hide. */
    serviceIcon?: ServiceIcon;
    /** Technical request details shown between the browser list and the action button. */
    technicalInfo?: TechnicalInfo;
    /** Detected end-user browser name and version. */
    browser?: BrowserInfo;
    /**
     * Optional service name injected into the description via the `{{serviceName}}` placeholder.
     * For example, with `serviceName: 'Arcanum'` the default Russian copy becomes
     * "Некоторые функции сервиса Arcanum могут не работать…".
     * When omitted or empty, the placeholder is removed without leaving extra whitespace.
     */
    serviceName?: string;
}
