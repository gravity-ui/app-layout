import htmlescape from 'htmlescape';

import type {Plugin} from '../../types.js';

import {
    INCOMPATIBLE_BUTTON_CLASS,
    INCOMPATIBLE_COOKIE,
    INCOMPATIBLE_COOKIE_EXPIRED,
} from './constants.js';
import {defaultIncompatibleWarningTranslationMap} from './defaultIncompatibleWarning.js';
import type {
    IncompatibleI18n,
    IncompatibleOptions,
    ServiceIcon,
    ServiceIconSvg,
    TechnicalInfo,
} from './types.js';
import {getWarningStyleSheet, getWarningTemplate} from './warningTemplate.js';

export {INCOMPATIBLE_COOKIE} from './constants.js';
export {defaultIncompatibleWarningTranslationMap} from './defaultIncompatibleWarning.js';
export type {
    BrowserInfo,
    IncompatibleI18n,
    IncompatibleOptions,
    ServiceIcon,
    ServiceIconImage,
    ServiceIconSvg,
    TechnicalInfo,
    TechnicalInfoItem,
} from './types.js';

type WarningTemplateLink = NonNullable<Parameters<typeof getWarningTemplate>[0]['links']>[number];
type CurrentBrowserTooltip = NonNullable<WarningTemplateLink['currentTooltip']>;
type CurrentBrowserTooltipI18n = NonNullable<IncompatibleI18n[string]['currentBrowserTooltip']>;

export function createIncompatibleWarningPlugin(): Plugin<
    IncompatibleOptions,
    'incompatibleWarning'
> {
    return {
        name: 'incompatibleWarning',
        apply({options, renderContent, commonOptions}) {
            if (!options?.enable) {
                return;
            }

            const {
                backgroundImgUrl,
                inlineStyleSheets: extraInlineStyleSheets,
                translationMap: translationMapInput,
                serviceIcon: serviceIconInput,
                technicalInfo: technicalInfoInput,
                browser: currentBrowser,
                serviceName: serviceNameInput,
            } = options;
            const {title, lang, isMobile} = commonOptions;

            const translationMap = translationMapInput ?? defaultIncompatibleWarningTranslationMap;
            const warningLang = lang && lang in translationMap ? lang : 'en';
            const text = translationMap[warningLang] ?? translationMap.en;

            if (!text) {
                throw new Error('Incompatible warning translation map must contain an "en" entry');
            }

            // Single source of truth for the service name across header, icon alt, and description.
            const serviceName = serviceNameInput?.trim() || undefined;
            const serviceNameForHeader = serviceName ? htmlescape.sanitize(serviceName) : undefined;
            const serviceIconForHeader = serviceIconInput
                ? mapServiceIconForHeader(serviceIconInput, serviceName ?? title)
                : undefined;

            const root = getWarningTemplate({
                title: text.title,
                description: applyServiceName(text.description, serviceName),
                serviceName: serviceNameForHeader,
                serviceIcon: serviceIconForHeader,
                links: text.browsers.map((browser) => {
                    const isCurrent = isMatchingBrowserCaption(
                        browser.caption,
                        currentBrowser?.name,
                    );
                    return {
                        ...browser,
                        isCurrent,
                        currentTooltip: isCurrent
                            ? buildCurrentBrowserTooltip(
                                  text.currentBrowserTooltip,
                                  currentBrowser?.version,
                                  browser.caption,
                                  browser.href,
                              )
                            : undefined,
                    };
                }),
                technicalInfo: mapTechnicalInfo(technicalInfoInput),
                action: {
                    caption: text.action,
                    className: INCOMPATIBLE_BUTTON_CLASS,
                },
            });

            renderContent.styleSheets.length = 0;
            renderContent.scripts.length = 0;
            renderContent.inlineStyleSheets.length = 0;
            renderContent.inlineScripts.length = 0;
            renderContent.bodyContent.beforeRoot.length = 0;
            renderContent.bodyContent.afterRoot.length = 0;

            renderContent.inlineStyleSheets.push(getWarningStyleSheet(isMobile, backgroundImgUrl));
            if (extraInlineStyleSheets?.length) {
                renderContent.inlineStyleSheets.push(...extraInlineStyleSheets);
            }

            renderContent.inlineScripts.push(getInlineScript());
            renderContent.bodyContent.root = root;

            return false;
        },
    };
}

function isServiceIconSvg(icon: ServiceIcon): icon is ServiceIconSvg {
    return 'svg' in icon && typeof icon.svg === 'string';
}

/**
 * Substitutes the `{{serviceName}}` placeholder in the description with the given service name.
 * When the name is non-empty, the placeholder is replaced verbatim with `<strong>name</strong>`
 * (the surrounding whitespace from the translation copy is preserved as-is).
 * When the name is empty, the placeholder along with adjacent whitespace is removed and
 * spacing is normalized so that the sentence reads naturally regardless of whether the original
 * copy had a leading/trailing space around the placeholder.
 * The substituted value is wrapped in `<strong>` to highlight the service name in the warning copy
 * — `description` is therefore inserted into the template as HTML.
 * @param description Raw description string from the translation map.
 * @param serviceName Pre-normalized (already trimmed) service name; `undefined` when not provided.
 * @returns Description with the placeholder replaced.
 */
