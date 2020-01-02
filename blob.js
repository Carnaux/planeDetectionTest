// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/r0lvsMPGEoY

class Blob {
    constructor(x, y, p) {
      this.minx = x;
      this.miny = y;
      this.maxx = x;
      this.maxy = y;
      this.n = 1;
      this.pixelArr = [{x: x, y: y, p: p}];
    }

    add(x, y, p) {
      this.minx = Math.min(this.minx, x);
      this.miny = Math.min(this.miny, y);
      this.maxx = Math.max(this.maxx, x);
      this.maxy = Math.max(this.maxy, y);
      this.n++;
      this.pixelArr.push({x: x, y: y, p: p});
    }

    size() {
      return (this.maxx - this.minx) * (this.maxy - this.miny);
    }

    become(other) {
      this.minx = other.minx;
      this.maxx = other.maxx;
      this.miny = other.miny;
      this.maxy = other.maxy;
    }
 
    getCenter() {
      const x = (this.maxx - this.minx) * 0.5 + this.minx;
      const y = (this.maxy - this.miny) * 0.5 + this.miny;
      return new THREE.Vector2(x,y);
    }
  
    isNear(x, y) {
      const cx = Math.max(Math.min(x, this.maxx), this.minx);
      const cy = Math.max(Math.min(y, this.maxy), this.miny);
      const d = distSq(cx, cy, x, y);
      if (d < distThreshold * distThreshold) {
        return true;
      } else {
        return false;
      }
    }
}