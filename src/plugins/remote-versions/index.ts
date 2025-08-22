import htmlescape from 'htmlescape';

import type {Plugin} from '../../types.js';

import type {RemoteVersionsPluginOptions} from './types.js';

export type {RemoteVersionsPluginOptions} from './types.js';

export function createRemoteVersionsPlugin(): Plugin<
    RemoteVersionsPluginOptions,
    'remoteVersions'
> {
    return {
        name: 'remoteVersions',
        apply({options: versions, renderContent}) {
            if (!versions) {
                return;
            }

            renderContent.inlineScripts.push(
                `window.__REMOTE_VERSIONS__ = ${htmlescape(versions)};`,
            );
        },
    };
}
