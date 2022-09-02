class Queue {
  constructor() {
    this._queue = [];
  }

  put(item) {
    this._queue.unshift(item);
  }

  get() {
    return this._queue.pop();
  }

  get length() {
    return this._queue.length;
  }
}

export default Queue;
