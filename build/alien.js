/**
 * @author Patrick Schroen / https://github.com/pschroen
 */

if (typeof Promise !== 'undefined') Promise.create = function () {
    let resolve,
        reject,
        promise = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
};

Math.sign = function (x) {
    x = +x;
    if (x === 0 || isNaN(x)) return Number(x);
    return x > 0 ? 1 : -1;
};

Math.degrees = function (radians) {
    return radians * (180 / Math.PI);
};

Math.radians = function (degrees) {
    return degrees * (Math.PI / 180);
};

Math.clamp = function (value, min, max) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
};

Math.range = function (value, oldMin, oldMax, newMin, newMax, isClamp) {
    const newValue = (value - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
    if (isClamp) return Math.clamp(newValue, newMin, newMax);
    return newValue;
};

Math.mix = function (a, b, alpha) {
    return a * (1 - alpha) + b * alpha;
};

Math.step = function (edge, value) {
    return value < edge ? 0 : 1;
};

Math.smoothStep = function (min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};

Math.fract = function (value) {
    return value - Math.floor(value);
};

Math.mod = function (value, n) {
    return (value % n + n) % n;
};

Array.prototype.remove = function (element) {
    let index = this.indexOf(element);
    if (~index) return this.splice(index, 1);
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

String.prototype.includes = function (str) {
    if (!Array.isArray(str)) return ~this.indexOf(str);
    for (let i = 0; i < str.length; i++) if (~this.indexOf(str[i])) return true;
    return false;
};

String.prototype.clip = function (num, end) {
    return this.length > num ? this.slice(0, num) + end : this;
};

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.replaceAll = function (find, replace) {
    return this.split(find).join(replace);
};

if (!window.fetch) window.fetch = function (url, options = {}) {
    let promise = Promise.create(),
        request = new XMLHttpRequest();
    request.open(options.method || 'GET', url);
    for (let i in options.headers) request.setRequestHeader(i, options.headers[i]);
    request.onload = () => promise.resolve(response());
    request.onerror = promise.reject;
    request.send(options.body);

    function response() {
        let keys = [],
            all = [],
            headers = {},
            header;
        request.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm, function (m, key, value) {
            keys.push(key = key.toLowerCase());
            all.push([key, value]);
            header = headers[key];
            headers[key] = header ? `${header},${value}` : value;
        });
        return {
            ok: (request.status / 200 | 0) == 1,
            status: request.status,
            statusText: request.statusText,
            url: request.responseURL,
            clone: response,
            text() { return Promise.resolve(request.responseText); },
            json() { return Promise.resolve(request.responseText).then(JSON.parse); },
            xml() { return Promise.resolve(request.responseXML); },
            blob() { return Promise.resolve(new Blob([request.response])); },
            arrayBuffer() { return Promise.resolve(new ArrayBuffer([request.response])); },
            headers: {
                keys() { return keys; },
                entries() { return all; },
                get(n) { return headers[n.toLowerCase()]; },
                has(n) { return n.toLowerCase() in headers; }
            }
        };
    }
    return promise;
};

window.get = function (url, options = {}) {
    let promise = Promise.create();
    options.method = 'GET';
    window.fetch(url, options).then(handleResponse).catch(promise.reject);

    function handleResponse(e) {
        if (!e.ok) return promise.reject(e);
        e.text().then(function (text) {
            if (text.charAt(0).includes(['[', '{'])) {
                try {
                    promise.resolve(JSON.parse(text));
                } catch (err) {
                    promise.resolve(text);
                }
            } else {
                promise.resolve(text);
            }
        });
    }
    return promise;
};

window.post = function (url, body, options = {}) {
    let promise = Promise.create();
    options.method = 'POST';
    options.body = JSON.stringify(body);
    window.fetch(url, options).then(handleResponse).catch(promise.reject);

    function handleResponse(e) {
        if (!e.ok) return promise.reject(e);
        e.text().then(function (text) {
            if (text.charAt(0).includes(['[', '{'])) {
                try {
                    promise.resolve(JSON.parse(text));
                } catch (err) {
                    promise.resolve(text);
                }
            } else {
                promise.resolve(text);
            }
        });
    }
    return promise;
};

window.getURL = function (url, target = '_blank') {
    window.open(url, target);
};

if (!window.URL) window.URL = window.webkitURL;

if (!window.Config) window.Config = {};
if (!window.Global) window.Global = {};

/**
 * Alien utilities.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Utils {

    static random(min, max, precision = 0) {
        if (typeof min === 'undefined') return Math.random();
        if (min === max) return min;
        min = min || 0;
        max = max || 1;
        const p = Math.pow(10, precision);
        return Math.round((min + Math.random() * (max - min)) * p) / p;
    }

    static headsTails(heads, tails) {
        return this.random(0, 1) ? tails : heads;
    }

    static queryString(key) {
        const str = decodeURI(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURI(key).replace(/[.+*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
        if (!str.length || str === '0' || str === 'false') return false;
        return str;
    }

    static getConstructorName(object) {
        return object.constructor.name || object.constructor.toString().match(/function ([^(]+)/)[1];
    }

    static nullObject(object) {
        for (let key in object) if (typeof object[key] !== 'undefined') object[key] = null;
        return null;
    }

    static cloneObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static mergeObject(...objects) {
        const object = {};
        for (let obj of objects) for (let key in obj) object[key] = obj[key];
        return object;
    }

    static toArray(object) {
        return Object.keys(object).map(key => {
            return object[key];
        });
    }

    static cloneArray(array) {
        return array.slice(0);
    }

    static basename(path, ext) {
        const name = path.split('/').last();
        return !ext ? name.split('.')[0] : name;
    }

    static extension(path) {
        return path.split('.').last().split('?')[0].toLowerCase();
    }

    static base64(str) {
        return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    }

    static timestamp() {
        return (Date.now() + this.random(0, 99999)).toString();
    }

    static pad(number) {
        return number < 10 ? '0' + number : number;
    }
}

/**
 * Render loop.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

if (!window.requestAnimationFrame) window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (() => {
    const start = Date.now();
    return callback => setTimeout(() => callback(Date.now() - start), 1000 / 60);
})();

class Render {

    static init() {
        let self = this;
        const render = [],
            skipLimit = 200;
        let last = performance.now();

        window.addEventListener('load', () => requestAnimationFrame(step), true);

        function step(t) {
            const delta = Math.min(skipLimit, t - last);
            last = t;
            self.TIME = t;
            self.DELTA = delta;
            for (let i = render.length - 1; i >= 0; i--) {
                const callback = render[i];
                if (!callback) {
                    render.remove(callback);
                    continue;
                }
                if (callback.fps) {
                    if (t - callback.last < 1000 / callback.fps) continue;
                    callback(++callback.frame);
                    callback.last = t;
                    continue;
                }
                callback(t, delta);
            }
            if (!self.paused) requestAnimationFrame(step);
        }

        this.start = (callback, fps) => {
            if (fps) {
                callback.fps = fps;
                callback.last = -Infinity;
                callback.frame = -1;
            }
            if (!~render.indexOf(callback)) render.unshift(callback);
        };

        this.stop = callback => {
            render.remove(callback);
        };

        this.pause = () => {
            this.paused = true;
        };

        this.resume = () => {
            if (!this.paused) return;
            this.paused = false;
            requestAnimationFrame(step);
        };
    }
}

Render.init();

/**
 * Timer helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Timer {

    static init() {
        const callbacks = [],
            discard = [];

        Render.start(loop);

        function loop(t, delta) {
            for (let i = 0; i < discard.length; i++) {
                const obj = discard[i];
                obj.callback = null;
                callbacks.remove(obj);
            }
            if (discard.length) discard.length = 0;
            for (let i = 0; i < callbacks.length; i++) {
                const obj = callbacks[i];
                if (!obj) {
                    callbacks.remove(obj);
                    continue;
                }
                if ((obj.current += delta) >= obj.time) {
                    if (obj.callback) obj.callback(...obj.args);
                    discard.push(obj);
                }
            }
        }

        function find(ref) {
            for (let i = 0; i < callbacks.length; i++) if (callbacks[i].ref === ref) return callbacks[i];
            return null;
        }

        this.clearTimeout = ref => {
            const obj = find(ref);
            if (!obj) return false;
            obj.callback = null;
            callbacks.remove(obj);
            return true;
        };

        this.create = (callback, time, ...args) => {
            const obj = {
                time: Math.max(1, time || 1),
                current: 0,
                ref: Utils.timestamp(),
                callback,
                args
            };
            callbacks.push(obj);
            return obj.ref;
        };
    }
}

Timer.init();

/**
 * Event helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

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

/**
 * Browser detection and vendor prefixes.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Device {

    static init() {
        this.agent = navigator.userAgent.toLowerCase();
        this.prefix = (() => {
            const styles = window.getComputedStyle(document.documentElement, ''),
                pre = (Array.prototype.slice.call(styles).join('').match(/-(webkit|moz|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
            return {
                lowercase: pre,
                js: pre[0].toUpperCase() + pre.substr(1)
            };
        })();
        this.transformProperty = (() => {
            let pre;
            switch (this.prefix.lowercase) {
                case 'webkit':
                    pre = '-webkit-transform';
                    break;
                case 'moz':
                    pre = '-moz-transform';
                    break;
                case 'ms':
                    pre = '-ms-transform';
                    break;
                case 'o':
                    pre = '-o-transform';
                    break;
                default:
                    pre = 'transform';
                    break;
            }
            return pre;
        })();
        this.pixelRatio = window.devicePixelRatio;
        this.os = (() => {
            if (this.detect(['iphone', 'ipad'])) return 'ios';
            if (this.detect(['android'])) return 'android';
            if (this.detect(['blackberry'])) return 'blackberry';
            if (this.detect(['mac os'])) return 'mac';
            if (this.detect(['windows'])) return 'windows';
            if (this.detect(['linux'])) return 'linux';
            return 'unknown';
        })();
        this.browser = (() => {
            if (this.os === 'ios') {
                if (this.detect(['safari'])) return 'safari';
                return 'unknown';
            }
            if (this.os === 'android') {
                if (this.detect(['chrome'])) return 'chrome';
                if (this.detect(['firefox'])) return 'firefox';
                return 'browser';
            }
            if (this.detect(['msie'])) return 'ie';
            if (this.detect(['trident']) && this.detect(['rv:'])) return 'ie';
            if (this.detect(['windows']) && this.detect(['edge'])) return 'ie';
            if (this.detect(['chrome'])) return 'chrome';
            if (this.detect(['safari'])) return 'safari';
            if (this.detect(['firefox'])) return 'firefox';
            return 'unknown';
        })();
        this.mobile = 'ontouchstart' in window && this.detect(['iphone', 'ipad', 'android', 'blackberry']);
        this.tablet = Math.max(screen.width, screen.height) > 800;
        this.phone = !this.tablet;
        this.webgl = (() => {
            try {
                const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'],
                    canvas = document.createElement('canvas');
                let gl;
                for (let i = 0; i < names.length; i++) {
                    gl = canvas.getContext(names[i]);
                    if (gl) break;
                }
                const info = gl.getExtension('WEBGL_debug_renderer_info'),
                    output = {};
                if (info) {
                    const gpu = info.UNMASKED_RENDERER_WEBGL;
                    output.gpu = gl.getParameter(gpu).toLowerCase();
                }
                output.renderer = gl.getParameter(gl.RENDERER).toLowerCase();
                output.version = gl.getParameter(gl.VERSION).toLowerCase();
                output.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION).toLowerCase();
                output.extensions = gl.getSupportedExtensions();
                output.detect = matches => {
                    if (output.gpu && output.gpu.includes(matches)) return true;
                    if (output.version && output.version.includes(matches)) return true;
                    for (let i = 0; i < output.extensions.length; i++) if (output.extensions[i].toLowerCase().includes(matches)) return true;
                    return false;
                };
                return output;
            } catch (e) {
                return false;
            }
        })();
    }

    static detect(matches) {
        return this.agent.includes(matches);
    }

    static vendor(style) {
        return this.prefix.js + style;
    }

    static vibrate(time) {
        if (navigator.vibrate) navigator.vibrate(time);
    }
}

Device.init();

/**
 * Alien component.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Component {

    constructor() {
        this.events = new Events();
        this.classes = [];
        this.timers = [];
        this.loops = [];
    }

    initClass(object, ...params) {
        const child = new object(...params);
        this.add(child);
        return child;
    }

    add(child) {
        if (child.destroy) {
            this.classes.push(child);
            child.parent = this;
        }
        return this;
    }

    delayedCall(callback, time = 0, ...params) {
        const timer = Timer.create(() => {
            if (callback) callback(...params);
        }, time);
        this.timers.push(timer);
        if (this.timers.length > 50) this.timers.shift();
        return timer;
    }

    clearTimers() {
        for (let i = this.timers.length - 1; i >= 0; i--) Timer.clearTimeout(this.timers[i]);
        this.timers.length = 0;
    }

    startRender(callback, fps) {
        this.loops.push(callback);
        Render.start(callback, fps);
    }

    stopRender(callback) {
        this.loops.remove(callback);
        Render.stop(callback);
    }

    clearRenders() {
        for (let i = this.loops.length - 1; i >= 0; i--) this.stopRender(this.loops[i]);
        this.loops.length = 0;
    }

    destroy() {
        this.removed = true;
        const parent = this.parent;
        if (parent && !parent.removed && parent.remove) parent.remove(this);
        for (let i = this.classes.length - 1; i >= 0; i--) {
            const child = this.classes[i];
            if (child && child.destroy) child.destroy();
        }
        this.classes.length = 0;
        this.clearRenders();
        this.clearTimers();
        this.events.destroy();
        return Utils.nullObject(this);
    }

    remove(child) {
        this.classes.remove(child);
    }
}

/**
 * Interpolation helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Interpolation {

    static init() {
        this.convertEase = ease => {
            return (() => {
                let fn;
                switch (ease) {
                    case 'easeInQuad':
                        fn = this.Quad.In;
                        break;
                    case 'easeInCubic':
                        fn = this.Cubic.In;
                        break;
                    case 'easeInQuart':
                        fn = this.Quart.In;
                        break;
                    case 'easeInQuint':
                        fn = this.Quint.In;
                        break;
                    case 'easeInSine':
                        fn = this.Sine.In;
                        break;
                    case 'easeInExpo':
                        fn = this.Expo.In;
                        break;
                    case 'easeInCirc':
                        fn = this.Circ.In;
                        break;
                    case 'easeInElastic':
                        fn = this.Elastic.In;
                        break;
                    case 'easeInBack':
                        fn = this.Back.In;
                        break;
                    case 'easeInBounce':
                        fn = this.Bounce.In;
                        break;
                    case 'easeOutQuad':
                        fn = this.Quad.Out;
                        break;
                    case 'easeOutCubic':
                        fn = this.Cubic.Out;
                        break;
                    case 'easeOutQuart':
                        fn = this.Quart.Out;
                        break;
                    case 'easeOutQuint':
                        fn = this.Quint.Out;
                        break;
                    case 'easeOutSine':
                        fn = this.Sine.Out;
                        break;
                    case 'easeOutExpo':
                        fn = this.Expo.Out;
                        break;
                    case 'easeOutCirc':
                        fn = this.Circ.Out;
                        break;
                    case 'easeOutElastic':
                        fn = this.Elastic.Out;
                        break;
                    case 'easeOutBack':
                        fn = this.Back.Out;
                        break;
                    case 'easeOutBounce':
                        fn = this.Bounce.Out;
                        break;
                    case 'easeInOutQuad':
                        fn = this.Quad.InOut;
                        break;
                    case 'easeInOutCubic':
                        fn = this.Cubic.InOut;
                        break;
                    case 'easeInOutQuart':
                        fn = this.Quart.InOut;
                        break;
                    case 'easeInOutQuint':
                        fn = this.Quint.InOut;
                        break;
                    case 'easeInOutSine':
                        fn = this.Sine.InOut;
                        break;
                    case 'easeInOutExpo':
                        fn = this.Expo.InOut;
                        break;
                    case 'easeInOutCirc':
                        fn = this.Circ.InOut;
                        break;
                    case 'easeInOutElastic':
                        fn = this.Elastic.InOut;
                        break;
                    case 'easeInOutBack':
                        fn = this.Back.InOut;
                        break;
                    case 'easeInOutBounce':
                        fn = this.Bounce.InOut;
                        break;
                    case 'linear':
                        fn = this.Linear.None;
                        break;
                }
                return fn;
            })() || this.Cubic.Out;
        };

        this.Linear = {
            None(k) {
                return k;
            }
        };

        this.Quad = {
            In(k) {
                return k * k;
            },
            Out(k) {
                return k * (2 - k);
            },
            InOut(k) {
                if ((k *= 2) < 1) return 0.5 * k * k;
                return -0.5 * (--k * (k - 2) - 1);
            }
        };

        this.Cubic = {
            In(k) {
                return k * k * k;
            },
            Out(k) {
                return --k * k * k + 1;
            },
            InOut(k) {
                if ((k *= 2) < 1) return 0.5 * k * k * k;
                return 0.5 * ((k -= 2) * k * k + 2);
            }
        };

        this.Quart = {
            In(k) {
                return k * k * k * k;
            },
            Out(k) {
                return 1 - --k * k * k * k;
            },
            InOut(k) {
                if ((k *= 2) < 1) return 0.5 * k * k * k * k;
                return -0.5 * ((k -= 2) * k * k * k - 2);
            }
        };

        this.Quint = {
            In(k) {
                return k * k * k * k * k;
            },
            Out(k) {
                return --k * k * k * k * k + 1;
            },
            InOut(k) {
                if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
                return 0.5 * ((k -= 2) * k * k * k * k + 2);
            }
        };

        this.Sine = {
            In(k) {
                return 1 - Math.cos(k * Math.PI / 2);
            },
            Out(k) {
                return Math.sin(k * Math.PI / 2);
            },
            InOut(k) {
                return 0.5 * (1 - Math.cos(Math.PI * k));
            }
        };

        this.Expo = {
            In(k) {
                return k === 0 ? 0 : Math.pow(1024, k - 1);
            },
            Out(k) {
                return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
            },
            InOut(k) {
                if (k === 0) return 0;
                if (k === 1) return 1;
                if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
                return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
            }
        };

        this.Circ = {
            In(k) {
                return 1 - Math.sqrt(1 - k * k);
            },
            Out(k) {
                return Math.sqrt(1 - --k * k);
            },
            InOut(k) {
                if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
                return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
            }
        };

        this.Elastic = {
            In(k, a = 1, p = 0.4) {
                let s;
                if (k === 0) return 0;
                if (k === 1) return 1;
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                } else s = p * Math.asin(1 / a) / (2 * Math.PI);
                return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            },
            Out(k, a = 1, p = 0.4) {
                let s;
                if (k === 0) return 0;
                if (k === 1) return 1;
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                } else s = p * Math.asin(1 / a) / (2 * Math.PI);
                return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
            },
            InOut(k, a = 1, p = 0.4) {
                let s;
                if (k === 0) return 0;
                if (k === 1) return 1;
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                } else s = p * Math.asin(1 / a) / (2 * Math.PI);
                if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
                return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
            }
        };

        this.Back = {
            In(k) {
                const s = 1.70158;
                return k * k * ((s + 1) * k - s);
            },
            Out(k) {
                const s = 1.70158;
                return --k * k * ((s + 1) * k + s) + 1;
            },
            InOut(k) {
                const s = 1.70158 * 1.525;
                if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
                return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
            }
        };

        this.Bounce = {
            In(k) {
                return 1 - this.Bounce.Out(1 - k);
            },
            Out(k) {
                if (k < 1 / 2.75) return 7.5625 * k * k;
                if (k < 2 / 2.75) return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
                if (k < 2.5 / 2.75) return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
            },
            InOut(k) {
                if (k < 0.5) return this.Bounce.In(k * 2) * 0.5;
                return this.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
            }
        };
    }
}

Interpolation.init();

/**
 * Mathematical.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class MathTween {

    constructor(object, props, time, ease, delay, update, callback) {
        const self = this;
        let startTime, startValues, endValues, paused, spring, damping, elapsed;

        initMathTween();

        function initMathTween() {
            if (!object.multiTween && object.mathTween) TweenManager.clearTween(object);
            TweenManager.addMathTween(self);
            object.mathTween = self;
            if (object.multiTween) {
                if (!object.mathTweens) object.mathTweens = [];
                object.mathTweens.push(self);
            }
            ease = Interpolation.convertEase(ease);
            startTime = performance.now();
            startTime += delay;
            endValues = props;
            startValues = {};
            if (props.spring) spring = props.spring;
            if (props.damping) damping = props.damping;
            for (let prop in endValues) if (typeof object[prop] === 'number') startValues[prop] = object[prop];
        }

        function clear() {
            if (!object && !props) return false;
            object.mathTween = null;
            TweenManager.removeMathTween(self);
            Utils.nullObject(self);
            if (object.mathTweens) object.mathTweens.remove(self);
        }

        this.update = t => {
            if (paused || t < startTime) return;
            elapsed = (t - startTime) / time;
            elapsed = elapsed > 1 ? 1 : elapsed;
            const delta = this.interpolate(elapsed);
            if (update) update(delta);
            if (elapsed === 1) {
                if (callback) callback();
                clear();
            }
        };

        this.stop = () => {
            clear();
        };

        this.pause = () => {
            paused = true;
        };

        this.resume = () => {
            paused = false;
            startTime = performance.now() - elapsed * time;
        };

        this.interpolate = elapsed => {
            const delta = ease(elapsed, spring, damping);
            for (let prop in startValues) {
                if (typeof startValues[prop] === 'number' && typeof endValues[prop] === 'number') {
                    const start = startValues[prop],
                        end = endValues[prop];
                    object[prop] = start + (end - start) * delta;
                }
            }
            return delta;
        };
    }
}

/**
 * Tween helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class TweenManager {

    static init() {
        const self = this;
        this.TRANSFORMS = ['x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'rotation', 'rotationX', 'rotationY', 'rotationZ', 'skewX', 'skewY', 'perspective'];
        this.CSS_EASES = {
            easeOutCubic:   'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
            easeOutQuad:    'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
            easeOutQuart:   'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
            easeOutQuint:   'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
            easeOutSine:    'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
            easeOutExpo:    'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
            easeOutCirc:    'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
            easeOutBack:    'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
            easeInCubic:    'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
            easeInQuad:     'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
            easeInQuart:    'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
            easeInQuint:    'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
            easeInSine:     'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
            easeInCirc:     'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
            easeInBack:     'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
            easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
            easeInOutQuad:  'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
            easeInOutQuart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
            easeInOutQuint: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
            easeInOutSine:  'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
            easeInOutExpo:  'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
            easeInOutCirc:  'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
            easeInOutBack:  'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
            easeInOut:      'cubic-bezier(0.420, 0.000, 0.580, 1.000)',
            linear:         'linear'
        };
        const tweens = [];

        Render.start(updateTweens);

        function updateTweens(t) {
            for (let i = tweens.length - 1; i >= 0; i--) {
                const tween = tweens[i];
                if (tween.update) tween.update(t);
                else self.removeMathTween(tween);
            }
        }

        this.addMathTween = tween => {
            tweens.push(tween);
        };

        this.removeMathTween = tween => {
            tweens.remove(tween);
        };
    }

    static tween(object, props, time, ease, delay, callback, update) {
        if (typeof delay !== 'number') {
            update = callback;
            callback = delay;
            delay = 0;
        }
        let promise = null;
        if (typeof Promise !== 'undefined') {
            promise = Promise.create();
            if (callback) promise.then(callback);
            callback = promise.resolve;
        }
        const tween = new MathTween(object, props, time, ease, delay, update, callback);
        return promise || tween;
    }

    static clearTween(object) {
        if (object.mathTween) object.mathTween.stop();
        if (object.mathTweens) {
            const tweens = object.mathTweens;
            for (let i = tweens.length - 1; i >= 0; i--) {
                const tween = tweens[i];
                if (tween) tween.stop();
            }
            object.mathTweens = null;
        }
    }

    static parseTransform(props) {
        let transforms = '';
        if (typeof props.x !== 'undefined' || typeof props.y !== 'undefined' || typeof props.z !== 'undefined') {
            const x = props.x || 0,
                y = props.y || 0,
                z = props.z || 0;
            let translate = '';
            translate += x + 'px, ';
            translate += y + 'px, ';
            translate += z + 'px';
            transforms += 'translate3d(' + translate + ')';
        }
        if (typeof props.scale !== 'undefined') {
            transforms += 'scale(' + props.scale + ')';
        } else {
            if (typeof props.scaleX !== 'undefined') transforms += 'scaleX(' + props.scaleX + ')';
            if (typeof props.scaleY !== 'undefined') transforms += 'scaleY(' + props.scaleY + ')';
        }
        if (typeof props.rotation !== 'undefined') transforms += 'rotate(' + props.rotation + 'deg)';
        if (typeof props.rotationX !== 'undefined') transforms += 'rotateX(' + props.rotationX + 'deg)';
        if (typeof props.rotationY !== 'undefined') transforms += 'rotateY(' + props.rotationY + 'deg)';
        if (typeof props.rotationZ !== 'undefined') transforms += 'rotateZ(' + props.rotationZ + 'deg)';
        if (typeof props.skewX !== 'undefined') transforms += 'skewX(' + props.skewX + 'deg)';
        if (typeof props.skewY !== 'undefined') transforms += 'skewY(' + props.skewY + 'deg)';
        if (typeof props.perspective !== 'undefined') transforms += 'perspective(' + props.perspective + 'px)';
        return transforms;
    }

    static isTransform(key) {
        return ~this.TRANSFORMS.indexOf(key);
    }

    static getAllTransforms(object) {
        const obj = {};
        for (let i = 0; i < this.TRANSFORMS.length; i++) {
            const key = this.TRANSFORMS[i],
                val = object[key];
            if (val !== 0 && typeof val === 'number') obj[key] = val;
        }
        return obj;
    }

    static getEase(name) {
        return this.CSS_EASES[name] || this.CSS_EASES.easeOutCubic;
    }
}

TweenManager.init();

/**
 * CSS3 transition animation.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class CSSTransition {

    constructor(object, props, time, ease, delay, callback) {
        const self = this;
        let transformProps, transitionProps;

        initProperties();
        initCSSTween();

        function killed() {
            return !self || self.kill || !object || !object.element;
        }

        function initProperties() {
            const transform = TweenManager.getAllTransforms(object),
                properties = [];
            for (let key in props) {
                if (TweenManager.isTransform(key)) {
                    transform.use = true;
                    transform[key] = props[key];
                    delete props[key];
                } else if (typeof props[key] === 'number' || ~key.indexOf('-')) {
                    properties.push(key);
                }
            }
            if (transform.use) {
                properties.push(Device.transformProperty);
                delete transform.use;
            }
            transformProps = transform;
            transitionProps = properties;
        }

        function initCSSTween() {
            if (killed()) return;
            if (object.cssTween) object.cssTween.kill = true;
            object.cssTween = self;
            const strings = buildStrings(time, ease, delay);
            object.willChange(strings.props);
            Timer.create(() => {
                if (killed()) return;
                object.element.style[Device.vendor('Transition')] = strings.transition;
                object.css(props);
                object.transform(transformProps);
                Timer.create(() => {
                    if (killed()) return;
                    clearCSSTween();
                    if (callback) callback();
                }, time + delay);
            }, 50);
        }

        function buildStrings(time, ease, delay) {
            let props = '',
                transition = '';
            for (let i = 0; i < transitionProps.length; i++) {
                const transitionProp = transitionProps[i];
                props += (props.length ? ', ' : '') + transitionProp;
                transition += (transition.length ? ', ' : '') + transitionProp + ' ' + time + 'ms ' + TweenManager.getEase(ease) + ' ' + delay + 'ms';
            }
            return {
                props,
                transition
            };
        }

        function clearCSSTween() {
            if (killed()) return;
            self.kill = true;
            object.element.style[Device.vendor('Transition')] = '';
            object.cssTween = null;
            object.willChange(null);
            object = props = null;
            Utils.nullObject(self);
        }

        this.stop = clearCSSTween;
    }
}

/**
 * Alien interface.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Interface {

    constructor(name, type = 'div', detached) {
        this.events = new Events();
        this.classes = [];
        this.timers = [];
        this.loops = [];
        if (typeof name !== 'undefined') {
            if (typeof name === 'string') {
                this.name = name;
                this.type = type;
                if (type === 'svg') {
                    const qualifiedName = detached || 'svg';
                    detached = true;
                    this.element = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
                    this.element.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
                } else {
                    this.element = document.createElement(type);
                    if (name[0] !== '.') this.element.id = name;
                    else this.element.className = name.substr(1);
                }
                this.element.style.position = 'absolute';
                if (!detached) document.body.appendChild(this.element);
            } else {
                this.element = name;
            }
            this.element.object = this;
        }
    }

    initClass(object, ...params) {
        const child = new object(...params);
        this.add(child);
        return child;
    }

    add(child) {
        const element = this.element;
        if (child.element) {
            element.appendChild(child.element);
            this.classes.push(child);
            child.parent = this;
        } else if (child.nodeName) {
            element.appendChild(child);
        }
        return this;
    }

    delayedCall(callback, time = 0, ...params) {
        const timer = Timer.create(() => {
            if (callback) callback(...params);
        }, time);
        this.timers.push(timer);
        if (this.timers.length > 50) this.timers.shift();
        return timer;
    }

    clearTimers() {
        for (let i = this.timers.length - 1; i >= 0; i--) Timer.clearTimeout(this.timers[i]);
        this.timers.length = 0;
    }

    startRender(callback, fps) {
        this.loops.push(callback);
        Render.start(callback, fps);
    }

    stopRender(callback) {
        this.loops.remove(callback);
        Render.stop(callback);
    }

    clearRenders() {
        for (let i = this.loops.length - 1; i >= 0; i--) this.stopRender(this.loops[i]);
        this.loops.length = 0;
    }

    destroy() {
        this.removed = true;
        const parent = this.parent;
        if (parent && !parent.removed && parent.remove) parent.remove(this);
        for (let i = this.classes.length - 1; i >= 0; i--) {
            const child = this.classes[i];
            if (child && child.destroy) child.destroy();
        }
        this.classes.length = 0;
        this.element.object = null;
        this.clearRenders();
        this.clearTimers();
        this.events.destroy();
        return Utils.nullObject(this);
    }

    remove(child) {
        child.element.parentNode.removeChild(child.element);
        this.classes.remove(child);
    }

    create(name, type) {
        const child = new Interface(name, type);
        this.add(child);
        return child;
    }

    clone() {
        return new Interface(this.element.cloneNode(true));
    }

    empty() {
        this.element.innerHTML = '';
        return this;
    }

    text(text) {
        if (typeof text === 'undefined') return this.element.textContent;
        else this.element.textContent = text;
        return this;
    }

    html(text) {
        if (typeof text === 'undefined') return this.element.innerHTML;
        else this.element.innerHTML = text;
        return this;
    }

    hide() {
        this.element.style.display = 'none';
        return this;
    }

    show() {
        this.element.style.display = '';
        return this;
    }

    visible() {
        this.element.style.visibility = 'visible';
        return this;
    }

    invisible() {
        this.element.style.visibility = 'hidden';
        return this;
    }

    setZ(z) {
        this.element.style.zIndex = z;
        return this;
    }

    clearAlpha() {
        this.element.style.opacity = '';
        return this;
    }

    size(w, h = w) {
        if (typeof w !== 'undefined') {
            if (typeof w === 'string' || typeof h === 'string') {
                if (typeof w !== 'string') w = w + 'px';
                if (typeof h !== 'string') h = h + 'px';
                this.element.style.width = w;
                this.element.style.height = h;
            } else {
                this.element.style.width = w + 'px';
                this.element.style.height = h + 'px';
                this.element.style.backgroundSize = w + 'px ' + h + 'px';
            }
        }
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        return this;
    }

    mouseEnabled(bool) {
        this.element.style.pointerEvents = bool ? 'auto' : 'none';
        return this;
    }

    fontStyle(fontFamily, fontSize, color, fontStyle) {
        this.css({ fontFamily, fontSize, color, fontStyle });
        return this;
    }

    bg(src, x, y, repeat) {
        if (src.includes(['data:', '.'])) this.element.style.backgroundImage = 'url(' + src + ')';
        else this.element.style.backgroundColor = src;
        if (typeof x !== 'undefined') {
            x = typeof x === 'number' ? x + 'px' : x;
            y = typeof y === 'number' ? y + 'px' : y;
            this.element.style.backgroundPosition = x + ' ' + y;
        }
        if (repeat) {
            this.element.style.backgroundSize = '';
            this.element.style.backgroundRepeat = repeat;
        }
        if (x === 'cover' || x === 'contain') {
            this.element.style.backgroundSize = x;
            this.element.style.backgroundRepeat = 'no-repeat';
            this.element.style.backgroundPosition = typeof y !== 'undefined' ? y + ' ' + repeat : 'center';
        }
        return this;
    }

    center(x, y, noPos) {
        const css = {};
        if (typeof x === 'undefined') {
            css.left = '50%';
            css.top = '50%';
            css.marginLeft = -this.width / 2;
            css.marginTop = -this.height / 2;
        } else {
            if (x) {
                css.left = '50%';
                css.marginLeft = -this.width / 2;
            }
            if (y) {
                css.top = '50%';
                css.marginTop = -this.height / 2;
            }
        }
        if (noPos) {
            delete css.left;
            delete css.top;
        }
        this.css(css);
        return this;
    }

    mask(src) {
        this.element.style[Device.vendor('Mask')] = (~src.indexOf('.') ? 'url(' + src + ')' : src) + ' no-repeat';
        this.element.style[Device.vendor('MaskSize')] = 'contain';
        return this;
    }

    blendMode(mode, bg) {
        this.element.style[bg ? 'background-blend-mode' : 'mix-blend-mode'] = mode;
        return this;
    }

    css(props, value) {
        if (typeof props !== 'object') {
            if (!value) {
                let style = this.element.style[props];
                if (typeof style !== 'number') {
                    if (~style.indexOf('px')) style = Number(style.slice(0, -2));
                    if (props === 'opacity') style = !isNaN(Number(this.element.style.opacity)) ? Number(this.element.style.opacity) : 1;
                }
                return style || 0;
            } else {
                this.element.style[props] = value;
                return this;
            }
        }
        for (let key in props) {
            let val = props[key];
            if (!(typeof val === 'string' || typeof val === 'number')) continue;
            if (typeof val !== 'string' && key !== 'opacity' && key !== 'zIndex') val += 'px';
            this.element.style[key] = val;
        }
        return this;
    }

    transform(props) {
        if (!props) props = this;
        else for (let key in props) if (typeof props[key] === 'number') this[key] = props[key];
        this.element.style[Device.vendor('Transform')] = TweenManager.parseTransform(props);
        return this;
    }

    willChange(props) {
        const string = typeof props === 'string';
        if (props) this.element.style['will-change'] = string ? props : Device.transformProperty + ', opacity';
        else this.element.style['will-change'] = '';
    }

    backfaceVisibility(visible) {
        if (visible) this.element.style[Device.vendor('BackfaceVisibility')] = 'visible';
        else this.element.style[Device.vendor('BackfaceVisibility')] = 'hidden';
    }

    enable3D(perspective, x, y) {
        this.element.style[Device.vendor('TransformStyle')] = 'preserve-3d';
        if (perspective) this.element.style[Device.vendor('Perspective')] = perspective + 'px';
        if (typeof x !== 'undefined') {
            x = typeof x === 'number' ? x + 'px' : x;
            y = typeof y === 'number' ? y + 'px' : y;
            this.element.style[Device.vendor('PerspectiveOrigin')] = x + ' ' + y;
        }
        return this;
    }

    disable3D() {
        this.element.style[Device.vendor('TransformStyle')] = '';
        this.element.style[Device.vendor('Perspective')] = '';
        return this;
    }

    transformPoint(x, y, z) {
        let origin = '';
        if (typeof x !== 'undefined') origin += typeof x === 'number' ? x + 'px ' : x + ' ';
        if (typeof y !== 'undefined') origin += typeof y === 'number' ? y + 'px ' : y + ' ';
        if (typeof z !== 'undefined') origin += typeof z === 'number' ? z + 'px' : z;
        this.element.style[Device.vendor('TransformOrigin')] = origin;
        return this;
    }

    tween(props, time, ease, delay, callback) {
        if (typeof delay !== 'number') {
            callback = delay;
            delay = 0;
        }
        let promise = null;
        if (typeof Promise !== 'undefined') {
            promise = Promise.create();
            if (callback) promise.then(callback);
            callback = promise.resolve;
        }
        const tween = new CSSTransition(this, props, time, ease, delay, callback);
        return promise || tween;
    }

    clearTransform() {
        if (typeof this.x === 'number') this.x = 0;
        if (typeof this.y === 'number') this.y = 0;
        if (typeof this.z === 'number') this.z = 0;
        if (typeof this.scale === 'number') this.scale = 1;
        if (typeof this.scaleX === 'number') this.scaleX = 1;
        if (typeof this.scaleY === 'number') this.scaleY = 1;
        if (typeof this.rotation === 'number') this.rotation = 0;
        if (typeof this.rotationX === 'number') this.rotationX = 0;
        if (typeof this.rotationY === 'number') this.rotationY = 0;
        if (typeof this.rotationZ === 'number') this.rotationZ = 0;
        if (typeof this.skewX === 'number') this.skewX = 0;
        if (typeof this.skewY === 'number') this.skewY = 0;
        this.element.style[Device.transformProperty] = '';
        return this;
    }

    clearTween() {
        if (this.cssTween) this.cssTween.stop();
        if (this.mathTween) this.mathTween.stop();
        return this;
    }

    attr(attr, value) {
        if (typeof value === 'undefined') return this.element.getAttribute(attr);
        if (value === '') this.element.removeAttribute(attr);
        else this.element.setAttribute(attr, value);
        return this;
    }

    convertTouchEvent(e) {
        const touch = {};
        touch.x = 0;
        touch.y = 0;
        if (!e) return touch;
        if (e.touches || e.changedTouches) {
            if (e.touches.length) {
                touch.x = e.touches[0].pageX;
                touch.y = e.touches[0].pageY;
            } else {
                touch.x = e.changedTouches[0].pageX;
                touch.y = e.changedTouches[0].pageY;
            }
        } else {
            touch.x = e.pageX;
            touch.y = e.pageY;
        }
        return touch;
    }

    click(callback) {
        const click = e => {
            if (!this.element) return false;
            e.object = this.element.className === 'hit' ? this.parent : this;
            e.action = 'click';
            if (callback) callback(e);
        };
        this.element.addEventListener('click', click, true);
        this.element.style.cursor = 'pointer';
        return this;
    }

    hover(callback) {
        const hover = e => {
            if (!this.element) return false;
            e.object = this.element.className === 'hit' ? this.parent : this;
            e.action = e.type === 'mouseout' ? 'out' : 'over';
            if (callback) callback(e);
        };
        this.element.addEventListener('mouseover', hover, true);
        this.element.addEventListener('mouseout', hover, true);
        return this;
    }

    press(callback) {
        const press = e => {
            if (!this.element) return false;
            e.object = this.element.className === 'hit' ? this.parent : this;
            e.action = e.type === 'mousedown' ? 'down' : 'up';
            if (callback) callback(e);
        };
        this.element.addEventListener('mousedown', press, true);
        this.element.addEventListener('mouseup', press, true);
        return this;
    }

    bind(event, callback) {
        if (event === 'touchstart' && !Device.mobile) event = 'mousedown';
        else if (event === 'touchmove' && !Device.mobile) event = 'mousemove';
        else if (event === 'touchend' && !Device.mobile) event = 'mouseup';
        if (!this.events['bind_' + event]) this.events['bind_' + event] = [];
        const events = this.events['bind_' + event];
        events.push({ target: this.element, callback });

        const touchEvent = e => {
            const touch = this.convertTouchEvent(e);
            if (!(e instanceof MouseEvent)) {
                e.x = touch.x;
                e.y = touch.y;
            }
            events.forEach(event => {
                if (event.target === e.currentTarget) event.callback(e);
            });
        };

        if (!this.events['fn_' + event]) {
            this.events['fn_' + event] = touchEvent;
            this.element.addEventListener(event, touchEvent, true);
        }
        return this;
    }

    unbind(event, callback) {
        if (event === 'touchstart' && !Device.mobile) event = 'mousedown';
        else if (event === 'touchmove' && !Device.mobile) event = 'mousemove';
        else if (event === 'touchend' && !Device.mobile) event = 'mouseup';
        const events = this.events['bind_' + event];
        if (!events) return this;
        events.forEach((event, i) => {
            if (event.callback === callback) events.splice(i, 1);
        });
        if (this.events['fn_' + event] && !events.length) {
            this.element.removeEventListener(event, this.events['fn_' + event], true);
            this.events['fn_' + event] = null;
        }
        return this;
    }

    interact(overCallback, clickCallback) {
        this.hit = this.create('.hit');
        this.hit.css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 99999
        });
        if (Device.mobile) this.hit.touchClick(overCallback, clickCallback);
        else this.hit.hover(overCallback).click(clickCallback);
        return this;
    }

    touchClick(hover, click) {
        const start = {};
        let time, move, touch;

        const findDistance = (p1, p2) => {
            const dx = p2.x - p1.x,
                dy = p2.y - p1.y;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const touchMove = e => {
            if (!this.element) return false;
            touch = this.convertTouchEvent(e);
            move = findDistance(start, touch) > 5;
        };

        const setTouch = e => {
            const touchEvent = this.convertTouchEvent(e);
            e.touchX = touchEvent.x;
            e.touchY = touchEvent.y;
            start.x = e.touchX;
            start.y = e.touchY;
        };

        const touchStart = e => {
            if (!this.element) return false;
            time = performance.now();
            e.object = this.element.className === 'hit' ? this.parent : this;
            e.action = 'over';
            setTouch(e);
            if (hover && !move) hover(e);
        };

        const touchEnd = e => {
            if (!this.element) return false;
            const t = performance.now();
            e.object = this.element.className === 'hit' ? this.parent : this;
            setTouch(e);
            if (time && t - time < 750 && click && !move) {
                e.action = 'click';
                click(e);
            }
            if (hover) {
                e.action = 'out';
                hover(e);
            }
            move = false;
        };

        this.element.addEventListener('touchmove', touchMove, { passive: true });
        this.element.addEventListener('touchstart', touchStart, { passive: true });
        this.element.addEventListener('touchend', touchEnd, { passive: true });
        return this;
    }

    split(by = '') {
        const style = {
                position: 'relative',
                display: 'block',
                width: 'auto',
                height: 'auto',
                margin: 0,
                padding: 0,
                cssFloat: 'left'
            },
            array = [],
            split = this.text().split(by);
        this.empty();
        if (by === ' ') by = '&nbsp;';
        for (let i = 0; i < split.length; i++) {
            if (split[i] === ' ') split[i] = '&nbsp;';
            array.push(this.create('.t', 'span').html(split[i]).css(style));
            if (by !== '' && i < split.length - 1) array.push(this.create('.t', 'span').html(by).css(style));
        }
        return array;
    }
}

/**
 * Stage instance.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

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

/**
 * 2D vector.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Vector2 {

    constructor(x, y) {
        this.x = typeof x === 'number' ? x : 0;
        this.y = typeof y === 'number' ? y : 0;
        this.type = 'vector2';
    }

    set(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        return this;
    }

    clear() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    copyTo(v) {
        v.x = this.x;
        v.y = this.y;
        return this;
    }

    copyFrom(v) {
        this.x = v.x || 0;
        this.y = v.y || 0;
        return this;
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y || 0.00001;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    }

    setLength(length) {
        this.normalize().multiply(length);
        return this;
    }

    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }

    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }

    multiplyVectors(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(v) {
        this.x *= v;
        this.y *= v;
        return this;
    }

    divide(v) {
        this.x /= v;
        this.y /= v;
        return this;
    }

    perpendicular() {
        const tx = this.x,
            ty = this.y;
        this.x = -ty;
        this.y = tx;
        return this;
    }

    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    }

    deltaLerp(v, alpha, delta = 1) {
        for (let i = 0; i < delta; i++) this.lerp(v, alpha);
        return this;
    }

    interp(v, alpha, ease, dist = 5000) {
        if (!this.calc) this.calc = new Vector2();
        this.calc.subVectors(this, v);
        const fn = Interpolation.convertEase(ease),
            a = fn(Math.clamp(Math.range(this.calc.lengthSq(), 0, dist * dist, 1, 0), 0, 1) * (alpha / 10));
        return this.lerp(v, a);
    }

    setAngleRadius(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        return this;
    }

    addAngleRadius(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        return this;
    }

    dot(a, b = this) {
        return a.x * b.x + a.y * b.y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    distanceTo(v, noSq) {
        const dx = this.x - v.x,
            dy = this.y - v.y;
        if (!noSq) return Math.sqrt(dx * dx + dy * dy);
        return dx * dx + dy * dy;
    }

    solveAngle(a, b = this) {
        return Math.atan2(a.y - b.y, a.x - b.x);
    }

    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

    toString(split = ' ') {
        return this.x + split + this.y;
    }
}

/**
 * Interaction helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Interaction {

    constructor(object = Stage) {
        if (!Interaction.initialized) {
            Interaction.CLICK = 'interaction_click';
            Interaction.START = 'interaction_start';
            Interaction.MOVE  = 'interaction_move';
            Interaction.DRAG  = 'interaction_drag';
            Interaction.END   = 'interaction_end';

            const events = {
                    touchstart: [],
                    touchmove: [],
                    touchend: []
                },
                touchStart = e => events.touchstart.forEach(callback => callback(e)),
                touchMove = e => events.touchmove.forEach(callback => callback(e)),
                touchEnd = e => events.touchend.forEach(callback => callback(e));

            Interaction.bind = (event, callback) => events[event].push(callback);
            Interaction.unbind = (event, callback) => events[event].remove(callback);

            Stage.bind('touchstart', touchStart);
            Stage.bind('touchmove', touchMove);
            Stage.bind('touchend', touchEnd);
            Stage.bind('touchcancel', touchEnd);

            Interaction.initialized = true;
        }
        const self = this;
        this.events = new Events();
        this.x = 0;
        this.y = 0;
        this.hold = new Vector2();
        this.last = new Vector2();
        this.delta = new Vector2();
        this.move = new Vector2();
        this.velocity = new Vector2();
        let distance, timeDown, timeMove;

        addListeners();

        function addListeners() {
            if (object === Stage) Interaction.bind('touchstart', down);
            else object.bind('touchstart', down);
            Interaction.bind('touchmove', move);
            Interaction.bind('touchend', up);
        }

        function down(e) {
            e.preventDefault();
            self.isTouching = true;
            self.x = e.x;
            self.y = e.y;
            self.hold.x = self.last.x = e.x;
            self.hold.y = self.last.y = e.y;
            self.delta.x = self.move.x = self.velocity.x = 0;
            self.delta.y = self.move.y = self.velocity.y = 0;
            distance = 0;
            self.events.fire(Interaction.START, e, true);
            timeDown = timeMove = Render.TIME;
        }

        function move(e) {
            if (self.isTouching) {
                self.move.x = e.x - self.hold.x;
                self.move.y = e.y - self.hold.y;
            }
            self.x = e.x;
            self.y = e.y;
            self.delta.x = e.x - self.last.x;
            self.delta.y = e.y - self.last.y;
            self.last.x = e.x;
            self.last.y = e.y;
            distance += self.delta.length();
            const delta = Math.max(0.001, Render.TIME - (timeMove || Render.TIME));
            timeMove = Render.TIME;
            self.velocity.x = Math.abs(self.delta.x) / delta;
            self.velocity.y = Math.abs(self.delta.y) / delta;
            self.events.fire(Interaction.MOVE, e, true);
            if (self.isTouching) self.events.fire(Interaction.DRAG, e, true);
        }

        function up(e) {
            if (!self.isTouching) return;
            self.isTouching = false;
            self.move.x = 0;
            self.move.y = 0;
            const delta = Math.max(0.001, Render.TIME - (timeMove || Render.TIME));
            if (delta > 100) {
                self.delta.x = 0;
                self.delta.y = 0;
            }
            self.events.fire(Interaction.END, e, true);
            if (distance < 20 && Render.TIME - timeDown < 2000) self.events.fire(Interaction.CLICK, e, true);
        }

        this.destroy = () => {
            Interaction.unbind('touchstart', down);
            Interaction.unbind('touchmove', move);
            Interaction.unbind('touchend', up);
            if (object !== Stage && object.unbind) object.unbind('touchstart', down);
            this.events.destroy();
            return Utils.nullObject(this);
        };
    }
}

/**
 * Accelerometer helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Accelerometer {

    static init() {
        const self = this;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.alpha = 0;
        this.beta = 0;
        this.gamma = 0;
        this.heading = 0;
        this.rotationRate = {};
        this.rotationRate.alpha = 0;
        this.rotationRate.beta = 0;
        this.rotationRate.gamma = 0;
        this.toRadians = Device.os === 'ios' ? Math.PI / 180 : 1;

        window.addEventListener('devicemotion', updateAccel, true);
        window.addEventListener('deviceorientation', updateOrientation, true);

        function updateAccel(e) {
            switch (window.orientation) {
                case 0:
                    self.x = -e.accelerationIncludingGravity.x;
                    self.y = e.accelerationIncludingGravity.y;
                    self.z = e.accelerationIncludingGravity.z;
                    if (e.rotationRate) {
                        self.rotationRate.alpha = e.rotationRate.beta * self.toRadians;
                        self.rotationRate.beta = -e.rotationRate.alpha * self.toRadians;
                        self.rotationRate.gamma = e.rotationRate.gamma * self.toRadians;
                    }
                    break;
                case 180:
                    self.x = e.accelerationIncludingGravity.x;
                    self.y = -e.accelerationIncludingGravity.y;
                    self.z = e.accelerationIncludingGravity.z;
                    if (e.rotationRate) {
                        self.rotationRate.alpha = -e.rotationRate.beta * self.toRadians;
                        self.rotationRate.beta = e.rotationRate.alpha * self.toRadians;
                        self.rotationRate.gamma = e.rotationRate.gamma * self.toRadians;
                    }
                    break;
                case 90:
                    self.x = e.accelerationIncludingGravity.y;
                    self.y = e.accelerationIncludingGravity.x;
                    self.z = e.accelerationIncludingGravity.z;
                    if (e.rotationRate) {
                        self.rotationRate.alpha = e.rotationRate.alpha * self.toRadians;
                        self.rotationRate.beta = e.rotationRate.beta * self.toRadians;
                        self.rotationRate.gamma = e.rotationRate.gamma * self.toRadians;
                    }
                    break;
                case -90:
                    self.x = -e.accelerationIncludingGravity.y;
                    self.y = -e.accelerationIncludingGravity.x;
                    self.z = e.accelerationIncludingGravity.z;
                    if (e.rotationRate) {
                        self.rotationRate.alpha = -e.rotationRate.alpha * self.toRadians;
                        self.rotationRate.beta = -e.rotationRate.beta * self.toRadians;
                        self.rotationRate.gamma = e.rotationRate.gamma * self.toRadians;
                    }
                    break;
            }
        }

        function updateOrientation(e) {
            for (let key in e) if (~key.toLowerCase().indexOf('heading')) self.heading = e[key];
            switch (window.orientation) {
                case 0:
                    self.alpha = e.beta * self.toRadians;
                    self.beta = -e.alpha * self.toRadians;
                    self.gamma = e.gamma * self.toRadians;
                    break;
                case 180:
                    self.alpha = -e.beta * self.toRadians;
                    self.beta = e.alpha * self.toRadians;
                    self.gamma = e.gamma * self.toRadians;
                    break;
                case 90:
                    self.alpha = e.alpha * self.toRadians;
                    self.beta = e.beta * self.toRadians;
                    self.gamma = e.gamma * self.toRadians;
                    break;
                case -90:
                    self.alpha = -e.alpha * self.toRadians;
                    self.beta = -e.beta * self.toRadians;
                    self.gamma = e.gamma * self.toRadians;
                    break;
            }
            self.tilt = e.beta * self.toRadians;
            self.yaw = e.alpha * self.toRadians;
            self.roll = -e.gamma * self.toRadians;
            if (Device.os === 'Android') self.heading = compassHeading(e.alpha, e.beta, e.gamma);
        }

        function compassHeading(alpha, beta, gamma) {
            const degtorad = Math.PI / 180,
                x = beta ? beta * degtorad : 0,
                y = gamma ? gamma * degtorad : 0,
                z = alpha ? alpha * degtorad : 0,
                cY = Math.cos(y),
                cZ = Math.cos(z),
                sX = Math.sin(x),
                sY = Math.sin(y),
                sZ = Math.sin(z),
                Vx = -cZ * sY - sZ * sX * cY,
                Vy = -sZ * sY + cZ * sX * cY;
            let compassHeading = Math.atan(Vx / Vy);
            if (Vy < 0) compassHeading += Math.PI;
            else if (Vx < 0) compassHeading += 2 * Math.PI;
            return compassHeading * (180 / Math.PI);
        }
    }
}

/**
 * Mouse interaction.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Mouse {

    static init() {
        const self = this;
        this.x = 0;
        this.y = 0;
        this.normal = {
            x: 0,
            y: 0
        };
        this.tilt = {
            x: 0,
            y: 0
        };
        this.inverseNormal = {
            x: 0,
            y: 0
        };

        this.input = new Interaction();
        Stage.events.add(this.input, Interaction.START, update);
        Stage.events.add(this.input, Interaction.MOVE, update);
        update({
            x: Stage.width / 2,
            y: Stage.height / 2
        });

        function update(e) {
            self.x = e.x;
            self.y = e.y;
            self.normal.x = e.x / Stage.width;
            self.normal.y = e.y / Stage.height;
            self.tilt.x = self.normal.x * 2 - 1;
            self.tilt.y = 1 - self.normal.y * 2;
            self.inverseNormal.x = self.normal.x;
            self.inverseNormal.y = 1 - self.normal.y;
        }
    }
}

/**
 * Image helper class with promise method.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Assets {

    static init() {
        this.CDN = '';
        this.CORS = null;
        const images = {};

        this.createImage = (src, store, callback) => {
            if (typeof store !== 'boolean') {
                callback = store;
                store = undefined;
            }
            const img = new Image();
            img.crossOrigin = this.CORS;
            img.src = src;
            img.onload = callback;
            img.onerror = callback;
            if (store) images[src] = img;
            return img;
        };

        this.getImage = src => {
            return images[src];
        };
    }

    static loadImage(img) {
        if (typeof img === 'string') img = this.createImage(img);
        const promise = Promise.create();
        img.onload = promise.resolve;
        img.onerror = promise.resolve;
        return promise;
    }
}

Assets.init();

/**
 * Asset loader with promise method.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class AssetLoader extends Component {

    constructor(assets, callback) {
        super();
        if (Array.isArray(assets)) {
            assets = (() => {
                const keys = assets.map(path => {
                    return Utils.basename(path);
                });
                return keys.reduce((o, k, i) => {
                    o[k] = assets[i];
                    return o;
                }, {});
            })();
        }
        const self = this;
        this.events = new Events();
        const total = Object.keys(assets).length;
        let loaded = 0;

        for (let key in assets) loadAsset(key, Assets.CDN + assets[key]);

        function loadAsset(key, asset) {
            const ext = Utils.extension(asset);
            if (ext.includes(['jpg', 'jpeg', 'png', 'gif', 'svg'])) {
                Assets.createImage(asset, assetLoaded);
                return;
            }
            if (ext.includes(['mp3', 'm4a', 'ogg', 'wav', 'aif'])) {
                if (!window.AudioContext || !window.WebAudio) return assetLoaded();
                window.WebAudio.createSound(key, asset, assetLoaded);
                return;
            }
            window.get(asset).then(data => {
                if (ext === 'js') window.eval(data.replace('use strict', ''));
                assetLoaded();
            }).catch(() => {
                assetLoaded();
            });
        }

        function assetLoaded() {
            self.percent = ++loaded / total;
            self.events.fire(Events.PROGRESS, { percent: self.percent }, true);
            if (loaded === total) complete();
        }

        function complete() {
            self.events.fire(Events.COMPLETE, null, true);
            if (callback) callback();
        }
    }

    static loadAssets(assets, callback) {
        const promise = Promise.create();
        if (!callback) callback = promise.resolve;
        promise.loader = new AssetLoader(assets, callback);
        return promise;
    }
}

/**
 * Loader helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class MultiLoader extends Component {

    constructor() {
        super();
        const self = this;
        this.events = new Events();
        const loaders = [];
        let loaded = 0;

        function progress() {
            let percent = 0;
            for (let i = 0; i < loaders.length; i++) percent += loaders[i].percent || 0;
            percent /= loaders.length;
            self.events.fire(Events.PROGRESS, { percent }, true);
        }

        function complete() {
            if (++loaded === loaders.length) self.events.fire(Events.COMPLETE, null, true);
        }

        this.push = loader => {
            loaders.push(loader);
            this.events.add(loader, Events.PROGRESS, progress);
            this.events.add(loader, Events.COMPLETE, complete);
        };

        this.complete = () => {
            this.events.fire(Events.PROGRESS, { percent: 1 }, true);
            this.events.fire(Events.COMPLETE, null, true);
        };
    }
}

/**
 * Font loader with promise method.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class FontLoader extends Component {

    constructor(fonts, callback) {
        super();
        const self = this;
        this.events = new Events();
        let element;

        initFonts();
        finish();

        function initFonts() {
            if (!Array.isArray(fonts)) fonts = [fonts];
            element = Stage.create('FontLoader');
            for (let i = 0; i < fonts.length; i++) element.create('font').fontStyle(fonts[i], 12, '#000').text('LOAD').css({ top: -999 });
        }

        function finish() {
            const ready = () => {
                element.destroy();
                self.percent = 1;
                self.events.fire(Events.PROGRESS, { percent: self.percent }, true);
                self.events.fire(Events.COMPLETE, null, true);
                if (callback) callback();
            };
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
            else self.delayedCall(ready, 500);
        }
    }

    static loadFonts(fonts, callback) {
        const promise = Promise.create();
        if (!callback) callback = promise.resolve;
        promise.loader = new FontLoader(fonts, callback);
        return promise;
    }
}

/**
 * State dispatcher.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class StateDispatcher {

    constructor(forceHash) {
        const self = this;
        this.events = new Events();
        this.locked = false;
        let storePath, storeState,
            rootPath = '/';

        createListener();
        storePath = getPath();

        function createListener() {
            if (forceHash) window.addEventListener('hashchange', () => handleStateChange(null, getPath()), true);
            else window.addEventListener('popstate', e => handleStateChange(e.state, getPath()), true);
        }

        function getPath() {
            if (forceHash) return location.hash.slice(3);
            return rootPath !== '/' ? location.pathname.split(rootPath)[1] : location.pathname.slice(1) || '';
        }

        function handleStateChange(state, path) {
            if (path !== storePath) {
                if (!self.locked) {
                    storePath = path;
                    storeState = state;
                    self.events.fire(Events.UPDATE, { value: state, path }, true);
                } else if (storePath) {
                    if (forceHash) location.hash = '!/' + storePath;
                    else history.pushState(storeState, null, rootPath + storePath);
                }
            }
        }

        this.getState = () => {
            const path = getPath();
            return { value: storeState, path };
        };

        this.setState = (state, path) => {
            if (typeof state !== 'object') {
                path = state;
                state = null;
            }
            if (path !== storePath) {
                storePath = path;
                storeState = state;
                if (forceHash) location.hash = '!/' + path;
                else history.pushState(state, null, rootPath + path);
            }
        };

        this.replaceState = (state, path) => {
            if (typeof state !== 'object') {
                path = state;
                state = null;
            }
            if (path !== storePath) {
                storePath = path;
                storeState = state;
                if (forceHash) history.replaceState(null, null, '#!/' + path);
                else history.replaceState(state, null, rootPath + path);
            }
        };

        this.setTitle = title => document.title = title;

        this.lock = () => this.locked = true;

        this.unlock = () => this.locked = false;

        this.forceHash = () => forceHash = true;

        this.setPathRoot = path => {
            if (path.charAt(0) === '/') rootPath = path;
            else rootPath = '/' + path;
        };
    }
}

/**
 * Storage helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Storage {

    static set(key, value) {
        if (value !== null && typeof value === 'object') value = JSON.stringify(value);
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage[key] = value;
    }

    static get(key) {
        let value = window.localStorage[key];
        if (value) {
            let char0;
            if (value.charAt) char0 = value.charAt(0);
            if (char0 === '{' || char0 === '[') value = JSON.parse(value);
            if (value === 'true' || value === 'false') value = value === 'true';
        }
        return value;
    }
}

/**
 * Web audio engine.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

if (!window.AudioContext) window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;

class WebAudio {

    static init() {
        const self = this;
        const sounds = {};
        let context;

        if (window.AudioContext) context = new AudioContext();
        if (!context) return;
        this.globalGain = context.createGain();
        this.globalGain.connect(context.destination);
        this.globalGain.value = this.globalGain.gain.defaultValue;
        this.gain = {
            set value(value) {
                self.globalGain.value = value;
                self.globalGain.gain.setTargetAtTime(value, context.currentTime, 0.01);
            },
            get value() {
                return self.globalGain.value;
            }
        };

        this.loadSound = (id, callback) => {
            const promise = Promise.create();
            if (callback) promise.then(callback);
            callback = promise.resolve;
            const sound = this.getSound(id);
            window.fetch(sound.asset).then(response => {
                if (!response.ok) return callback();
                response.arrayBuffer().then(data => {
                    context.decodeAudioData(data, buffer => {
                        sound.buffer = buffer;
                        sound.complete = true;
                        callback();
                    });
                });
            }).catch(() => {
                callback();
            });
            sound.ready = () => promise;
        };

        this.createSound = (id, asset, callback) => {
            const sound = {};
            sound.asset = asset;
            sound.audioGain = context.createGain();
            sound.audioGain.connect(this.globalGain);
            sound.audioGain.value = sound.audioGain.gain.defaultValue;
            sound.gain = {
                set value(value) {
                    sound.audioGain.value = value;
                    sound.audioGain.gain.setTargetAtTime(value, context.currentTime, 0.01);
                },
                get value() {
                    return sound.audioGain.value;
                }
            };
            sounds[id] = sound;
            if (Device.os === 'ios') callback();
            else this.loadSound(id, callback);
        };

        this.getSound = id => {
            return sounds[id];
        };

        this.trigger = id => {
            if (!context) return;
            if (context.state === 'suspended') context.resume();
            const sound = this.getSound(id);
            if (!sound.ready) this.loadSound(id);
            sound.ready().then(() => {
                if (sound.complete) {
                    const source = context.createBufferSource();
                    source.buffer = sound.buffer;
                    source.connect(sound.audioGain);
                    sound.audioGain.gain.setValueAtTime(sound.audioGain.value, context.currentTime);
                    source.loop = !!sound.loop;
                    source.start(0);
                }
            });
        };

        this.mute = () => {
            if (!context) return;
            TweenManager.tween(this.gain, { value: 0 }, 300, 'easeOutSine');
        };

        this.unmute = () => {
            if (!context) return;
            TweenManager.tween(this.gain, { value: 1 }, 500, 'easeOutSine');
        };

        window.WebAudio = this;
    }
}

/**
 * Canvas values.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class CanvasValues {

    constructor(style) {
        this.styles = {};
        if (!style) this.data = new Float32Array(6);
        else this.styled = false;
    }

    setTRSA(x, y, r, sx, sy, a) {
        const m = this.data;
        m[0] = x;
        m[1] = y;
        m[2] = r;
        m[3] = sx;
        m[4] = sy;
        m[5] = a;
    }

    calculate(values) {
        const v = values.data,
            m = this.data;
        m[0] = m[0] + v[0];
        m[1] = m[1] + v[1];
        m[2] = m[2] + v[2];
        m[3] = m[3] * v[3];
        m[4] = m[4] * v[4];
        m[5] = m[5] * v[5];
    }

    calculateStyle(parent) {
        if (!parent.styled) return false;
        this.styled = true;
        const values = parent.values;
        for (let key in values) if (!this.styles[key]) this.styles[key] = values[key];
    }

    set shadowOffsetX(val) {
        this.styled = true;
        this.styles.shadowOffsetX = val;
    }

    get shadowOffsetX() {
        return this.styles.shadowOffsetX;
    }

    set shadowOffsetY(val) {
        this.styled = true;
        this.styles.shadowOffsetY = val;
    }

    get shadowOffsetY() {
        return this.styles.shadowOffsetY;
    }

    set shadowBlur(val) {
        this.styled = true;
        this.styles.shadowBlur = val;
    }

    get shadowBlur() {
        return this.styles.shadowBlur;
    }

    set shadowColor(val) {
        this.styled = true;
        this.styles.shadowColor = val;
    }

    get shadowColor() {
        return this.styles.shadowColor;
    }

    get values() {
        return this.styles;
    }
}

/**
 * Canvas object.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class CanvasObject {

    constructor() {
        this.visible = true;
        this.blendMode = 'source-over';
        this.x = 0;
        this.y = 0;
        this.px = 0;
        this.py = 0;
        this.clipX = 0;
        this.clipY = 0;
        this.clipWidth = 0;
        this.clipHeight = 0;
        this.width = 0;
        this.height = 0;
        this.rotation = 0;
        this.scale = 1;
        this.opacity = 1;
        this.values = new CanvasValues();
        this.styles = new CanvasValues(true);
        this.children = [];
    }

    updateValues() {
        this.values.setTRSA(this.x, this.y, Math.radians(this.rotation), this.scaleX || this.scale, this.scaleY || this.scale, this.opacity);
        if (this.parent.values) this.values.calculate(this.parent.values);
        if (this.parent.styles) this.styles.calculateStyle(this.parent.styles);
    }

    render(override) {
        if (!this.visible) return false;
        this.updateValues();
        if (this.draw) this.draw(override);
        for (let i = 0; i < this.children.length; i++) this.children[i].render(override);
    }

    startDraw(ox, oy, override) {
        const context = this.canvas.context,
            v = this.values.data,
            x = v[0] + (ox || 0),
            y = v[1] + (oy || 0);
        context.save();
        if (!override) context.globalCompositeOperation = this.blendMode;
        context.translate(x, y);
        context.rotate(v[2]);
        context.scale(v[3], v[4]);
        context.globalAlpha = v[5];
        if (this.styles.styled) {
            const values = this.styles.values;
            for (let key in values) context[key] = values[key];
        }
    }

    endDraw() {
        this.canvas.context.restore();
    }

    add(child) {
        child.setCanvas(this.canvas);
        child.parent = this;
        this.children.push(child);
        child.z = this.children.length;
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        for (let i = 0; i < this.children.length; i++) this.children[i].setCanvas(canvas);
    }

    remove(child) {
        child.canvas = null;
        child.parent = null;
        this.children.remove(child);
    }

    isMask() {
        let obj = this;
        while (obj) {
            if (obj.masked) return true;
            obj = obj.parent;
        }
        return false;
    }

    unmask() {
        this.masked.mask(null);
        this.masked = null;
    }

    setZ(z) {
        this.z = z;
        this.parent.children.sort((a, b) => {
            return a.z - b.z;
        });
    }

    follow(object) {
        this.x = object.x;
        this.y = object.y;
        this.px = object.px;
        this.py = object.py;
        this.clipX = object.clipX;
        this.clipY = object.clipY;
        this.clipWidth = object.clipWidth;
        this.clipHeight = object.clipHeight;
        this.width = object.width;
        this.height = object.height;
        this.rotation = object.rotation;
        this.scale = object.scale;
        this.scaleX = object.scaleX || object.scale;
        this.scaleY = object.scaleY || object.scale;
        return this;
    }

    visible() {
        this.visible = true;
        return this;
    }

    invisible() {
        this.visible = false;
        return this;
    }

    transform(props) {
        for (let key in props) if (typeof props[key] === 'number') this[key] = props[key];
        return this;
    }

    transformPoint(x, y) {
        this.px = typeof x === 'number' ? x : this.width * (parseFloat(x) / 100);
        this.py = typeof y === 'number' ? y : this.height * (parseFloat(y) / 100);
        return this;
    }

    clip(x, y, w, h) {
        this.clipX = x;
        this.clipY = y;
        this.clipWidth = w;
        this.clipHeight = h;
        return this;
    }

    destroy() {
        for (let i = this.children.length - 1; i >= 0; i--) this.children[i].destroy();
        return Utils.nullObject(this);
    }
}

/**
 * Canvas graphics.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class CanvasGraphics extends CanvasObject {

    constructor(w = 0, h = w) {
        super();
        const self = this;
        this.width = w;
        this.height = h;
        this.props = {};
        let draw = [],
            mask;

        function setProperties(context) {
            for (let key in self.props) context[key] = self.props[key];
        }

        this.draw = override => {
            if (this.isMask() && !override) return false;
            const context = this.canvas.context;
            this.startDraw(this.px, this.py, override);
            setProperties(context);
            if (this.clipWidth && this.clipHeight) {
                context.beginPath();
                context.rect(this.clipX, this.clipY, this.clipWidth, this.clipHeight);
                context.clip();
            }
            for (let i = 0; i < draw.length; i++) {
                const cmd = draw[i];
                if (!cmd) continue;
                const fn = cmd.shift();
                context[fn].apply(context, cmd);
                cmd.unshift(fn);
            }
            this.endDraw();
            if (mask) {
                context.globalCompositeOperation = mask.blendMode;
                mask.render(true);
            }
        };

        this.clear = () => {
            for (let i = draw.length - 1; i >= 0; i--) draw[i].length = 0;
            draw.length = 0;
        };

        this.arc = (x = 0, y = 0, endAngle = 0, radius = this.radius || this.width / 2, startAngle = 0, counterclockwise = false) => {
            if (x && !y) {
                endAngle = x;
                x = 0;
                y = 0;
            }
            endAngle -= 90;
            startAngle -= 90;
            draw.push(['beginPath']);
            draw.push(['arc', x, y, radius, Math.radians(startAngle), Math.radians(endAngle), counterclockwise]);
        };

        this.quadraticCurveTo = (cpx, cpy, x, y) => {
            draw.push(['quadraticCurveTo', cpx, cpy, x, y]);
        };

        this.bezierCurveTo = (cp1x, cp1y, cp2x, cp2y, x, y) => {
            draw.push(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]);
        };

        this.fillRect = (x, y, w, h) => {
            draw.push(['fillRect', x, y, w, h]);
        };

        this.clearRect = (x, y, w, h) => {
            draw.push(['clearRect', x, y, w, h]);
        };

        this.strokeRect = (x, y, w, h) => {
            draw.push(['strokeRect', x, y, w, h]);
        };

        this.moveTo = (x, y) => {
            draw.push(['moveTo', x, y]);
        };

        this.lineTo = (x, y) => {
            draw.push(['lineTo', x, y]);
        };

        this.stroke = () => {
            draw.push(['stroke']);
        };

        this.fill = () => {
            if (!mask) draw.push(['fill']);
        };

        this.beginPath = () => {
            draw.push(['beginPath']);
        };

        this.closePath = () => {
            draw.push(['closePath']);
        };

        this.fillText = (text, x, y) => {
            draw.push(['fillText', text, x, y]);
        };

        this.strokeText = (text, x, y) => {
            draw.push(['strokeText', text, x, y]);
        };

        this.setLineDash = value => {
            draw.push(['setLineDash', value]);
        };

        this.drawImage = (img, sx = 0, sy = 0, sWidth = img.width, sHeight = img.height, dx = 0, dy = 0, dWidth = img.width, dHeight = img.height) => {
            draw.push(['drawImage', img, sx, sy, sWidth, sHeight, dx + -this.px, dy + -this.py, dWidth, dHeight]);
        };

        this.mask = object => {
            if (!object) return mask = null;
            mask = object;
            object.masked = this;
            for (let i = 0; i < draw.length; i++) {
                if (draw[i][0] === 'fill' || draw[i][0] === 'stroke') {
                    draw[i].length = 0;
                    draw.splice(i, 1);
                }
            }
        };

        this.clone = () => {
            const object = new CanvasGraphics(this.width, this.height);
            object.visible = this.visible;
            object.blendMode = this.blendMode;
            object.opacity = this.opacity;
            object.follow(this);
            object.props = Utils.cloneObject(this.props);
            object.setDraw(Utils.cloneArray(draw));
            return object;
        };

        this.setDraw = array => {
            draw = array;
        };
    }

    set strokeStyle(val) {
        this.props.strokeStyle = val;
    }

    get strokeStyle() {
        return this.props.strokeStyle;
    }

    set fillStyle(val) {
        this.props.fillStyle = val;
    }

    get fillStyle() {
        return this.props.fillStyle;
    }

    set lineWidth(val) {
        this.props.lineWidth = val;
    }

    get lineWidth() {
        return this.props.lineWidth;
    }

    set lineCap(val) {
        this.props.lineCap = val;
    }

    get lineCap() {
        return this.props.lineCap;
    }

    set lineDashOffset(val) {
        this.props.lineDashOffset = val;
    }

    get lineDashOffset() {
        return this.props.lineDashOffset;
    }

    set lineJoin(val) {
        this.props.lineJoin = val;
    }

    get lineJoin() {
        return this.props.lineJoin;
    }

    set miterLimit(val) {
        this.props.miterLimit = val;
    }

    get miterLimit() {
        return this.props.miterLimit;
    }

    set font(val) {
        this.props.font = val;
    }

    get font() {
        return this.props.font;
    }

    set textAlign(val) {
        this.props.textAlign = val;
    }

    get textAlign() {
        return this.props.textAlign;
    }

    set textBaseline(val) {
        this.props.textBaseline = val;
    }

    get textBaseline() {
        return this.props.textBaseline;
    }
}

/**
 * Canvas interface.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Canvas {

    constructor(w, h = w, retina, whiteAlpha) {
        const self = this;
        this.element = document.createElement('canvas');
        this.context = this.element.getContext('2d');
        this.object = new Interface(this.element);
        this.children = [];
        this.retina = retina;

        size(w, h, retina);

        function size(w, h, retina) {
            const ratio = retina ? 2 : 1;
            self.element.width = w * ratio;
            self.element.height = h * ratio;
            self.width = w;
            self.height = h;
            self.scale = ratio;
            self.object.size(self.width, self.height);
            self.context.scale(ratio, ratio);
            self.element.style.width = w + 'px';
            self.element.style.height = h + 'px';
            if (whiteAlpha) {
                const alpha = new CanvasGraphics(self.width, self.height);
                alpha.fillStyle = 'rgba(255, 255, 255, 0.002)';
                alpha.fillRect(0, 0, self.width, self.height);
                alpha.setCanvas(self);
                alpha.parent = self;
                self.children[0] = alpha;
                alpha.z = 1;
            }
        }

        this.size = size;

        this.toDataURL = (type, quality) => {
            return this.element.toDataURL(type, quality);
        };

        this.render = noClear => {
            if (!(typeof noClear === 'boolean' && noClear)) this.clear();
            for (let i = 0; i < this.children.length; i++) this.children[i].render();
        };

        this.clear = () => {
            this.context.clearRect(0, 0, this.element.width, this.element.height);
        };

        this.add = child => {
            child.setCanvas(this);
            child.parent = this;
            this.children.push(child);
            child.z = this.children.length;
        };

        this.remove = child => {
            child.canvas = null;
            child.parent = null;
            this.children.remove(child);
        };

        this.destroy = () => {
            for (let i = this.children.length - 1; i >= 0; i--) this.children[i].destroy();
            this.object.destroy();
            return Utils.nullObject(this);
        };

        this.getImageData = (x = 0, y = 0, w = this.element.width, h = this.element.height) => {
            this.imageData = this.context.getImageData(x, y, w, h);
            return this.imageData;
        };

        this.getPixel = (x, y, dirty) => {
            if (!this.imageData || dirty) this.getImageData();
            const imgData = {},
                index = (x + y * this.element.width) * 4,
                pixels = this.imageData.data;
            imgData.r = pixels[index];
            imgData.g = pixels[index + 1];
            imgData.b = pixels[index + 2];
            imgData.a = pixels[index + 3];
            return imgData;
        };

        this.putImageData = imageData => {
            this.context.putImageData(imageData, 0, 0);
        };
    }
}

/**
 * Canvas font utilities.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class CanvasFont {

    static createText(canvas, width, height, str, font, fillStyle, { textBaseline = 'alphabetic', lineHeight = height, letterSpacing = 0, textAlign = 'start' }) {
        const context = canvas.context;
        if (height === lineHeight) {
            return createText(canvas, width, height, str, font, fillStyle, textBaseline, letterSpacing, textAlign);
        } else {
            const text = new CanvasGraphics(width, height),
                words = str.split(' '),
                lines = [];
            let line = '';
            text.totalWidth = 0;
            text.totalHeight = 0;
            context.font = font;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ',
                    characters = testLine.split('');
                let testWidth = 0;
                for (let i = 0; i < characters.length; i++) testWidth += context.measureText(characters[i]).width + letterSpacing;
                if (testWidth > width && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            lines.forEach((line, i) => {
                const graphics = createText(canvas, width, lineHeight, line.slice(0, -1), font, fillStyle, textBaseline, letterSpacing, textAlign);
                graphics.y = i * lineHeight;
                text.add(graphics);
                text.totalWidth = Math.max(graphics.totalWidth, text.totalWidth);
                text.totalHeight += lineHeight;
            });
            return text;
        }

        function createText(canvas, width, height, str, font, fillStyle, textBaseline, letterSpacing, textAlign) {
            const context = canvas.context,
                graphics = new CanvasGraphics(width, height);
            graphics.font = font;
            graphics.fillStyle = fillStyle;
            graphics.textBaseline = textBaseline;
            graphics.totalWidth = 0;
            graphics.totalHeight = height;
            const characters = str.split('');
            let chr,
                index = 0,
                currentPosition = 0;
            context.font = font;
            for (let i = 0; i < characters.length; i++) graphics.totalWidth += context.measureText(characters[i]).width + letterSpacing;
            switch (textAlign) {
                case 'start':
                case 'left':
                    currentPosition = 0;
                    break;
                case 'end':
                case 'right':
                    currentPosition = width - graphics.totalWidth;
                    break;
                case 'center':
                    currentPosition = (width - graphics.totalWidth) / 2;
                    break;
            }
            do {
                chr = characters[index++];
                graphics.fillText(chr, currentPosition, 0);
                currentPosition += context.measureText(chr).width + letterSpacing;
            } while (index < str.length);
            return graphics;
        }
    }
}

/**
 * Video interface.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Video extends Component {

    constructor(params) {
        super();
        const self = this;
        this.loaded = {
            start: 0,
            end: 0,
            percent: 0
        };
        const event = {};
        let lastTime, buffering, seekTo, forceRender,
            tick = 0;

        createElement();
        if (params.preload !== false) preload();

        function createElement() {
            let src = params.src;
            if (src) src = Assets.CDN + src;
            self.element = document.createElement('video');
            if (src) self.element.src = src;
            self.element.controls = params.controls;
            self.element.id = params.id || '';
            self.element.width = params.width;
            self.element.height = params.height;
            self.element.loop = params.loop;
            self.object = new Interface(self.element);
            self.width = params.width;
            self.height = params.height;
            self.object.size(self.width, self.height);
            if (Device.mobile) {
                self.object.attr('webkit-playsinline', true);
                self.object.attr('playsinline', true);
            }
        }

        function preload() {
            self.element.preload = 'auto';
            self.element.load();
        }

        function step() {
            if (!self.element) return self.stopRender(step);
            self.duration = self.element.duration;
            self.time = self.element.currentTime;
            if (self.element.currentTime === lastTime) {
                tick++;
                if (tick > 30 && !buffering) {
                    buffering = true;
                    self.events.fire(Events.ERROR, null, true);
                }
            } else {
                tick = 0;
                if (buffering) {
                    self.events.fire(Events.READY, null, true);
                    buffering = false;
                }
            }
            lastTime = self.element.currentTime;
            if (self.element.currentTime >= (self.duration || self.element.duration) - 0.001) {
                if (!self.loop) {
                    if (!forceRender) self.stopRender(step);
                    self.events.fire(Events.COMPLETE, null, true);
                }
            }
            event.time = self.element.currentTime;
            event.duration = self.element.duration;
            event.loaded = self.loaded;
            self.events.fire(Events.UPDATE, event, true);
        }

        function checkReady() {
            if (!self.element) return false;
            if (!seekTo) {
                self.buffered = self.element.readyState === self.element.HAVE_ENOUGH_DATA;
            } else {
                const seekable = self.element.seekable;
                let max = -1;
                if (seekable) {
                    for (let i = 0; i < seekable.length; i++) if (seekable.start(i) < seekTo) max = seekable.end(i) - 0.5;
                    if (max >= seekTo) self.buffered = true;
                } else {
                    self.buffered = true;
                }
            }
            if (self.buffered) {
                self.stopRender(checkReady);
                self.events.fire(Events.READY, null, true);
            }
        }

        function handleProgress() {
            if (!self.ready()) return;
            const bf = self.element.buffered,
                time = self.element.currentTime;
            let range = 0;
            while (!(bf.start(range) <= time && time <= bf.end(range))) range += 1;
            self.loaded.start = bf.start(range) / self.element.duration;
            self.loaded.end = bf.end(range) / self.element.duration;
            self.loaded.percent = self.loaded.end - self.loaded.start;
            self.events.fire(Events.PROGRESS, self.loaded, true);
        }

        this.play = () => {
            this.playing = true;
            this.element.play();
            this.startRender(step);
        };

        this.pause = () => {
            this.playing = false;
            this.element.pause();
            this.stopRender(step);
        };

        this.stop = () => {
            this.playing = false;
            this.element.pause();
            this.stopRender(step);
            if (this.ready()) this.element.currentTime = 0;
        };

        this.volume = v => {
            this.element.volume = v;
            if (this.muted) {
                this.muted = false;
                this.object.attr('muted', '');
            }
        };

        this.mute = () => {
            this.volume(0);
            this.muted = true;
            this.object.attr('muted', true);
        };

        this.seek = t => {
            if (this.element.readyState <= 1) {
                this.delayedCall(() => {
                    if (this.seek) this.seek(t);
                }, 32);
                return;
            }
            this.element.currentTime = t;
        };

        this.canPlayTo = t => {
            seekTo = null;
            if (t) seekTo = t;
            if (!this.buffered) this.startRender(checkReady);
            return this.buffered;
        };

        this.ready = () => {
            return this.element.readyState > this.element.HAVE_CURRENT_DATA;
        };

        this.size = (w, h) => {
            this.element.width = this.width = w;
            this.element.height = this.height = h;
            this.object.size(this.width, this.height);
        };

        this.forceRender = () => {
            forceRender = true;
            this.startRender(step);
        };

        this.trackProgress = () => {
            this.element.addEventListener('progress', handleProgress, true);
        };

        this.destroy = () => {
            this.stop();
            this.element.src = '';
            this.object.destroy();
            return super.destroy();
        };
    }

    set loop(bool) {
        this.element.loop = bool;
    }

    get loop() {
        return this.element.loop;
    }

    set src(src) {
        this.element.src = Assets.CDN + src;
    }

    get src() {
        return this.element.src;
    }
}

/**
 * SVG interface.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class SVG {

    constructor(name, type, params) {
        const self = this;
        let svg;

        createSVG();

        function createSVG() {
            switch (type) {
                case 'svg':
                    createView();
                    break;
                case 'radialGradient':
                    createGradient();
                    break;
                case 'linearGradient':
                    createGradient();
                    break;
                default:
                    createElement();
                    break;
            }
        }

        function createView() {
            svg = new Interface(name, 'svg');
            svg.element.setAttribute('preserveAspectRatio', 'xMinYMid meet');
            svg.element.setAttribute('version', '1.1');
            svg.element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            if (params.width) {
                svg.element.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height);
                svg.element.style.width = params.width + 'px';
                svg.element.style.height = params.height + 'px';
            }
            self.object = svg;
        }

        function createElement() {
            svg = new Interface(name, 'svg', type);
            if (type === 'circle') setCircle();
            else if (type === 'radialGradient') setGradient();
            self.object = svg;
        }

        function setCircle() {
            ['cx', 'cy', 'r'].forEach(attr => {
                if (params.stroke && attr === 'r') svg.element.setAttributeNS(null, attr, params.width / 2 - params.stroke);
                else svg.element.setAttributeNS(null, attr, params.width / 2);
            });
        }

        function setGradient() {
            ['cx', 'cy', 'r', 'fx', 'fy', 'name'].forEach(attr => {
                svg.element.setAttributeNS(null, attr === 'name' ? 'id' : attr, params[attr]);
            });
            svg.element.setAttributeNS(null, 'gradientUnits', 'userSpaceOnUse');
        }

        function createColorStop(obj) {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            ['offset', 'style'].forEach(attr => {
                stop.setAttributeNS(null, attr, attr === 'style' ? 'stop-color:' + obj[attr] : obj[attr]);
            });
            return stop;
        }

        function createGradient() {
            createElement();
            params.colors.forEach(param => {
                svg.element.appendChild(createColorStop(param));
            });
        }

        this.addTo = element => {
            if (element.points) element = element.points;
            else if (element.element) element = element.element;
            else if (element.object) element = element.object.element;
            element.appendChild(svg.element);
        };

        this.destroy = () => {
            this.object.destroy();
            return Utils.nullObject(this);
        };
    }
}

/**
 * Scroll interaction.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Scroll extends Component {

    constructor(object, params) {
        super();
        if (!object || !object.element) {
            params = object;
            object = null;
        }
        if (!params) params = {};
        const self = this;
        this.x = 0;
        this.y = 0;
        this.max = {
            x: 0,
            y: 0
        };
        this.delta = {
            x: 0,
            y: 0
        };
        this.enabled = true;
        const scrollTarget = {
            x: 0,
            y: 0
        };
        let axes = ['x', 'y'];

        initParameters();
        addListeners();
        this.startRender(loop);

        function initParameters() {
            self.object = object;
            self.hitObject = params.hitObject || self.object;
            self.max.y = params.height || 0;
            self.max.x = params.width || 0;
            if (Array.isArray(params.axes)) axes = params.axes;
            if (self.object) self.object.css({ overflow: 'auto' });
        }

        function addListeners() {
            Stage.bind('wheel', scroll);
            if (self.hitObject) self.hitObject.bind('touchstart', e => e.preventDefault());
            const input = self.hitObject ? new Interaction(self.hitObject) : Mouse.input;
            self.events.add(input, Interaction.START, down);
            self.events.add(input, Interaction.DRAG, drag);
            self.events.add(input, Interaction.END, up);
            self.events.add(Events.RESIZE, resize);
            resize();
        }

        function stopInertia() {
            TweenManager.clearTween(scrollTarget);
        }

        function scroll(e) {
            if (!self.enabled) return;
            e.preventDefault();
            stopInertia();
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                scrollTarget[axis] += e['delta' + axis.toUpperCase()];
            });
        }

        function down() {
            if (!self.enabled) return;
            stopInertia();
        }

        function drag() {
            if (!self.enabled) return;
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                scrollTarget[axis] -= Mouse.input.delta[axis];
            });
        }

        function up() {
            if (!self.enabled) return;
            const m = (() => {
                    if (Device.os === 'android') return 35;
                    return 25;
                })(),
                obj = {};
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                obj[axis] = scrollTarget[axis] - Mouse.input.delta[axis] * m;
            });
            TweenManager.tween(scrollTarget, obj, 2500, 'easeOutQuint');
        }

        function resize() {
            if (!self.enabled) return;
            stopInertia();
            if (!self.object) return;
            const p = {};
            if (Device.mobile) axes.forEach(axis => p[axis] = self.max[axis] ? scrollTarget[axis] / self.max[axis] : 0);
            if (typeof params.height === 'undefined') self.max.y = self.object.element.scrollHeight - self.object.element.clientHeight;
            if (typeof params.width === 'undefined') self.max.x = self.object.element.scrollWidth - self.object.element.clientWidth;
            if (Device.mobile) axes.forEach(axis => self[axis] = scrollTarget[axis] = p[axis] * self.max[axis]);
        }

        function loop() {
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                scrollTarget[axis] = Math.clamp(scrollTarget[axis], 0, self.max[axis]);
                self.delta[axis] = scrollTarget[axis] - self[axis];
                self[axis] += self.delta[axis];
                if (self.object) {
                    if (axis === 'x') self.object.element.scrollLeft = self.x;
                    if (axis === 'y') self.object.element.scrollTop = self.y;
                }
            });
        }

        this.destroy = () => {
            Stage.unbind('wheel', scroll);
            return super.destroy();
        };
    }
}

/**
 * Slide interaction.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Slide extends Component {

    constructor(params = {}) {
        super();
        const self = this;
        this.x = 0;
        this.y = 0;
        this.max = {
            x: 0,
            y: 0
        };
        this.delta = {
            x: 0,
            y: 0
        };
        this.direction = {
            x: 0,
            y: 0
        };
        this.position = 0;
        this.progress = 0;
        this.floor = 0;
        this.ceil = 0;
        this.index = 0;
        this.enabled = true;
        const scrollTarget = {
                x: 0,
                y: 0
            },
            scrollInertia = {
                x: 0,
                y: 0
            },
            ease = Interpolation.convertEase('easeOutSine'),
            event = {};
        let axes = ['x', 'y'],
            slideIndex;

        initParameters();
        addListeners();
        this.startRender(loop);

        function initParameters() {
            self.num = params.num || 0;
            if (params.max) self.max = params.max;
            if (params.index) {
                self.index = params.index;
                self.x = scrollTarget.x = self.index * self.max.x;
                self.y = scrollTarget.y = self.index * self.max.y;
            }
            if (params.axes) axes = params.axes;
        }

        function addListeners() {
            Stage.bind('wheel', scroll);
            self.events.add(Mouse.input, Interaction.START, down);
            self.events.add(Mouse.input, Interaction.DRAG, drag);
            self.events.add(Events.KEYBOARD_DOWN, keyPress);
            self.events.add(Events.RESIZE, resize);
            resize();
        }

        function stopInertia() {
            self.isInertia = false;
            TweenManager.clearTween(scrollTarget);
        }

        function scroll(e) {
            if (!self.enabled) return;
            if (e.preventDefault) e.preventDefault();
            stopInertia();
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                scrollTarget[axis] += e['delta' + axis.toUpperCase()];
            });
        }

        function down() {
            if (!self.enabled) return;
            stopInertia();
        }

        function drag() {
            if (!self.enabled) return;
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                scrollTarget[axis] += -Mouse.input.delta[axis] * 4;
                scrollInertia[axis] = -Mouse.input.delta[axis] * 4;
                self.isInertia = true;
            });
        }

        function keyPress(e) {
            if (!self.enabled) return;
            if (e.keyCode === 40) self.next(); // Down
            if (e.keyCode === 39) self.next(); // Right
            if (e.keyCode === 38) self.prev(); // Up
            if (e.keyCode === 37) self.prev(); // Left
        }

        function resize() {
            if (!self.enabled) return;
            stopInertia();
        }

        function loop() {
            axes.forEach(axis => {
                if (!self.max[axis]) return;
                const progress = self[axis] / self.max[axis],
                    i = Math.round(progress);
                if (scrollTarget[axis] === i * self.max[axis]) return;
                if (scrollInertia[axis] !== 0) {
                    scrollInertia[axis] *= 0.9;
                    if (Math.abs(scrollInertia[axis]) < 0.001) scrollInertia[axis] = 0;
                    scrollTarget[axis] += scrollInertia[axis];
                }
                const limit = self.max[axis] * 0.035;
                scrollTarget[axis] += ease(Math.round(self.progress) - self.progress) * limit;
                if (Math.abs(scrollTarget[axis] - self[axis]) > limit) scrollTarget[axis] -= (scrollTarget[axis] - self[axis]) * 0.5;
                else if (Math.abs(scrollTarget[axis] - self[axis]) < 0.001) scrollTarget[axis] = i * self.max[axis];
                self.delta[axis] = scrollTarget[axis] - self[axis];
                self.delta[axis] = self.delta[axis] < 0 ? Math.max(self.delta[axis], -limit) : Math.min(self.delta[axis], limit);
                self[axis] += self.delta[axis];
            });
            self.position = (self.x + self.y) / (self.max.x + self.max.y) % self.num + self.num;
            self.progress = self.position % 1;
            self.floor = Math.floor(self.position) % self.num;
            self.ceil = Math.ceil(self.position) % self.num;
            self.index = Math.round(self.position) % self.num;
            if (slideIndex !== self.index) {
                slideIndex = self.index;
                self.direction.x = self.delta.x < 0 ? -1 : 1;
                self.direction.y = self.delta.y < 0 ? -1 : 1;
                event.index = self.index;
                event.direction = self.direction;
                self.events.fire(Events.UPDATE, event, true);
            }
        }

        this.goto = i => {
            const obj = {};
            obj.x = i * this.max.x;
            obj.y = i * this.max.y;
            TweenManager.tween(scrollTarget, obj, 2500, 'easeOutQuint');
        };

        this.next = () => {
            const progress = (this.x + this.y) / (this.max.x + this.max.y),
                i = Math.round(progress);
            this.goto(i + 1);
        };

        this.prev = () => {
            const progress = (this.x + this.y) / (this.max.x + this.max.y),
                i = Math.round(progress);
            this.goto(i - 1);
        };

        this.destroy = () => {
            Stage.unbind('wheel', scroll);
            return super.destroy();
        };
    }
}

/**
 * Slide video.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class SlideVideo extends Component {

    constructor(params, callback) {
        super();
        if (!SlideVideo.initialized) {
            SlideVideo.test = SlideVideo.test || !Device.mobile && Device.browser !== 'safari' && !Device.detect('trident');

            SlideVideo.initialized = true;
        }
        const self = this;
        this.events = new Events();
        this.img = params.img;
        if (this.img) this.img = Assets.CDN + this.img;
        this.src = params.src;
        if (this.src) this.src = Assets.CDN + this.src;

        if (this.src && SlideVideo.test) {
            window.fetch(this.src).then(response => {
                if (!response.ok) return error();
                response.blob().then(data => {
                    this.element = document.createElement('video');
                    this.element.src = URL.createObjectURL(data);
                    this.element.muted = true;
                    this.element.loop = true;
                    ready();
                    if (callback) callback();
                });
            }).catch(() => {
                error();
                if (callback) callback();
            });
        } else {
            const img = Assets.createImage(this.img);
            img.onload = () => {
                this.element = img;
                if (callback) callback();
            };
            img.onerror = error;
        }

        function error() {
            self.events.fire(Events.ERROR, null, true);
        }

        function ready() {
            self.element.addEventListener('playing', playing, true);
            self.element.addEventListener('pause', pause, true);
            if (self.willPlay) self.play();
        }

        function playing() {
            self.playing = true;
            self.events.fire(Events.READY, null, true);
        }

        function pause() {
            self.playing = false;
        }

        this.resume = () => {
            this.play(true);
        };

        this.play = (resume = false) => {
            this.willPlay = true;
            if (this.element && this.element.paused && !this.playing) {
                if (!resume) this.element.currentTime = 0;
                this.element.play();
            }
        };

        this.pause = () => {
            this.willPlay = false;
            if (this.element && !this.element.paused && this.playing) this.element.pause();
        };

        this.ready = () => {
            return this.element.readyState > this.element.HAVE_CURRENT_DATA;
        };

        this.destroy = () => {
            this.pause();
            this.element.src = '';
            return super.destroy();
        };
    }
}

/**
 * Slide loader with promise method.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class SlideLoader extends Component {

    constructor(slides, callback) {
        super();
        const self = this;
        this.events = new Events();
        this.list = [];
        this.pathList = [];
        let loaded = 0;

        slides.forEach(params => {
            this.list.push(this.initClass(SlideVideo, params, slideLoaded));
            this.pathList.push(params.path);
        });

        function slideLoaded() {
            self.percent = ++loaded / self.list.length;
            self.events.fire(Events.PROGRESS, { percent: self.percent }, true);
            if (loaded === self.list.length) complete();
        }

        function complete() {
            self.events.fire(Events.COMPLETE, null, true);
            if (callback) callback();
        }
    }

    static loadSlides(slides, callback) {
        const promise = Promise.create();
        if (!callback) callback = promise.resolve;
        promise.loader = new SlideLoader(slides, callback);
        return promise;
    }
}

/**
 * Linked list.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class LinkedList {

    constructor() {
        this.first = null;
        this.last = null;
        this.current = null;
        this.prev = null;
        const nodes = [];

        function add(object) {
            return nodes[nodes.push({ object, prev: null, next: null }) - 1];
        }

        function remove(object) {
            for (let i = nodes.length - 1; i >= 0; i--) {
                if (nodes[i].object === object) {
                    nodes[i] = null;
                    nodes.splice(i, 1);
                    break;
                }
            }
        }

        function destroy() {
            for (let i = nodes.length - 1; i >= 0; i--) {
                nodes[i] = null;
                nodes.splice(i, 1);
            }
            return Utils.nullObject(this);
        }

        function find(object) {
            for (let i = 0; i < nodes.length; i++) if (nodes[i].object === object) return nodes[i];
            return null;
        }

        this.push = object => {
            const obj = add(object);
            if (!this.first) {
                obj.next = obj.prev = this.last = this.first = obj;
            } else {
                obj.next = this.first;
                obj.prev = this.last;
                this.last.next = obj;
                this.last = obj;
            }
        };

        this.remove = object => {
            const obj = find(object);
            if (!obj || !obj.next) return;
            if (nodes.length <= 1) {
                this.empty();
            } else {
                if (obj === this.first) {
                    this.first = obj.next;
                    this.last.next = this.first;
                    this.first.prev = this.last;
                } else if (obj == this.last) {
                    this.last = obj.prev;
                    this.last.next = this.first;
                    this.first.prev = this.last;
                } else {
                    obj.prev.next = obj.next;
                    obj.next.prev = obj.prev;
                }
            }
            remove(object);
        };

        this.empty = () => {
            this.first = null;
            this.last = null;
            this.current = null;
            this.prev = null;
        };

        this.start = () => {
            this.current = this.first;
            this.prev = this.current;
            return this.current;
        };

        this.next = () => {
            if (!this.current) return;
            if (nodes.length === 1 || this.prev.next === this.first) return;
            this.current = this.current.next;
            this.prev = this.current;
            return this.current;
        };

        this.destroy = destroy;
    }
}

/**
 * Object pool.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class ObjectPool {

    constructor(type, number) {
        const pool = [];
        this.array = pool;

        if (type) for (let i = 0; i < number || 10; i++) pool.push(new type());

        this.get = () => {
            return pool.shift() || (type ? new type() : null);
        };

        this.empty = () => {
            pool.length = 0;
        };

        this.put = object => {
            pool.push(object);
        };

        this.insert = array => {
            if (!Array.isArray(array)) array = [array];
            pool.push(...array);
        };

        this.length = () => {
            return pool.length;
        };

        this.destroy = () => {
            for (let i = pool.length - 1; i >= 0; i--) if (pool[i].destroy) pool[i].destroy();
            return Utils.nullObject(this);
        };
    }
}

/**
 * 3D vector.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Vector3 {

    constructor(x, y, z, w) {
        this.x = typeof x === 'number' ? x : 0;
        this.y = typeof y === 'number' ? y : 0;
        this.z = typeof z === 'number' ? z : 0;
        this.w = typeof w === 'number' ? w : 1;
        this.type = 'vector3';
    }

    set(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
        return this;
    }

    clear() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this;
    }

    copyTo(p) {
        p.x = this.x;
        p.y = this.y;
        p.z = this.z;
        p.w = this.w;
        return p;
    }

    copyFrom(p) {
        this.x = p.x || 0;
        this.y = p.y || 0;
        this.z = p.z || 0;
        this.w = p.w || 1;
        return this;
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const m = 1 / this.length();
        this.set(this.x * m, this.y * m, this.z * m);
        return this;
    }

    setLength(length) {
        this.normalize().multiply(length);
        return this;
    }

    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }

    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }

    multiplyVectors(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    multiply(v) {
        this.x *= v;
        this.y *= v;
        this.z *= v;
        return this;
    }

    divide(v) {
        this.x /= v;
        this.y /= v;
        this.z /= v;
        return this;
    }

    limit(max) {
        if (this.length() > max) {
            this.normalize();
            this.multiply(max);
        }
    }

    heading2D() {
        return -Math.atan2(-this.y, this.x);
    }

    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    deltaLerp(v, alpha, delta = 1) {
        for (let i = 0; i < delta; i++) this.lerp(v, alpha);
        return this;
    }

    interp(v, alpha, ease, dist = 5000) {
        if (!this.calc) this.calc = new Vector3();
        this.calc.subVectors(this, v);
        const fn = Interpolation.convertEase(ease),
            a = fn(Math.clamp(Math.range(this.calc.lengthSq(), 0, dist * dist, 1, 0), 0, 1) * (alpha / 10));
        return this.lerp(v, a);
    }

    setAngleRadius(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        this.z = Math.sin(a) * r;
        return this;
    }

    addAngleRadius(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        this.z += Math.sin(a) * r;
        return this;
    }

    applyQuaternion(q) {
        const x = this.x,
            y = this.y,
            z = this.z,
            qx = q.x,
            qy = q.y,
            qz = q.z,
            qw = q.w,
            ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;
        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return this;
    }

    dot(a, b = this) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    cross(a, b = this) {
        const x = a.y * b.z - a.z * b.y,
            y = a.z * b.x - a.x * b.z,
            z = a.x * b.y - a.y * b.x;
        this.set(x, y, z, this.w);
        return this;
    }

    distanceTo(v, noSq) {
        const dx = this.x - v.x,
            dy = this.y - v.y,
            dz = this.z - v.z;
        if (!noSq) return Math.sqrt(dx * dx + dy * dy + dz * dz);
        return dx * dx + dy * dy + dz * dz;
    }

    solveAngle(a, b = this) {
        return Math.acos(a.dot(b) / (a.length() * b.length() || 0.00001));
    }

    solveAngle2D(a, b = this) {
        const calc = new Vector2(),
            calc2 = new Vector2();
        calc.copyFrom(a);
        calc2.copyFrom(b);
        return calc.solveAngle(calc2);
    }

    equals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    toString(split = ' ') {
        return this.x + split + this.y + split + this.z;
    }
}

/**
 * 3D utilities.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

/* global THREE */

class Utils3D {

    static decompose(local, world) {
        local.matrixWorld.decompose(world.position, world.quaternion, world.scale);
    }

    static createDebug(size = 40, color) {
        const geom = new THREE.IcosahedronGeometry(size, 1),
            mat = color ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshNormalMaterial();
        return new THREE.Mesh(geom, mat);
    }

    static createRT(width, height) {
        const params = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        return new THREE.WebGLRenderTarget(width, height, params);
    }

    static getTexture(src) {
        if (!this.textures) this.textures = {};
        if (!this.textures[src]) {
            const img = Assets.createImage(Assets.CDN + src),
                texture = new THREE.Texture(img);
            img.onload = () => {
                texture.needsUpdate = true;
                if (texture.onload) {
                    texture.onload();
                    texture.onload = null;
                }
                if (!THREE.Math.isPowerOfTwo(img.width * img.height)) texture.minFilter = THREE.LinearFilter;
            };
            this.textures[src] = texture;
        }
        return this.textures[src];
    }

    static setInfinity(v) {
        const inf = Number.POSITIVE_INFINITY;
        v.set(inf, inf, inf);
        return v;
    }

    static freezeMatrix(mesh) {
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
    }

    static getCubemap(src) {
        const path = 'cube_' + (Array.isArray(src) ? src[0] : src);
        if (!this.textures) this.textures = {};
        if (!this.textures[path]) {
            const images = [];
            for (let i = 0; i < 6; i++) {
                const img = Assets.createImage(Assets.CDN + (Array.isArray(src) ? src[i] : src));
                images.push(img);
                img.onload = () => this.textures[path].needsUpdate = true;
            }
            this.textures[path] = new THREE.Texture(images);
            this.textures[path].minFilter = THREE.LinearFilter;
        }
        return this.textures[path];
    }

    static loadObject(data) {
        if (!this.objectLoader) this.objectLoader = new THREE.ObjectLoader();
        return this.objectLoader.parse(data);
    }

    static loadGeometry(data) {
        if (!this.geomLoader) this.geomLoader = new THREE.JSONLoader();
        if (!this.bufferGeomLoader) this.bufferGeomLoader = new THREE.BufferGeometryLoader();
        if (data.type === 'BufferGeometry') return this.bufferGeomLoader.parse(data);
        else return this.geomLoader.parse(data.data).geometry;
    }

    static disposeAllTextures() {
        for (let key in this.textures) this.textures[key].dispose();
    }

    static loadBufferGeometry(data) {
        const geometry = new THREE.BufferGeometry();
        if (data.data) data = data.data;
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position), 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal || data.position.length), 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv || data.position.length / 3 * 2), 2));
        return geometry;
    }

    static loadSkinnedGeometry(data) {
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position), 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal), 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv), 2));
        geometry.addAttribute('skinIndex', new THREE.BufferAttribute(new Float32Array(data.skinIndices), 4));
        geometry.addAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(data.skinWeights), 4));
        geometry.bones = data.bones;
        return geometry;
    }

    static loadCurve(data) {
        const points = [];
        for (let i = 0; i < data.length; i += 3) points.push(new THREE.Vector3(data[i + 0], data[i + 1], data[i + 2]));
        return new THREE.CatmullRomCurve3(points);
    }

    static setLightCamera(light, size, near, far, texture) {
        light.shadow.camera.left = -size;
        light.shadow.camera.right = size;
        light.shadow.camera.top = size;
        light.shadow.camera.bottom = -size;
        light.castShadow = true;
        if (near) light.shadow.camera.near = near;
        if (far) light.shadow.camera.far = far;
        if (texture) light.shadow.mapSize.width = light.shadow.mapSize.height = texture;
        light.shadow.camera.updateProjectionMatrix();
    }

    static getRepeatTexture(src) {
        const texture = this.getTexture(src);
        texture.onload = () => texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
}

