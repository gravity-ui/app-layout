import type {RenderContent} from '../types.js';

export function renderBodyContent(content: RenderContent): string {
    const {bodyContent} = content;

    return `
        ${bodyContent.beforeRoot.join('\n')}
        <div id="root">
            ${bodyContent.root ?? ''}
        </div>
        ${bodyContent.afterRoot.join('\n')}
    `.trim();
}
