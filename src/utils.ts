import type {Attributes, Link, Meta, Script, Stylesheet, RenderHelpers} from './types.js';

export function attrs(obj: Attributes): string {
    return Object.entries(obj)
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');
}

const OG_META_PREFIX = 'og:';

export function getRenderHelpers(params: {nonce?: string}): RenderHelpers {
    function renderScript({src, defer, async, crossOrigin}: Script) {
        return src
            ? `<script ${attrs({
                  src,
                  defer,
                  async,
                  crossorigin: crossOrigin,
              })}></script>`
            : '';
    }
    function renderInlineScript(content: string) {
        return `<script ${attrs({nonce: params.nonce})}>${content}</script>`;
    }
    function renderStyle({href}: Stylesheet) {
        return href ? `<link ${attrs({rel: 'stylesheet', href})}>` : '';
    }
    function renderInlineStyle(content: string) {
        return `<style ${attrs({nonce: params.nonce})}>${content}</style>`;
    }
    function renderMeta({name, content}: Meta) {
        return `<meta ${attrs({
            [name.startsWith(OG_META_PREFIX) ? 'property' : 'name']: name,
            content,
        })}>`;
    }
    function renderLink({href, crossOrigin, as, ...rest}: Link) {
        return href
            ? `<link ${attrs({
                  href,
                  crossorigin: crossOrigin,
                  as,
                  nonce: as === 'script' ? params.nonce : undefined,
                  ...rest,
              })}>`
            : '';
    }

    return {
        renderScript,
        renderInlineScript,
        renderStyle,
        renderInlineStyle,
        renderMeta,
        renderLink,
    };
}

export function hasProperty<T, K extends PropertyKey>(
    obj: T,
    property: K,
): obj is T & Record<K, T[keyof T]> {
    return obj && typeof obj === 'object' && property in obj;
}