/**
 * Raycaster.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

/* global THREE */

class Raycaster extends Component {

    constructor(camera) {
        super();
        this.camera = camera;
        const calc = new THREE.Vector2(),
            raycaster = new THREE.Raycaster();
        let debug;

        function ascSort(a, b) {
            return a.distance - b.distance;
        }

        function intersectObject(object, raycaster, intersects, recursive) {
            if (object.visible === false) return;
            let parent = object.parent;
            while (parent) {
                if (parent.visible === false) return;
                parent = parent.parent;
            }
            object.raycast(raycaster, intersects);
            if (recursive === true) object.children.forEach(object => intersectObject(object, raycaster, intersects, true));
        }

        function intersect(objects) {
            if (!Array.isArray(objects)) objects = [objects];
            const intersects = [];
            objects.forEach(object => intersectObject(object, raycaster, intersects, false));
            intersects.sort(ascSort);
            if (debug) updateDebug();
            return intersects;
        }

        function updateDebug() {
            const vertices = debug.geometry.vertices;
            vertices[0].copy(raycaster.ray.origin.clone());
            vertices[1].copy(raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(10000)));
            debug.geometry.verticesNeedUpdate = true;
        }

        this.pointsThreshold = value => {
            raycaster.params.Points.threshold = value;
        };

