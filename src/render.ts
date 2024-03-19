import type {Plugin, RenderParams} from './types.js';
import {generateRenderContent} from './utils/generateRenderContent.js';
import {renderBodyContent} from './utils/renderBodyContent.js';
import {renderHeadContent} from './utils/renderHeadContent.js';

export function createRenderFunction<Plugins extends Plugin[]>(plugins?: Plugins) {
    return function render<Data>(params: RenderParams<Data, Plugins>) {
        const content = generateRenderContent(plugins, params);

        const {htmlAttributes, helpers, bodyContent} = content;

        return `
<!DOCTYPE html>
<html ${helpers.attrs({...htmlAttributes})}>
<head>
    ${renderHeadContent(content)}
</head>
<body ${helpers.attrs(bodyContent.attributes)}>
    ${renderBodyContent(bodyContent)}
</body>
</html>
    `.trim();
    };
}
