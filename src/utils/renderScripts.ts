import {createAssetRenderer} from '../plugins/layout/asset-loading/render.js';
import type {AssetRenderState, HeadContent, Script} from '../types.js';

/**
 * Render early scripts with optional asset fallbacks.
 * @param content - Generated page content.
 * @param scripts - Scripts to render in this fragment.
 * @param state - Shared state for all fragments of one HTML response.
 * @returns Script tags, including bootstrap when needed.
 */
export function renderScripts(
    content: HeadContent,
    scripts: Script[],
    state: AssetRenderState = {},
): string {
    const loader = content.assetLoading
        ? createAssetRenderer(content.helpers, content.assetLoading, state)
        : undefined;
    const batch = loader?.register([], scripts);
    return [
        loader?.bootstrap() ?? '',
        batch?.html ?? '',
        ...scripts.map((script) =>
            batch?.has(script) ? '' : content.helpers.renderScript(script),
        ),
    ]
        .filter(Boolean)
        .join('\n');
}
