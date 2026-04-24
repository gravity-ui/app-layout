const SERVICE_LOGO_SIZE = 24;

interface CurrentBrowserTooltipTemplate {
    /** Pre-sanitized HTML. */
    title: string;
    /** Pre-sanitized HTML. */
    description: string;
    action: {
        /** Pre-sanitized HTML. */
        caption: string;
        /** Pre-sanitized attribute value. */
        href: string;
    };
}

/**
 * Inline warning triangle (yellow) shown next to the link of the user's current browser.
 * When `tooltip` is provided, renders a CSS-only hover popup with version info and an update link.
 * @param tooltip Pre-sanitized popup copy; when omitted, only the warning icon is rendered.
 * @returns HTML markup for the icon (with an optional popup inside).
 */
const getCurrentBrowserWarningIconTemplate = (tooltip?: CurrentBrowserTooltipTemplate): string => {
    const tooltipTemplate = tooltip
        ? `
<span class="layout-warning__current-tip" role="tooltip">
    <span class="layout-warning__current-tip-title">${tooltip.title}</span>
    <span class="layout-warning__current-tip-description">${tooltip.description}</span>
    <a
        rel="noopener noreferrer"
        class="layout-warning__current-tip-action"
        href="${tooltip.action.href}"
    >${tooltip.action.caption}</a>
</span>
    `.trim()
        : '';

    return `
<span class="layout-warning__current-icon">
<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.35055 2.24584L1.66283 8.6246C1.37376 9.12461 1.73458 9.74998 2.31213 9.74998L9.68758 9.74998C10.2651 9.74998 10.6259 9.1246 10.3369 8.62461L6.64915 2.24584C6.36038 1.74634 5.63932 1.74634 5.35055 2.24584ZM7.62311 1.68277C6.90118 0.434031 5.09853 0.434029 4.3766 1.68277L0.688874 8.06154C-0.0337816 9.31154 0.868266 10.875 2.31213 10.875L9.68758 10.875C11.1314 10.875 12.0335 9.31154 11.3108 8.06154L7.62311 1.68277ZM5.99986 3.74999C6.31052 3.74999 6.56236 4.00183 6.56236 4.31249V5.81249C6.56236 6.12315 6.31052 6.37499 5.99986 6.37499C5.6892 6.37499 5.43736 6.12315 5.43736 5.81249V4.31249C5.43736 4.00183 5.6892 3.74999 5.99986 3.74999ZM6.74986 8.06249C6.74986 8.47671 6.41408 8.81249 5.99986 8.81249C5.58565 8.81249 5.24986 8.47671 5.24986 8.06249C5.24986 7.64828 5.58565 7.31249 5.99986 7.31249C6.41408 7.31249 6.74986 7.64828 6.74986 8.06249Z" fill="#C0600F"/>
</svg>
${tooltipTemplate}
</span>
`.trim();
};

interface WarningTemplateArgs {
    title: string;
    description: string;
    serviceName?: string;
    serviceIcon?:
        | {
              kind: 'image';
              href: string;
              alt: string;
          }
        | {
              kind: 'svg';
              svg: string;
              alt: string;
          };
    links?: Array<{
        href: string;
        caption: string;
        /** Marks the row that corresponds to the user's current browser; renders a warning icon. */
        isCurrent?: boolean;
        /** When provided along with `isCurrent`, renders a hover popup next to the warning icon. */
        currentTooltip?: CurrentBrowserTooltipTemplate;
    }>;
    technicalInfo?: Array<{
        label: string;
        value: string;
    }>;
    action?: {
        caption: string;
        className?: string;
    };
}

