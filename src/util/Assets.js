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

export { Assets };
