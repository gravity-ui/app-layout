import {getRenderHelpers} from './utils.js';

test('should not render nonce for regular `<script>` tags', () => {
    const script = getRenderHelpers({nonce: 'random'}).renderScript({
        src: 'alert(1)',
    });

    expect(script).not.toEqual(expect.stringContaining('nonce="random"'));
});
