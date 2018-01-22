/**
 * 3D utilities.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

/* global THREE */

import { Assets } from '../util/Assets.js';

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

export { Utils3D };
