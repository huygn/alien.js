/**
 * Slide loader with promise method.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import { Events } from '../util/Events.js';
import { Component } from '../util/Component.js';
import { SlideVideo } from './SlideVideo.js';

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

export { SlideLoader };