function applyServiceName(description: string, serviceName: string | undefined): string {
    if (!serviceName) {
        return description
            .replace(/\s*\{\{serviceName\}\}\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    return description.replace(
        /\{\{serviceName\}\}/g,
        `<strong>${htmlescape.sanitize(serviceName)}</strong>`,
    );
}

/**
 * Returns `true` when the localized browser caption corresponds to the user's current browser.
 * Matching is case-insensitive and word-based, which lets short UA names like `Chrome` match
 * captions like `Google Chrome`, `Edge` match `Microsoft Edge`, `Yandex` match `Yandex Browser`,
 * while keeping unrelated entries (`Firefox`, `Safari`, `Opera`) distinct.
 * @param caption Localized browser caption from the incompatible-browser links list.
 * @param browserName Browser name detected from the current user agent.
 * @returns `true` when `caption` matches `browserName`; otherwise `false`.
 */
function isMatchingBrowserCaption(caption: string, browserName: string | undefined): boolean {
    if (!browserName) {
        return false;
    }

    const captionWords = new Set(caption.toLowerCase().split(/\s+/).filter(Boolean));
    const nameWords = browserName.toLowerCase().split(/\s+/).filter(Boolean);

    return nameWords.some((word) => captionWords.has(word));
}

/**
 * Builds the popup copy shown on hover over the current-browser warning icon.
 * The version is sanitized because it may ultimately originate from the user-agent string.
 * @param copy Localized popup strings from the translation map.
 * @param version Detected browser version; when missing, the popup is not rendered.
 * @param browserName Localized name for the current browser (the matching row’s `caption`).
 * @param actionHref URL the popup action button points to (typically the current browser's update link).
 * @returns Pre-sanitized popup data, or `undefined` when translations or the version are missing.
 */
function buildCurrentBrowserTooltip(
    copy: CurrentBrowserTooltipI18n | undefined,
    version: string | undefined,
    browserName: string,
    actionHref: string,
): CurrentBrowserTooltip | undefined {
    if (!copy || !version) {
        return undefined;
    }

    const safeVersion = htmlescape.sanitize(version);
    const actionCaption = copy.action.replace('{{browserName}}', browserName);

    return {
        title: copy.title.replace('{{version}}', safeVersion),
        description: htmlescape.sanitize(copy.description),
        action: {
            caption: htmlescape.sanitize(actionCaption),
            href: escapeHtmlAttributeValue(actionHref),
        },
    };
}

function mapTechnicalInfo(
    info: TechnicalInfo | undefined,
): Array<{label: string; value: string}> | undefined {
    if (!info || !info.length) {
        return undefined;
    }

    const rows = info.reduce<Array<{label: string; value: string}>>((acc, {label, value}) => {
        if (typeof value !== 'string' || !value.trim()) {
            return acc;
        }
        acc.push({
            label: htmlescape.sanitize(label ?? ''),
            value: htmlescape.sanitize(value),
        });
        return acc;
    }, []);

    return rows.length ? rows : undefined;
}

/**
 * Escapes a string for use inside double-quoted HTML attributes.
 * @param value Raw text
 * @returns Escaped attribute fragment
 */
function escapeHtmlAttributeValue(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Builds the icon descriptor consumed by `getWarningTemplate` from the user-supplied service icon.
 * @param icon Service icon descriptor (image or inline SVG) from plugin options.
 * @param altFallback Alt text used when `icon.alt` is omitted. The caller picks the fallback
 * (typically the trimmed `serviceName`, falling back to the page title when no service name is set).
 * @returns Pre-sanitized icon descriptor, or `undefined` when the icon has no usable source.
 */
function mapServiceIconForHeader(
    icon: ServiceIcon,
    altFallback: string,
):
    | {kind: 'image'; href: string; alt: string}
    | {kind: 'svg'; svg: string; alt: string}
    | undefined {
    const altSource = icon.alt ?? altFallback;
    const alt = escapeHtmlAttributeValue(altSource);

    if (isServiceIconSvg(icon)) {
        const markup = icon.svg.trim();
        if (!markup) {
            return undefined;
        }
        return {kind: 'svg', svg: markup, alt};
    }

    const href = icon.href.trim();
    if (!href) {
        return undefined;
    }

    return {kind: 'image', href: escapeHtmlAttributeValue(href), alt};
}

function getInlineScript(): string {
    return `
    document.addEventListener('DOMContentLoaded', function() {
        var button = document.querySelector('.${INCOMPATIBLE_BUTTON_CLASS}');

        if (button) {
            button.addEventListener('click', function() {
                document.cookie = '${INCOMPATIBLE_COOKIE}=1; max-age=${INCOMPATIBLE_COOKIE_EXPIRED}; path=/';
                window.location.reload();
            });
        }
    });
`;
}
