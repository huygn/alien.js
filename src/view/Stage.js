/**
 * Stage instance.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import { Events } from '../util/Events.js';
import { Interface } from '../util/Interface.js';

const Stage = new Interface('Stage');
Stage.css({ overflow: 'hidden' });

window.addEventListener('load', () => {
    let last;

    window.addEventListener('focus', focus, true);
    window.addEventListener('blur', blur, true);
    window.addEventListener('keydown', e => Events.emitter.fire(Events.KEYBOARD_DOWN, e), true);
    window.addEventListener('keyup', e => Events.emitter.fire(Events.KEYBOARD_UP, e), true);
    window.addEventListener('keypress', e => Events.emitter.fire(Events.KEYBOARD_PRESS, e), true);
    window.addEventListener('resize', () => Events.emitter.fire(Events.RESIZE), true);
    window.addEventListener('orientationchange', () => Events.emitter.fire(Events.RESIZE), true);
    Stage.events.add(Events.RESIZE, resize);
    resize();

    function focus() {
        if (last !== 'focus') {
            last = 'focus';
            Events.emitter.fire(Events.VISIBILITY, { type: 'focus' });
        }
    }

    function blur() {
        if (last !== 'blur') {
            last = 'blur';
            Events.emitter.fire(Events.VISIBILITY, { type: 'blur' });
        }
    }

    function resize() {
        Stage.size();
        Stage.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
}, true);

export { Stage };
