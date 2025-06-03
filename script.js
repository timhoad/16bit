const container = document.getElementById('imageContainer');
const imageCount = 18;
const totalImages = 36;

// Fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

// Deterministic shuffle to avoid repeats next to each other
function seededShuffle(array, seed) {
  let result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Try to avoid identical images adjacent in the array
  for (let i = 1; i < result.length; i++) {
    if (result[i] === result[i - 1]) {
      let swap = i + 1;
      while (swap < result.length && result[swap] === result[i]) swap++;
      if (swap < result.length) {
        [result[i], result[swap]] = [result[swap], result[i]];
      }
    }
  }
  return result;
}

// Anchor adjacency map: which anchor indices are 'neighbors'
const neighborMap = {
  0: [1,3],
  1: [0,2],
  2: [1,4],
  3: [0,5],
  4: [2,7],
  5: [3,6],
  6: [5,7],
  7: [4,6],
};

// Swap one Donkey Kong in the anchors with a Red Ghost if both are present
function swapDonkeyKongWithRedGhost(shuffled, anchorsCount) {
  let donkeyKong = 'images/image1.png';
  let redGhosts = ['images/image10.png', 'images/image11.png'];
  let dkIndices = [];
  for (let i = 0; i < anchorsCount; i++) {
    if (shuffled[i] === donkeyKong) dkIndices.push(i);
  }
  if (dkIndices.length >= 2) {
    for (let j = anchorsCount; j < shuffled.length; j++) {
      if (redGhosts.includes(shuffled[j])) {
        [shuffled[dkIndices[1]], shuffled[j]] = [shuffled[j], shuffled[dkIndices[1]]];
        break;
      }
    }
  }
  return shuffled;
}

function ensureNoAdjacentAnchorDuplicates(shuffled, anchorsCount) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < anchorsCount; i++) {
      for (let n of neighborMap[i] || []) {
        if (shuffled[i] === shuffled[n]) {
          for (let j = anchorsCount; j < shuffled.length; j++) {
            let safe = true;
            for (let k = 0; k < anchorsCount; k++) {
              if (k !== i && shuffled[j] === shuffled[k]) {
                safe = false;
                break;
              }
            }
            if (safe && shuffled[j] !== shuffled[i]) {
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              changed = true;
              break;
            }
          }
        }
        if (changed) break;
      }
      if (changed) break;
    }
  }
  return shuffled;
}

// Deterministic "random" number in [0,1)
function pseudoRandom(seed) {
  return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
}

// Spread images using grid with jitter for even coverage
function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  let shuffled = seededShuffle(images, 12345);

  // 8 anchors for edges/corners
  const anchors = [
    [0, 0],
    [screenWidth / 2, 0],
    [screenWidth - 1, 0],
    [0, screenHeight / 2],
    [screenWidth - 1, screenHeight / 2],
    [0, screenHeight - 1],
    [screenWidth / 2, screenHeight - 1],
    [screenWidth - 1, screenHeight - 1],
  ];

  // Ensure no adjacent anchors are identical & swap Donkey Kong/Red Ghost if needed
  shuffled = ensureNoAdjacentAnchorDuplicates(shuffled, anchors.length);
  shuffled = swapDonkeyKongWithRedGhost(shuffled, anchors.length);

  // Use a grid for even distribution (with jitter for natural look)
  const numImages = shuffled.length;
  const aspect = screenWidth / screenHeight;
  const gridCols = Math.ceil(Math.sqrt(numImages * aspect));
  const gridRows = Math.ceil(numImages / gridCols);

  let imgIndex = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (imgIndex >= numImages) break;

      const img = document.createElement('img');
      img.src = shuffled[imgIndex];
      img.alt = "";
      img.style.opacity = "0";
      img.style.transition = "opacity 2.2s cubic-bezier(0.63,0.01,0.33,1.01)";

      // Compute cell size and center
      const cellWidth = screenWidth / gridCols;
      const cellHeight = screenHeight / gridRows;
      let x = col * cellWidth + cellWidth / 2;
      let y = row * cellHeight + cellHeight / 2;

      // Jitter (max 15% of cell size, except for edges/corners which are clamped)
      let jitterRangeX = cellWidth * 0.3;
      let jitterRangeY = cellHeight * 0.3;
      let jitterX = (pseudoRandom(imgIndex * 7) - 0.5) * jitterRangeX;
      let jitterY = (pseudoRandom(imgIndex * 13) - 0.5) * jitterRangeY;
      x += jitterX;
      y += jitterY;

      // Clamp edge/corner images so they always touch the border
      if (col === 0) x = Math.max(x, cellWidth * 0.3);
      if (col === gridCols - 1) x = Math.min(x, screenWidth - cellWidth * 0.3);
      if (row === 0) y = Math.max(y, cellHeight * 0.3);
      if (row === gridRows - 1) y = Math.min(y, screenHeight - cellHeight * 0.3);

      // Size: slight variation, generally larger than cell for overlap
      const baseSize = Math.max(cellWidth, cellHeight) * 1.55;
      const size = baseSize * (0.85 + 0.3 * pseudoRandom(imgIndex * 19));
      img.style.width = `${size}px`;
      img.style.height = "auto";
      img.style.left = `${x - size / 2}px`;
      img.style.top = `${y - size / 2}px`;

      // Rotation & z-index
      const angle = -35 + 70 * pseudoRandom(imgIndex * 23);
      img.style.transform = `rotate(${angle}deg)`;
      img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(imgIndex * 29))}`;

      container.appendChild(img);

      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      imgIndex++;
    }
  }
}

function clearImages() {
  container.innerHTML = '';
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});