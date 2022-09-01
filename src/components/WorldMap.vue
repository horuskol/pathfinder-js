<template>
    <div :style="{width: width * cellSize}" class="m-4">
        <h1>Hi</h1>
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
const map = [];

const images = ref({});

const states = {
  EMPTY: 'empty',
  START: 'start',
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
  console.log('initialise');
  for (let x = 0; x < width.value; x++) {
    map[x] = [];

    for (let y = 0; y < height.value; y++) {
      map[x][y] = states.EMPTY;

      if (start.x === x && start.y === y) {
        map[x][y] = states.START;
      }

      drawCell(x, y, map[x][y]);
    }
  }
};

onMounted(async () => {
  images.value = {
    [states.START]: await loadImage('./img/start.svg', cellSize.value, cellSize.value),
    [states.EMPTY]: await loadImage('./img/empty.svg', cellSize.value, cellSize.value),
  }

  initialiseMap();
});
</script>