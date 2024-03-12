import type {Plugin, RenderParams} from './types.js';
import {generateRenderContent} from './utils/generateRenderContent.js';
import {renderBodyContent} from './utils/renderBodyContent.js';
import {renderHeadContent} from './utils/renderHeadContent.js';

export function createRenderFunction<Plugins extends Plugin[]>(plugins?: Plugins) {
    return function render<Data>(params: RenderParams<Data, Plugins>) {
        const content = generateRenderContent(plugins, params);

        const {htmlAttributes, helpers, bodyContent} = content;

        const bodyAttributes = {
            class: bodyContent.className.filter(Boolean).join(' '),
        };

        return `
<!DOCTYPE html>
<html ${helpers.attrs({...htmlAttributes})}>
<head>
    ${renderHeadContent(content)}
</head>
<body ${helpers.attrs(bodyAttributes)}>
    ${renderBodyContent(bodyContent)}
</body>
</html>
    `.trim();
    };
}
