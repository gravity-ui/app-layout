import * as path from 'path';
import * as fs from 'fs';

import type {Manifest} from './types.js';

export function getJSONContent(manifestPath: string, onError?: (err: unknown) => void): Manifest {
    try {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (err) {
        if (onError) {
            onError(err);
        }
    }
    return {};
}

export function getAbsoluteUrl(publicPath: string, manifestName = '', prefix = '') {
    const url = publicPath + manifestName;
    if (manifestName) {
        return /^https?:\/\//.test(url) ? url : path.normalize(prefix + url);
    }
    return '';
}