export const getWarningTemplate = ({
    title,
    serviceName,
    serviceIcon,
    description,
    links,
    technicalInfo,
    action,
}: WarningTemplateArgs) => {
    const showServiceHeader = Boolean(serviceIcon || serviceName);

    let serviceHeaderIconTemplate = '';
    if (serviceIcon) {
        if (serviceIcon.kind === 'svg') {
            if (serviceIcon.alt) {
                serviceHeaderIconTemplate = `
        <span
            class="layout-warning__service-logo layout-warning__service-logo_svg"
            role="img"
            aria-label="${serviceIcon.alt}"
        >
            ${serviceIcon.svg}
        </span>
    `.trim();
            } else {
                serviceHeaderIconTemplate = `
        <span class="layout-warning__service-logo layout-warning__service-logo_svg" aria-hidden="true">
            ${serviceIcon.svg}
        </span>
    `.trim();
            }
        } else {
            serviceHeaderIconTemplate = `
        <img
            class="layout-warning__service-logo"
            src="${serviceIcon.href}"
            alt="${serviceIcon.alt}"
            width="${SERVICE_LOGO_SIZE}"
            height="${SERVICE_LOGO_SIZE}"
        />
    `.trim();
        }
    }

    const serviceHeaderTitleTemplate = serviceName
        ? `
        <div class="layout-warning__service-name">
            ${serviceName}
        </div>
    `.trim()
        : '';

    const serviceHeaderTemplate = showServiceHeader
        ? `
        <div class="layout-warning__service-header">
            <div class="layout-warning__service-header-row">
                ${serviceHeaderIconTemplate}
                ${serviceHeaderTitleTemplate}
            </div>
        </div>
    `.trim()
        : '';

    const linkArrayTemplate =
        links && links.length
            ? `
        <ul class="layout-warning__links">
            ${links
                .map(
                    (browser) => `
            <li class="layout-warning__link-item">
                <a rel="noopener noreferrer" class="layout-warning__link" href="${browser.href}">
                    ${browser.caption}
                </a>
                ${browser.isCurrent ? getCurrentBrowserWarningIconTemplate(browser.currentTooltip) : ''}
            </li>
            `,
                )
                .join('')}
        </ul>
    `.trim()
            : '';

    const technicalInfoTemplate =
        technicalInfo && technicalInfo.length
            ? `
        <dl class="layout-warning__tech-info">
            ${technicalInfo
                .map(
                    (item) => `
            <div class="layout-warning__tech-info-row">
                <dt class="layout-warning__tech-info-label">${item.label}:</dt>
                <dd class="layout-warning__tech-info-value">${item.value}</dd>
            </div>
            `,
                )
                .join('')}
        </dl>
    `.trim()
            : '';

    const actionTemplate = action
        ? `
        <button type="button" class="layout-warning__action ${action.className || ''}">
            ${action.caption}
        </button>
    `.trim()
        : '';

    return `
<div class="layout-warning__container">
    <div class="layout-warning__info">
        ${serviceHeaderTemplate}
        <h2 class="layout-warning__title">
            ${title}
        </h2>
        <p class="layout-warning__description">
            ${description}
        </p>
        ${linkArrayTemplate}
        ${technicalInfoTemplate}
        ${actionTemplate}
    </div>
</div>
    `.trim();
};

