import {getRenderHelpers} from './utils.js';

test('should not render nonce for regular `<script>` tags', () => {
    const script = getRenderHelpers({nonce: 'random'}).renderScript({
        src: 'foo.js',
    });

    expect(script).not.toEqual(expect.stringContaining('nonce="random"'));
});

test('should render `nonce` for inline `<script>` tags', () => {
    const script = getRenderHelpers({nonce: 'random'}).renderInlineScript('alert(1)');

    expect(script).toEqual(expect.stringContaining('nonce="random"'));
});
