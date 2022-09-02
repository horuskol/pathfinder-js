<template>
    <div :style="{width: width * cellSize}" class="m-4">
        <canvas ref="canvas"
                :width="width * cellSize"
                :height="height * cellSize"
                @mousedown="startSelectingCells"
                @mouseup="endSelectingCells"
                @mousemove="setCell"
        ></canvas>
    </div>
</template>

<script setup>
import {onMounted, nextTick, ref} from 'vue';
import Point from '../lib/Point';

const canvas = ref(null);

const cellSize = ref(40);
const height = ref(20);
const width = ref(20);

const start = ref({});
const end = ref({});
const map = ref({});

const images = ref({});

const mapStates = {
  EMPTY: 'empty',
  WALL: 'wall',
  WATER: 'water',
}

const states = {
  END: 'end',
  FRONTIER: 'frontier',
  NEXT: 'next',
  START: 'start',
}

const directions = {
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left',
}

const startSelectingCells = (event) => {

}

const endSelectingCells = (event) => {

}

const setCell = (event) => {

}

const drawCell = (x, y, cellState) => {
  const context = canvas.value.getContext('2d');

  context.drawImage(images.value[cellState], (x * cellSize.value), (y * cellSize.value));
}

const loadImage = async (url, height, width) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const png = new Image();
      const cnv = document.createElement('canvas');
      cnv.height = height;
      cnv.width = width;
      const ctx = cnv.getContext('2d');

      ctx.drawImage(image, 0, 0, height, width);
      png.src = cnv.toDataURL();
      resolve(png);
    }
    image.onerror = reject;

    image.src = url;
  });
}

const initialiseMap = () => {
  map.value = {};

  start.value = new Point(Math.floor(Math.random() * width.value), Math.floor(Math.random() * height.value));
  end.value = new Point(Math.floor(Math.random() * width.value), Math.floor(Math.random() * height.value));
  while (start.value.equals(end.value)) {
    end.value = new Point(Math.floor(Math.random() * width.value), Math.floor(Math.random() * height.value));
  }

  for (let x = 0; x < width.value; x++) {
    for (let y = 0; y < height.value; y++) {
      const point = new Point(x, y);

      map.value[point.stringify()] = Math.floor(Math.random() * 100) < 75 ? mapStates.EMPTY : mapStates.WALL;

      if (start.value.equals(point)) {
        map.value[point.stringify()] = states.START;
      }

      if (end.value.equals(point)) {
        map.value[point.stringify()] = states.END;
      }

      const neighbours = point.getNeighbours();
      if (map.value[point.stringify()] === mapStates.EMPTY)
      {
        if (Math.floor(Math.random() * 100) < 5) {
          map.value[point.stringify()] = mapStates.WATER;
        }

        if (neighbours.find((neighbour) => (map.value[neighbour.stringify()] === mapStates.WATER))
            && Math.floor(Math.random() * 100) < 50) {
          map.value[point.stringify()] = mapStates.WATER;
        }
      }
    }
  }

  refresh();
};

const refresh = () => {
  for (let x = 0; x < width.value; x++) {
    for (let y = 0; y < height.value; y++) {
      const point = new Point(x, y);
      drawCell(x, y, map.value[point.stringify()]);
    }
  }
}

const findPath = async () => {
  const from = {};
  const frontier = [new Point(start.value)];
  from[start.value.stringify()] = null;

  while (frontier.length > 0) {
    const current = frontier.pop();

    if (map.value[current.stringify()] === states.NEXT) {
      if (current.y > from[current.stringify()].y) {
        drawCell(current.x, current.y, directions.UP);
      }
      if (current.x > from[current.stringify()].x) {
        drawCell(current.x, current.y, directions.LEFT);
      }
      if (current.y < from[current.stringify()].y) {
        drawCell(current.x, current.y, directions.DOWN);
      }
      if (current.x < from[current.stringify()].x) {
        drawCell(current.x, current.y, directions.RIGHT);
      }

      await sleep(50);
    }

    const neighbours = current.getNeighbours();

    while (neighbours.length > 0) {
      const next = neighbours.shift();

      if (map.value[next.stringify()]
        && [mapStates.EMPTY, mapStates.WATER].includes(map.value[next.stringify()])
      ) {
        frontier.unshift(next);

        map.value[next.stringify()] = states.NEXT;
        from[next.stringify()] = current;

        await sleep(50);
      }

      if (next.equals(end.value)) {
        from[next.stringify()] = current;
      }
    }

    if (from[end.value.stringify()]) {
      break;
    }
  }

  if (from[end.value.stringify()]) {
    if (end.y > from[end.value.stringify()].y) {
      drawCell(end.x, end.y, directions.UP);
    }
    if (end.x > from[end.value.stringify()].x) {
      drawCell(end.x, end.y, directions.LEFT);
    }
    if (end.y < from[end.value.stringify()].y) {
      drawCell(end.x, end.y, directions.DOWN);
    }
    if (end.x < from[end.value.stringify()].x) {
      drawCell(end.x, end.y, directions.RIGHT);
    }
    const path = [];
    let current = new Point(end.value);
    do {
      path.push(new Point(current));

      current = new Point(from[current.stringify()]);
    } while (from[current.stringify()]);

    while (path.length > 0) {
      const move = path.pop();
      drawCell(move.x, move.y, states.START);
      await sleep(50);
    }
  }

  await sleep(1000);
  initialiseMap();
  await findPath();
}

onMounted(async () => {
  images.value = {
    [mapStates.EMPTY]: await loadImage('./img/map/empty.svg', cellSize.value, cellSize.value),
    [mapStates.WALL]: await loadImage('./img/map/wall.svg', cellSize.value, cellSize.value),
    [mapStates.WATER]: await loadImage('./img/map/water.svg', cellSize.value, cellSize.value),

    [states.END]: await loadImage('./img/end.svg', cellSize.value, cellSize.value),
    [states.FRONTIER]: await loadImage('./img/frontier.svg', cellSize.value, cellSize.value),
    [states.NEXT]: await loadImage('./img/next.svg', cellSize.value, cellSize.value),
    [states.START]: await loadImage('./img/start.svg', cellSize.value, cellSize.value),

    [directions.UP]: await loadImage('./img/arrows/up.svg', cellSize.value, cellSize.value),
    [directions.RIGHT]: await loadImage('./img/arrows/right.svg', cellSize.value, cellSize.value),
    [directions.DOWN]: await loadImage('./img/arrows/down.svg', cellSize.value, cellSize.value),
    [directions.LEFT]: await loadImage('./img/arrows/left.svg', cellSize.value, cellSize.value),
  }

  await nextTick(async () => {
    initialiseMap();

    await findPath();
  });
});

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
</script>