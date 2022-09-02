class PriorityQueue {
  constructor() {
    this._queue = [];
  }

  put(item, priority = 0) {
    this._queue.unshift({
      item,
      priority
    });

    this._queue.sort((a, b) => {
      if (a.priority > b.priority) {
        return -1;
      }

      if (a.priority < b.priority) {
        return 1;
      }

      return 0;
    })
  }

  get() {
    return this._queue.pop()?.item;
  }

  get length() {
    return this._queue.length;
  }
}

export default PriorityQueue;
