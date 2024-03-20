import type {Plugin} from '../../types.js';

import type {UikitPluginOptions} from './types.js';

export type {UikitPluginOptions} from './types.js';

export function createUikitPlugin(): Plugin<UikitPluginOptions, 'uikit'> {
    return {
        name: 'uikit',
        apply({options, renderContent}) {
            if (!options) {
                return;
            }

            const {theme, direction} = options;

            const cls = renderContent.bodyContent.attributes.class;
            const className = Array.from(
                new Set([...(cls ? String(cls).split(/\s+/) : []), ...getRootClassName(theme)]),
            )
                .filter(Boolean)
                .join(' ');
            renderContent.bodyContent.attributes.class = className;

            if (direction === 'rtl') {
                renderContent.bodyContent.attributes.dir = 'rtl';
            }
        },
    };
}

function getRootClassName(theme: string) {
    const classes = ['g-root'];
    classes.push(`g-root_theme_${theme}`);
    return classes;
}