export const getWarningStyleSheet = (isMobile = false, backgroundImgUrl?: string): string => {
    const desktopBackground = backgroundImgUrl
        ? `background: url(${backgroundImgUrl}) no-repeat;
    background-position: center;
    background-size: cover;`
        : `background-color: #f5f5f5;`;

    return `
@font-face {
    font-family: 'YS Text';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(https://yastatic.net/s3/home/fonts/ys/4/text-regular.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'YS Text';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url(https://yastatic.net/s3/home/fonts/ys/4/text-bold.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
body {
    font-family: 'YS Text', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    margin: 0;
}
.layout-warning__container {
    width: 100%;
    padding: 1px;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    position: relative;

    ${
        isMobile
            ? ''
            : `
    height: 800px;
    height: 100vh;
    ${desktopBackground}
    `
    }
}
.layout-warning__info {
    background: #fff;
    border-radius: 32px;
    padding: 20px 32px 32px 32px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 13px;
    line-height: 18px;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;

    ${
        isMobile
            ? ''
            : `
    width: 384px;
    -webkit-box-shadow: 0px 2px 52px rgba(0, 0, 0, 0.14);
            box-shadow: 0px 2px 52px rgba(0, 0, 0, 0.14);
    -webkit-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    position: absolute;
    max-width: 95%;
    `
    }
}

.layout-warning__service-header {
    margin-bottom: 20px;
}

.layout-warning__service-header-row {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    gap: 10px;
}
.layout-warning__service-logo {
    display: block;
    -ms-flex-negative: 0;
        flex-shrink: 0;
    width: ${SERVICE_LOGO_SIZE}px;
    height: ${SERVICE_LOGO_SIZE}px;
    -o-object-fit: contain;
       object-fit: contain;
}
.layout-warning__service-logo_svg {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
}
.layout-warning__service-logo_svg svg {
    display: block;
    width: 100%;
    height: 100%;
}
.layout-warning__service-name {
    font-weight: 600;
    font-size: 17px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.85);
}
.layout-warning__title {
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    margin: 0 0 12px;
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
}
.layout-warning__description {
    margin-top: 0;
    margin-bottom: 12px;
}
.layout-warning__links {
    width: 100%;
    padding: 0;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    margin-bottom: 4px;
    margin-top: 0;
    list-style: none;
}
.layout-warning__links::after {
    clear: both;
    display: block;
    content: '';
}
.layout-warning__link-item {
    margin-bottom: 8px;

    ${
        isMobile
            ? ''
            : `
    width: 50%;
    float: left;
    `
    }
}
.layout-warning__link {
    color: #4E79EB;
    text-decoration: none;
}
.layout-warning__current-icon {
    position: absolute;
    display: inline-block;
    margin-left: 8px;
    vertical-align: middle;
    line-height: 0;
    padding: 4px;
    border-radius: 4px;
    background-color: #FFDB4D4D;
    cursor: pointer;
}
.layout-warning__current-icon:hover {
    z-index: 2;
}
.layout-warning__current-icon svg {
    display: block;
}
.layout-warning__current-tip {
    position: absolute;
    top: 100%;
    left: 50%;
    margin-top: 4px;
    -webkit-transform: translateX(-10%);
        -ms-transform: translateX(-10%);
            transform: translateX(-10%);
    width: 282px;
    max-width: 90vw;
    padding: 16px;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    -webkit-box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    color: rgba(0, 0, 0, 0.85);
    font-size: 13px;
    line-height: 18px;
    text-align: left;
    z-index: 2;
    visibility: hidden;
    opacity: 0;
}
/*
 * Transparent "bridge" over the 8px gap between the icon and the popup so the
 * cursor never leaves the hover area while moving from one to the other — this
 * prevents the popup from flickering or closing unexpectedly.
 */
.layout-warning__current-tip::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 8px;
}
.layout-warning__current-icon:hover .layout-warning__current-tip {
    visibility: visible;
    opacity: 1;
}
.layout-warning__current-tip-title {
    display: block;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    margin-bottom: 12px;
    color: rgba(0, 0, 0, 0.85);
}
.layout-warning__current-tip-description {
    display: block;
    margin-bottom: 16px;
    color: rgba(0, 0, 0, 0.85);
}
.layout-warning__current-tip-action {
    display: block;
    width: 100%;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    padding: 10px 16px;
    background: #5282FF;
    color: #fff;
    text-decoration: none;
    text-align: center;
    border-radius: 8px;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
}
.layout-warning__current-tip-action:hover {
    background: #3D68D5;
}
.layout-warning__tech-info {
    margin: 0 0 20px;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);
    font-family: Menlo, 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
    font-size: 12px;
    line-height: 18px;
    word-break: break-all;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
}
.layout-warning__tech-info-row {
    display: block;
}
.layout-warning__tech-info-label {
    display: inline-block;
    margin:0;
}
.layout-warning__tech-info-value {
    display: inline;
    margin:0;
}
.layout-warning__action {
    border: 1px solid #5282FF;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    border-radius: 8px;
    padding: 9px 16px;
    background: #5282FF;
    cursor: pointer;
    outline: none;
    font-family: inherit;
    width: 100%;
    color: #fff;
}
.layout-warning__action:hover {
    background-color: #4e79eb;
}
`.trim();
};
