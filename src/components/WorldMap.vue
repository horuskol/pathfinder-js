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
import {onMounted, ref} from 'vue';

const canvas = ref(null);

const cellSize = ref(20);
const height = ref(20);
const width = ref(20);

const start = {x: 10, y: 10};
const end = {x: 5, y: 5};
const map = [];

const images = ref({});

const states = {
  END: 'end',
  EMPTY: 'empty',
  FRONTIER: 'frontier',
  NEXT: 'next',
  START: 'start',
  WALL: 'wall',
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
    let image = new Image();

    image.onload = () => {
      let png = new Image();
      let cnv = document.createElement('canvas');
      cnv.height = height;
      cnv.width = width;
      let ctx = cnv.getContext('2d');

      ctx.drawImage(image, 0, 0, height, width);
      png.src = cnv.toDataURL();
      resolve(png);
    }
    image.onerror = reject;

    image.src = url;
  });
}

const initialiseMap = () => {
  for (let x = 0; x < width.value; x++) {
    map[x] = [];

    for (let y = 0; y < height.value; y++) {
      map[x][y] = Math.floor(Math.random() * 100) < 90 ? states.EMPTY : states.WALL;

      if (start.x === x && start.y === y) {
        map[x][y] = states.START;
      }

      if (end.x === x && end.y === y) {
        map[x][y] = states.END;
      }
    }
  }

  refresh();
};

const refresh = () => {
  for (let x = 0; x < width.value; x++) {
    for (let y = 0; y < height.value; y++) {
      drawCell(x, y, map[x][y]);
    }
  }
}

const findPath = async () => {
  const frontier = [{x: start.x, y: start.y}];

  while (frontier.length > 0) {
    const current = frontier.pop();

    if (map[current.x][current.y] === states.NEXT) {
      map[current.x][current.y] = states.FRONTIER;
      drawCell(current.x, current.y, states.FRONTIER);

      await sleep(10);
    }

    const neighbours = getNeighbours(current);

    while (neighbours.length > 0) {
      const next = neighbours.shift();

      frontier.unshift(next);

      map[next.x][next.y] = states.NEXT;
      drawCell(next.x, next.y, states.NEXT);

      await sleep(10);
    }
  }

  console.log('done');
}

const getNeighbours = ({x, y}) => {
  let neighbours = [];

  if (y > 0 && map[x][y - 1] === states.EMPTY) {
    neighbours.push({x, y: y - 1});
  }

  if (x < width.value - 1 && map[x + 1][y] === states.EMPTY) {
    neighbours.push({x: x + 1, y});
  }

  if (y < height.value - 1 && map[x][y + 1] === states.EMPTY) {
    neighbours.push({x, y: y + 1});
  }

  if (x > 0 && map[x - 1][y] === states.EMPTY) {
    neighbours.push({x: x - 1, y});
  }

  return neighbours;
}

onMounted(async () => {
  images.value = {
    [states.END]: await loadImage('./img/end.svg', cellSize.value, cellSize.value),
    [states.EMPTY]: await loadImage('./img/empty.svg', cellSize.value, cellSize.value),
    [states.FRONTIER]: await loadImage('./img/frontier.svg', cellSize.value, cellSize.value),
    [states.NEXT]: await loadImage('./img/next.svg', cellSize.value, cellSize.value),
    [states.START]: await loadImage('./img/start.svg', cellSize.value, cellSize.value),
    [states.WALL]: await loadImage('./img/wall.svg', cellSize.value, cellSize.value),

    [directions.UP]: await loadImage('./img/up.svg', cellSize.value, cellSize.value),
    [directions.RIGHT]: await loadImage('./img/right.svg', cellSize.value, cellSize.value),
    [directions.DOWN]: await loadImage('./img/down.svg', cellSize.value, cellSize.value),
    [directions.LEFT]: await loadImage('./img/left.svg', cellSize.value, cellSize.value),
  }

  initialiseMap();

  await findPath();
});

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
</script>