import type {BodyContent} from '../types.js';

export function renderBodyContent(content: BodyContent): string {
    return `
        ${content.beforeRoot.join('\n')}
        <div id="root">
            ${content.root ?? ''}
        </div>
        ${content.afterRoot.join('\n')}
    `.trim();
}
