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

const canvas = ref(null);

const cellSize = ref(40);
const height = ref(10);
const width = ref(10);

const start = {x: Math.floor(Math.random() * width.value), y: Math.floor(Math.random() * height.value)};
const end = {x: Math.floor(Math.random() * width.value), y: Math.floor(Math.random() * height.value)};
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
      map[x][y] = Math.floor(Math.random() * 100) < 75 ? states.EMPTY : states.WALL;

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
  const from = {};
  from[`${start.x}-${start.y}`] = null;

  while (frontier.length > 0) {
    const current = frontier.pop();

    if (map[current.x][current.y] === states.NEXT) {
      map[current.x][current.y] = states.FRONTIER;
      drawCell(current.x, current.y, states.FRONTIER);
      if (current.y > from[`${current.x}-${current.y}`].y) {
        drawCell(current.x, current.y, directions.UP);
      }
      if (current.x > from[`${current.x}-${current.y}`].x) {
        drawCell(current.x, current.y, directions.LEFT);
      }
      if (current.y < from[`${current.x}-${current.y}`].y) {
        drawCell(current.x, current.y, directions.DOWN);
      }
      if (current.x < from[`${current.x}-${current.y}`].x) {
        drawCell(current.x, current.y, directions.RIGHT);
      }

      await sleep(10);
    }

    const neighbours = getNeighbours(current);

    while (neighbours.length > 0) {
      const next = neighbours.shift();

      if (map[next.x][next.y] === states.EMPTY) {
        frontier.unshift(next);

        map[next.x][next.y] = states.NEXT;
        from[`${next.x}-${next.y}`] = current;
        drawCell(next.x, next.y, states.NEXT);

        await sleep(10);
      }

      if (next.x === end.x && next.y === end.y) {
        from[`${next.x}-${next.y}`] = current;
      }
    }

    if (from[`${end.x}-${end.y}`]) {
      break;
    }
  }

  if (from[`${end.x}-${end.y}`]) {
    if (end.y > from[`${end.x}-${end.y}`].y) {
      drawCell(end.x, end.y, directions.UP);
    }
    if (end.x > from[`${end.x}-${end.y}`].x) {
      drawCell(end.x, end.y, directions.LEFT);
    }
    if (end.y < from[`${end.x}-${end.y}`].y) {
      drawCell(end.x, end.y, directions.DOWN);
    }
    if (end.x < from[`${end.x}-${end.y}`].x) {
      drawCell(end.x, end.y, directions.RIGHT);
    }

    const path = [];
    let current = {x: end.x, y: end.y};
    do {
      path.push({
        x: current.x,
        y: current.y,
      });

      current = {
        x: from[`${current.x}-${current.y}`].x,
        y: from[`${current.x}-${current.y}`].y
      };
    } while (from[`${current.x}-${current.y}`]);

    while (path.length > 0) {
      const move = path.pop();
      drawCell(move.x, move.y, states.START);
      await sleep(50);
    }
  }
}

const getNeighbours = ({x, y}) => {
  let neighbours = [];

  if (y > 0) {
    neighbours.push({x, y: y - 1});
  }

  if (x < width.value - 1) {
    neighbours.push({x: x + 1, y});
  }

  if (y < height.value - 1) {
    neighbours.push({x, y: y + 1});
  }

  if (x > 0) {
    neighbours.push({x: x - 1, y});
  }

  return neighbours;
}

onMounted(async () => {
  while (start.x === end.x && start.y === end.y) {
    end.x = Math.floor(Math.random() * width.value);
    end.y = Math.floor(Math.random() * height.value);
  }

  images.value = {
    [states.END]: await loadImage('./img/end.svg', cellSize.value, cellSize.value),
    [states.EMPTY]: await loadImage('./img/empty.svg', cellSize.value, cellSize.value),
    [states.FRONTIER]: await loadImage('./img/frontier.svg', cellSize.value, cellSize.value),
    [states.NEXT]: await loadImage('./img/next.svg', cellSize.value, cellSize.value),
    [states.START]: await loadImage('./img/start.svg', cellSize.value, cellSize.value),
    [states.WALL]: await loadImage('./img/wall.svg', cellSize.value, cellSize.value),

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