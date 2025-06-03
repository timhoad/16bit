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

function clearImages() {
  container.innerHTML = '';
}

// Poisson Disk Sampling, but restrict most points to a 90% centered box
function poissonDiskSampleBox(width, height, minDist, numPoints, k = 30, boxPercent = 0.90) {
  // Bridson's algorithm (2D) with bounding box
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

  // Define the 90% box
  const boxMarginX = (1.0 - boxPercent) * width / 2;
  const boxMarginY = (1.0 - boxPercent) * height / 2;
  const minX = boxMarginX;
  const maxX = width - boxMarginX;
  const minY = boxMarginY;
  const maxY = height - boxMarginY;

  // Start with initial point in the box
  let x0 = width / 2 + (pseudoRandom(9999) - 0.5) * minDist * 0.5;
  let y0 = height / 2 + (pseudoRandom(5555) - 0.5) * minDist * 0.5;
  points.push([x0, y0]);
  let idx0 = gridIndex(x0, y0);
  grid[idx0] = 0;
  active.push(0);

  while (active.length && points.length < Math.floor(numPoints * boxPercent)) {
    let randIndex = Math.floor(pseudoRandom(points.length * 3333) * active.length);
    let idx = active[randIndex];
    let found = false;
    for (let n = 0; n < k; n++) {
      let angle = 2 * Math.PI * pseudoRandom(points.length * 777 + n);
      let radius = minDist * (1 + pseudoRandom(points.length * 111 + n));
      let px = points[idx][0] + radius * Math.cos(angle);
      let py = points[idx][1] + radius * Math.sin(angle);
      if (
        px >= minX && px <= maxX &&
        py >= minY && py <= maxY &&
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

  // Fill the remaining points (10%) across the full area (covering edges/corners)
  while (points.length < numPoints) {
    let x = (pseudoRandom(points.length * 17) * (width - minDist)) + minDist / 2;
    let y = (pseudoRandom(points.length * 37) * (height - minDist)) + minDist / 2;
    points.push([x, y]);
  }

  // If too many points, trim (should rarely happen)
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
  // 90% of points inside 90% box, 10% anywhere (edges/corners)
  const points = poissonDiskSampleBox(screenWidth, screenHeight, minDist, images.length, 30, 0.90);

  // Place each image at a point, with a little jitter for overlap
  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";
    img.style.opacity = "0";
    img.style.transition = "opacity 2.2s cubic-bezier(0.63,0.01,0.33,1.01)";

    let [x, y] = points[i];

    // Jitter for non-edge points only (keeps edges/corners filled)
    if (i < Math.floor(images.length * 0.9)) {
      const jitter = minDist * 0.12;
      x += (pseudoRandom(i * 7) - 0.5) * jitter;
      y += (pseudoRandom(i * 13) - 0.5) * jitter;
      // Clamp to 90% box
      const boxMarginX = (1.0 - 0.90) * screenWidth / 2;
      const boxMarginY = (1.0 - 0.90) * screenHeight / 2;
      x = Math.max(boxMarginX, Math.min(screenWidth - boxMarginX, x));
      y = Math.max(boxMarginY, Math.min(screenHeight - boxMarginY, y));
    } else {
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