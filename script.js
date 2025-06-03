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

function pseudoRandom(seed) {
  return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
}

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

function clearImages() {
  container.innerHTML = '';
}

// Poisson Disk Sampling for more even but organic placement
function poissonDiskSample(width, height, minDist, numPoints, k = 30) {
  // Bridson's algorithm (2D)
  let grid = [];
  let active = [];
  let points = [];
  let cellSize = minDist / Math.SQRT2;
  let gridWidth = Math.ceil(width / cellSize);
  let gridHeight = Math.ceil(height / cellSize);
  for (let i = 0; i < gridWidth * gridHeight; i++) grid[i] = -1;

  function gridIndex(x, y) {
    return Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridWidth;
  }

  function inNeighbourhood(x, y) {
    let gx = Math.floor(x / cellSize);
    let gy = Math.floor(y / cellSize);
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        let nx = gx + i;
        let ny = gy + j;
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          let idx = nx + ny * gridWidth;
          let pIdx = grid[idx];
          if (pIdx !== -1) {
            let dx = points[pIdx][0] - x;
            let dy = points[pIdx][1] - y;
            if (dx * dx + dy * dy < minDist * minDist) return true;
          }
        }
      }
    }
    return false;
  }

  // Start with initial point in center with jitter
  let x0 = width / 2 + (pseudoRandom(9999) - 0.5) * minDist * 0.5;
  let y0 = height / 2 + (pseudoRandom(5555) - 0.5) * minDist * 0.5;
  points.push([x0, y0]);
  let idx0 = gridIndex(x0, y0);
  grid[idx0] = 0;
  active.push(0);

  while (active.length && points.length < numPoints) {
    let randIndex = Math.floor(pseudoRandom(points.length * 3333) * active.length);
    let idx = active[randIndex];
    let found = false;
    for (let n = 0; n < k; n++) {
      let angle = 2 * Math.PI * pseudoRandom(points.length * 777 + n);
      let radius = minDist * (1 + pseudoRandom(points.length * 111 + n));
      let px = points[idx][0] + radius * Math.cos(angle);
      let py = points[idx][1] + radius * Math.sin(angle);
      if (
        px >= minDist / 2 && px <= width - minDist / 2 &&
        py >= minDist / 2 && py <= height - minDist / 2 &&
        !inNeighbourhood(px, py)
      ) {
        points.push([px, py]);
        let newIdx = gridIndex(px, py);
        grid[newIdx] = points.length - 1;
        active.push(points.length - 1);
        found = true;
        break;
      }
    }
    if (!found) active.splice(randIndex, 1);
  }

  // If not enough points, fill with jittered grid points
  while (points.length < numPoints) {
    let x = (pseudoRandom(points.length * 17) * (width - minDist)) + minDist / 2;
    let y = (pseudoRandom(points.length * 37) * (height - minDist)) + minDist / 2;
    points.push([x, y]);
  }

  // If too many points, trim (this should rarely happen)
  if (points.length > numPoints) points = points.slice(0, numPoints);

  return points;
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const shuffled = seededShuffle(images, 12345);

  // Poisson disk sample: distance is a function of screen and image count
  const minDist = 0.85 * Math.sqrt((screenWidth * screenHeight) / images.length);
  const points = poissonDiskSample(screenWidth, screenHeight, minDist, images.length);

  // Explicitly anchor at least the four corners
  const anchorIndices = [0, 1, 2, 3];
  points[anchorIndices[0]] = [0 + minDist * 0.6, 0 + minDist * 0.6]; // top-left
  points[anchorIndices[1]] = [screenWidth - minDist * 0.6, 0 + minDist * 0.6]; // top-right
  points[anchorIndices[2]] = [0 + minDist * 0.6, screenHeight - minDist * 0.6]; // bottom-left
  points[anchorIndices[3]] = [screenWidth - minDist * 0.6, screenHeight - minDist * 0.6]; // bottom-right

  // Place each image at a point, with a little jitter for overlap
  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";
    img.style.opacity = "0";
    img.style.transition = "opacity 2.2s cubic-bezier(0.63,0.01,0.33,1.01)";

    let [x, y] = points[i];

    // For anchors, don't jitter; for others, jitter slightly
    if (!anchorIndices.includes(i)) {
      const jitter = minDist * 0.12;
      x += (pseudoRandom(i * 7) - 0.5) * jitter;
      y += (pseudoRandom(i * 13) - 0.5) * jitter;
      // Clamp to screen
      x = Math.max(minDist * 0.3, Math.min(screenWidth - minDist * 0.3, x));
      y = Math.max(minDist * 0.3, Math.min(screenHeight - minDist * 0.3, y));
    }

    const size = minDist * (1.5 + 0.25 * pseudoRandom(i * 19));
    img.style.width = `${size}px`;
    img.style.height = "auto";
    img.style.left = `${x - size / 2}px`;
    img.style.top = `${y - size / 2}px`;

    const angle = -35 + 70 * pseudoRandom(i * 23);
    img.style.transform = `rotate(${angle}deg)`;
    img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(i * 29))}`;

    container.appendChild(img);

    requestAnimationFrame(() => {
      img.style.opacity = "1";
    });
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});