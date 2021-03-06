/**
 * Accelerometer helper class.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import { Device } from '../util/Device.js';

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

export { Accelerometer };
