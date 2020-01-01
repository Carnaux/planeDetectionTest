// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/r0lvsMPGEoY

class Blob {
    constructor(x, y) {
      this.minx = x;
      this.miny = y;
      this.maxx = x;
      this.maxy = y;
    }

    add(x, y) {
      this.minx = min(this.minx, x);
      this.miny = min(this.miny, y);
      this.maxx = max(this.maxx, x);
      this.maxy = max(this.maxy, y);
    }

    size() {
      return (this.maxx - this.minx) * (this.maxy - this.miny);
    }
  
    getCenter() {
      const x = (this.maxx - this.minx) * 0.5 + this.minx;
      const y = (this.maxy - this.miny) * 0.5 + this.miny;
      return createVector(x, y);
    }
  
    isNear(x, y) {
      const cx = max(min(x, this.maxx), this.minx);
      const cy = max(min(y, this.maxy), this.miny);
      const d = distSq(cx, cy, x, y);
      if (d < distThreshold * distThreshold) {
        return true;
      } else {
        return false;
      }
    }
  }