        this.debug = scene => {
            const geom = new THREE.Geometry();
            geom.vertices.push(new THREE.Vector3(-100, 0, 0));
            geom.vertices.push(new THREE.Vector3(100, 0, 0));
            const mat = new THREE.LineBasicMaterial({ color: 0x0000ff });
            debug = new THREE.Line(geom, mat);
            scene.add(debug);
        };

        this.checkHit = (objects, mouse = Mouse) => {
            const rect = this.rect || Stage;
            if (mouse === Mouse && rect === Stage) {
                calc.copy(Mouse.tilt);
            } else {
                calc.x = mouse.x / rect.width * 2 - 1;
                calc.y = -(mouse.y / rect.height) * 2 + 1;
            }
            raycaster.setFromCamera(calc, camera);
            return intersect(objects);
        };

        this.checkFromValues = (objects, origin, direction) => {
            raycaster.set(origin, direction, 0, Number.POSITIVE_INFINITY);
            return intersect(objects);
        };
    }
}

/**
 * 3D interaction.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

class Interaction3D {

    constructor(camera) {
        if (!Interaction3D.initialized) {
            Interaction3D.HOVER = 'interaction3d_hover';
            Interaction3D.CLICK = 'interaction3d_click';

            Interaction3D.initialized = true;
        }
        const self = this;
        this.events = new Events();
        this.ray = new Raycaster(camera);
        this.meshes = [];
        this.meshCallbacks = [];
        this.cursor = 'auto';
        this.enabled = true;
        const event = {};
        let hoverTarget, clickTarget;

        addListeners();

        function addListeners() {
            Mouse.input.events.add(Interaction.START, start);
            Mouse.input.events.add(Interaction.MOVE, move);
            Mouse.input.events.add(Interaction.CLICK, click);
        }

        function start() {
            if (!self.enabled) return;
            const hit = move();
            if (hit) {
                clickTarget = hit.object;
                clickTarget.time = Render.TIME;
            } else {
                clickTarget = null;
            }
        }

        function move() {
            if (!self.enabled) return;
            const hit = self.ray.checkHit(self.meshes)[0];
            if (hit) {
                const mesh = hit.object;
                if (mesh !== hoverTarget) {
                    if (hoverTarget) triggerHover('out', hoverTarget);
                    hoverTarget = mesh;
                    triggerHover('over', hoverTarget);
                    Stage.css('cursor', 'pointer');
                }
                return hit;
            } else {
                if (hoverTarget) {
                    triggerHover('out', hoverTarget);
                    hoverTarget = null;
                    Stage.css('cursor', self.cursor);
                }
                return false;
            }
        }

        function click() {
            if (!self.enabled) return;
            if (!clickTarget) return;
            const hit = self.ray.checkHit(self.meshes)[0];
            if (hit && hit.object === clickTarget) triggerClick(clickTarget);
            clickTarget = null;
        }

        function triggerHover(action, mesh) {
            event.action = action;
            event.mesh = mesh;
            self.events.fire(Interaction3D.HOVER, event, true);
            const i = self.meshes.indexOf(hoverTarget);
            if (self.meshCallbacks[i].hoverCallback) self.meshCallbacks[i].hoverCallback(event);
        }

        function triggerClick(mesh) {
            event.action = 'click';
            event.mesh = mesh;
            self.events.fire(Interaction3D.CLICK, event, true);
            const i = self.meshes.indexOf(clickTarget);
            if (self.meshCallbacks[i].clickCallback) self.meshCallbacks[i].clickCallback(event);
        }

        function parseMeshes(meshes) {
            if (!Array.isArray(meshes)) meshes = [meshes];
            const output = [];
            meshes.forEach(checkMesh);

            function checkMesh(mesh) {
                if (mesh.type === 'Mesh' && mesh.mouseEnabled) output.push(mesh);
                if (mesh.children.length) mesh.children.forEach(checkMesh);
            }

            return output;
        }

        this.add = (meshes, hoverCallback, clickCallback, parse) => {
            if (!Array.isArray(meshes) || parse) meshes = parseMeshes(meshes);
            meshes.forEach(mesh => {
                this.meshes.push(mesh);
                this.meshCallbacks.push({ hoverCallback, clickCallback });
            });
        };

        this.remove = (meshes, parse) => {
            if (!Array.isArray(meshes) || parse) meshes = parseMeshes(meshes);
            meshes.forEach(mesh => {
                if (mesh === hoverTarget) {
                    triggerHover('out', hoverTarget);
                    hoverTarget = null;
                    Stage.css('cursor', this.cursor);
                }
                for (let i = this.meshes.length - 1; i >= 0; i--) {
                    if (this.meshes[i] === mesh) {
                        this.meshes.splice(i, 1);
                        this.meshCallbacks.splice(i, 1);
                    }
                }
            });
        };

        this.destroy = () => {
            return Utils.nullObject(this);
        };
    }

    set camera(c) {
        this.ray.camera = c;
    }
}

/**
 * Screen projection.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

/* global THREE */

