/**
 * Loader helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import { Events } from './Events.js';
import { Component } from './Component.js';

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

export { MultiLoader };
