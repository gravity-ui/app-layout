/** @jest-environment jsdom */
import {createAssetLoadingConfig} from './config.js';
import {serializeAssetRegistrations, serializeBootstrap} from './serialization.js';
import type {AssetLoader, PublicPathFallbacks} from './types.js';

const globals = window as Window & {__APP_LAYOUT_ASSET_LOADER__?: AssetLoader};
const original =
    '<script src="/build/app.js" defer="true" nonce="test" crossorigin="anonymous"></script>';
const asset = {type: 'script' as const, path: 'app.js', originalUrl: '/build/app.js'};

afterEach(() => {
    delete globals.__APP_LAYOUT_ASSET_LOADER__;
    jest.restoreAllMocks();
});

function bootstrap(fallbacks: PublicPathFallbacks = ['/backup/']) {
    const config = createAssetLoadingConfig('/build/', fallbacks);
    if (!config) throw new Error('Missing config');
    return serializeBootstrap(config);
}

test.each<PublicPathFallbacks>([
    ['/backup/'],
    () => ['/backup/'],
    {
        select() {
            return ['/backup/'];
        },
    }.select,
    () => ['</script><script>alert(1)</script>'],
])('serializes a standalone script without external helpers or HTML terminators', (fallbacks) => {
    const source = bootstrap(fallbacks);
    expect(source).not.toMatch(/__awaiter|__generator|__name|<\/script/i);
    // eslint-disable-next-line no-new-func
    expect(() => new Function(source)).not.toThrow();
    const registration = serializeAssetRegistrations([asset], original);
    expect(registration).not.toMatch(/<\/script/i);
});

test.each(['WeakMap', 'selector', 'listener'])(
    'bootstrap failure (%s) restores original tags during parsing',
    (failure) => {
        if (failure === 'WeakMap') {
            jest.spyOn(window, 'WeakMap').mockImplementation(() => {
                throw new TypeError('WeakMap missing');
            });
        } else if (failure === 'listener') {
            jest.spyOn(document, 'addEventListener').mockImplementationOnce(() => {
                throw new Error('listener failed');
            });
        }
        const source = bootstrap(
            failure === 'selector'
                ? () => {
                      throw new Error('selector failed');
                  }
                : ['/backup/'],
        );
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
        const current = document.createElement('script');
        current.nonce = 'test';
        jest.spyOn(document, 'currentScript', 'get').mockReturnValue(current);
        const write = jest.spyOn(document, 'write').mockImplementation(() => {});
        const remove = jest.spyOn(window, 'removeEventListener');
        expect(() => window.eval(source)).not.toThrow();
        expect(globals.__APP_LAYOUT_ASSET_LOADER__).toBeUndefined();
        window.eval(serializeAssetRegistrations([asset], original));
        expect(write).toHaveBeenCalledWith(original);
        if (failure === 'listener') {
            expect(remove).toHaveBeenCalledWith('error', expect.any(Function), true);
        }
    },
);

test('never document.writes after parsing or retries a partially accepted registration', () => {
    const write = jest.spyOn(document, 'write').mockImplementation(() => {});
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    window.eval(serializeAssetRegistrations([asset], original));
    expect(write).not.toHaveBeenCalled();
    globals.__APP_LAYOUT_ASSET_LOADER__ = {
        enqueue: () => {
            throw new Error('partially accepted');
        },
    };
    expect(() => window.eval(serializeAssetRegistrations([asset], original))).toThrow(
        'partially accepted',
    );
    expect(write).not.toHaveBeenCalled();
});

test('registers every asset of a fragment from one script, in order, with one nonce', () => {
    const enqueue = jest.fn();
    globals.__APP_LAYOUT_ASSET_LOADER__ = {enqueue};
    const current = document.createElement('script');
    current.nonce = 'test';
    jest.spyOn(document, 'currentScript', 'get').mockReturnValue(current);
    const style = {type: 'style' as const, path: 'app.css', originalUrl: '/build/app.css'};
    const source = serializeAssetRegistrations([style, asset], original);
    expect(source.match(/loader\.enqueue/g)).toHaveLength(1);
    window.eval(source);
    expect(enqueue.mock.calls).toEqual([
        [style, 'test'],
        [asset, 'test'],
    ]);
});