class ScreenProjection extends Component {

    constructor(camera) {
        super();
        const v3 = new THREE.Vector3(),
            v32 = new THREE.Vector3(),
            value = new THREE.Vector3;

        this.set = v => {
            camera = v;
        };

        this.unproject = (mouse, distance) => {
            const rect = this.rect || Stage;
            v3.set(mouse.x / rect.width * 2 - 1, -(mouse.y / rect.height) * 2 + 1, 0.5);
            v3.unproject(camera);
            const pos = camera.position;
            v3.sub(pos).normalize();
            const dist = distance || -pos.z / v3.z;
            value.copy(pos).add(v3.multiplyScalar(dist));
            return value;
        };

        this.project = pos => {
            const rect = this.rect || Stage;
            if (pos instanceof THREE.Object3D) {
                pos.updateMatrixWorld();
                v32.set(0, 0, 0).setFromMatrixPosition(pos.matrixWorld);
            } else {
                v32.copy(pos);
            }
            v32.project(camera);
            v32.x = (v32.x + 1) / 2 * rect.width;
            v32.y = -(v32.y - 1) / 2 * rect.height;
            return v32;
        };
    }
}

/**
 * Shader helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

/* global THREE */

class Shader extends Component {

    constructor(vertexShader, fragmentShader, props) {
        super();
        const self = this;
        this.uniforms = {};
        this.properties = {};

        initProperties();
        initShaders();

        function initProperties() {
            for (let key in props) {
                if (typeof props[key].value !== 'undefined') self.uniforms[key] = props[key];
                else self.properties[key] = props[key];
            }
        }

        function initShaders() {
            const params = {};
            params.vertexShader = process(vertexShader, 'vs');
            params.fragmentShader = process(fragmentShader, 'fs');
            params.uniforms = self.uniforms;
            for (let key in self.properties) params[key] = self.properties[key];
            self.material = new THREE.RawShaderMaterial(params);
            self.material.shader = self;
            self.uniforms = self.material.uniforms;
        }

        function process(code, type) {
            let header;
            if (type === 'vs') {
                header = [
                    'precision highp float;',
                    'precision highp int;',
                    'attribute vec2 uv;',
                    'attribute vec3 position;',
                    'attribute vec3 normal;',
                    'uniform mat4 modelViewMatrix;',
                    'uniform mat4 projectionMatrix;',
                    'uniform mat4 modelMatrix;',
                    'uniform mat4 viewMatrix;',
                    'uniform mat3 normalMatrix;',
                    'uniform vec3 cameraPosition;'
                ].join('\n');
            } else {
                header = [
                    ~code.indexOf('dFdx') ? '#extension GL_OES_standard_derivatives : enable' : '',
                    'precision highp float;',
                    'precision highp int;',
                    'uniform mat4 modelViewMatrix;',
                    'uniform mat4 projectionMatrix;',
                    'uniform mat4 modelMatrix;',
                    'uniform mat4 viewMatrix;',
                    'uniform mat3 normalMatrix;',
                    'uniform vec3 cameraPosition;'
                ].join('\n');
            }
            code = header + '\n\n' + code;
            const threeChunk = (a, b) => {
                return THREE.ShaderChunk[b] + '\n';
            };
            return code.replace(/#s?chunk\(\s?(\w+)\s?\);/g, threeChunk);
        }
    }

    set(key, value) {
        TweenManager.clearTween(this.uniforms[key]);
        this.uniforms[key].value = value;
    }

    tween(key, value, time, ease, delay, callback, update) {
        return TweenManager.tween(this.uniforms[key], { value }, time, ease, delay, callback, update);
    }

    getValues() {
        const out = {};
        for (let key in this.uniforms) out[key] = this.uniforms[key].value;
        return out;
    }

    copyUniformsTo(object) {
        for (let key in this.uniforms) object.uniforms[key] = this.uniforms[key];
    }

    cloneUniformsTo(object) {
        for (let key in this.uniforms) object.uniforms[key] = { type: this.uniforms[key].type, value: this.uniforms[key].value };
    }

    destroy() {
        this.material.dispose();
        return super.destroy();
    }
}

/**
 * Post processing effects.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

/* global THREE */

class Effects extends Component {

