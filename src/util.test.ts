import {getRenderHelpers} from './utils.js';

let helpers: ReturnType<typeof getRenderHelpers>;

beforeEach(() => {
    helpers = getRenderHelpers({nonce: 'random'});
});

test('should render nonce for regular `<script>` tags', () => {
    const script = helpers.renderScript({
        src: 'foo.js',
    });

    expect(script).toEqual(expect.stringContaining('nonce="random"'));
});

test('should render `nonce` for inline `<script>` tags', () => {
    const script = helpers.renderInlineScript('alert(1)');

    expect(script).toEqual(expect.stringContaining('nonce="random"'));
});

test('should render `nonce` for inline styles', () => {
    const style = helpers.renderInlineStyle('/* foobar */');

    expect(style).toEqual(expect.stringContaining('nonce="random"'));
});

test('should render `nonce` for `<link>` tags', () => {
    const link = helpers.renderLink({href: 'foo.js', as: 'script'});

    expect(link).toEqual(expect.stringContaining('nonce="random"'));
});
