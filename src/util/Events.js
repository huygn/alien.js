/**
 * Event helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import { Utils } from './Utils.js';

class Events {

    constructor() {

        class Emitter {

            constructor() {
                this.events = [];
                this.links = [];
            }

            add(event, callback, object) {
                this.events.push({ event, callback, object });
            }

            remove(event, callback) {
                for (let i = this.events.length - 1; i >= 0; i--) {
                    if (this.events[i].event === event && this.events[i].callback === callback) {
                        this.events[i].removed = true;
                        this.events.splice(i, 1)[0] = null;
                    }
                }
            }

            fire(event, object = {}) {
                let called = false;
                for (let i = 0; i < this.events.length; i++) {
                    if (this.events[i].event === event && !this.events[i].removed) {
                        this.events[i].callback(object);
                        called = true;
                    }
                }
                return called;
            }

            destroy(object) {
                for (let i = this.events.length - 1; i >= 0; i--) if (this.events[i].object === object) this.events.splice(i, 1)[0] = null;
            }

            link(object) {
                if (!~this.links.indexOf(object)) this.links.push(object);
            }
        }

        if (!Events.initialized) {
            Events.emitter        = new Emitter();
            Events.VISIBILITY     = 'visibility';
            Events.KEYBOARD_PRESS = 'keyboard_press';
            Events.KEYBOARD_DOWN  = 'keyboard_down';
            Events.KEYBOARD_UP    = 'keyboard_up';
            Events.RESIZE         = 'resize';
            Events.COMPLETE       = 'complete';
            Events.PROGRESS       = 'progress';
            Events.UPDATE         = 'update';
            Events.LOADED         = 'loaded';
            Events.ERROR          = 'error';
            Events.READY          = 'ready';
            Events.HOVER          = 'hover';
            Events.CLICK          = 'click';

            Events.initialized = true;
        }
        this.emitter = new Emitter();
        const linked = [];

        this.add = (object, event, callback) => {
            if (typeof object !== 'object') {
                callback = event;
                event = object;
                object = null;
            }
            if (!object) {
                Events.emitter.add(event, callback, this);
            } else {
                const emitter = object.events.emitter;
                emitter.add(event, callback, this);
                emitter.link(this);
                linked.push(emitter);
            }
        };

        this.remove = (object, event, callback) => {
            if (typeof object !== 'object') {
                callback = event;
                event = object;
                object = null;
            }
            if (!object) Events.emitter.remove(event, callback);
            else object.events.emitter.remove(event, callback);
        };

        this.fire = (event, object = {}, local) => {
            if (this.emitter.fire(event, object)) return;
            if (local) return;
            Events.emitter.fire(event, object);
        };

        this.destroy = () => {
            Events.emitter.destroy(this);
            linked.forEach(emitter => emitter.destroy(this));
            this.emitter.links.forEach(object => object.unlink(this.emitter));
            return Utils.nullObject(this);
        };

        this.unlink = emitter => {
            linked.remove(emitter);
        };
    }
}

export { Events };
