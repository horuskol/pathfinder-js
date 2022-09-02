class Point {
  constructor(x, y) {
    if (typeof x === "object") {
      y = x.y;
      x = x.x;
    }

    this._x = x;
    this._y = y;
  }

  move(x, y) {
    return new Point(this._x + x, this._y + y);
  }

  getNeighbours() {
    return [
      this.move(0, -1),
      this.move(1, 0),
      this.move(0, 1),
      this.move(-1, 0)
    ];
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  stringify() {
    return `${this._x}-${this._y}`;
  }

  equals(point) {
    return point.x === this._x && point.y === this._y;
  }
}

export default Point;