    constructor(stage, params) {
        super();
        const self = this;
        this.stage = stage;
        this.renderer = params.renderer;
        this.scene = params.scene;
        this.camera = params.camera;
        this.shader = params.shader;
        this.dpr = params.dpr || 1;
        let renderTarget, camera, scene, mesh;

        initEffects();
        addListeners();

        function initEffects() {
            renderTarget = Utils3D.createRT(self.stage.width * self.dpr, self.stage.height * self.dpr);
            self.texture = renderTarget.texture;
            self.texture.minFilter = THREE.LinearFilter;
            camera = new THREE.OrthographicCamera(self.stage.width / -2, self.stage.width / 2, self.stage.height / 2, self.stage.height / -2, 1, 1000);
            scene = new THREE.Scene();
            mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), self.shader.material);
            scene.add(mesh);
        }

        function addListeners() {
            self.events.add(Events.RESIZE, resize);
        }

        function resize() {
            renderTarget.dispose();
            renderTarget = Utils3D.createRT(self.stage.width * self.dpr, self.stage.height * self.dpr);
            camera.left = self.stage.width / -2;
            camera.right = self.stage.width / 2;
            camera.top = self.stage.height / 2;
            camera.bottom = self.stage.height / -2;
            camera.updateProjectionMatrix();
        }

        this.render = () => {
            this.renderer.render(this.scene, this.camera, renderTarget, true);
            mesh.material.uniforms.texture.value = renderTarget.texture;
            this.renderer.render(scene, camera);
        };
    }
}

/**
 * Alien abduction point.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */
