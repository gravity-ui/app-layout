import type {IncompatibleI18n} from './types.js';

/** Default copy for the incompatible-browser warning (not tied to a specific product). */
export const defaultIncompatibleWarningTranslationMap: IncompatibleI18n = {
    ru: {
        title: 'Ваш браузер устарел',
        description:
            'Некоторые функции сервиса {{serviceName}} могут не работать, а браузер может быть небезопасен. Установите новый браузер:',
        action: 'Попробовать всё равно',
        browsers: [
            {caption: 'Yandex Browser', href: 'https://browser.yandex.ru/'},
            {caption: 'Google Chrome', href: 'https://www.google.ru/chrome/'},
            {caption: 'Safari', href: 'https://www.apple.com/ru/safari/'},
            {caption: 'Microsoft Edge', href: 'https://www.microsoft.com/ru-ru/edge'},
            {caption: 'Opera', href: 'https://www.opera.com/ru/computer'},
            {caption: 'Firefox', href: 'https://www.mozilla.org/ru/firefox/new/'},
        ],
        currentBrowserTooltip: {
            title: 'Текущая версия — {{version}}',
            description:
                'Установленная версия браузера может работать некорректно и представлять угрозу безопасности данных. Обновите версию или установите другой браузер',
            action: 'Установить {{browserName}}',
        },
    },
    en: {
        title: 'Your browser is out of date',
        description:
            'Some features of the service {{serviceName}} may not work, and the browser may be insecure. Install a new browser:',
        action: 'Try it anyway',
        browsers: [
            {caption: 'Yandex Browser', href: 'https://browser.yandex.com/'},
            {caption: 'Google Chrome', href: 'https://www.google.com/chrome/'},
            {caption: 'Safari', href: 'https://www.apple.com/safari/'},
            {caption: 'Microsoft Edge', href: 'https://www.microsoft.com/en-us/edge'},
            {caption: 'Opera', href: 'https://www.opera.com/computer'},
            {caption: 'Firefox', href: 'https://www.mozilla.org/en-US/firefox/new/'},
        ],
        currentBrowserTooltip: {
            title: 'Current version — {{version}}',
            description:
                'The installed browser version may not work correctly and may pose a threat to data security. Update the version or install a different browser',
            action: 'Install {{browserName}}',
        },
    },
};
