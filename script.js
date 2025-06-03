const container = document.getElementById('imageContainer');
const imageCount = 18;
const totalImages = 36; // Use each image twice

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
  return result;
}

// Deterministic "random" number in [0,1)
function pseudoRandom(seed) {
  return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Shuffle images deterministically
  const shuffled = seededShuffle(images, 12345);

  // Divide into a grid for even coverage
  const gridCols = 6;
  const gridRows = 6;
  const cellWidth = screenWidth / gridCols;
  const cellHeight = screenHeight / gridRows;

  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";

    // Which grid cell does this image go in?
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);

    // Center of cell
    let centerX = col * cellWidth + cellWidth / 2;
    let centerY = row * cellHeight + cellHeight / 2;

    // For edge/corner images, make sure they reach the border
    // Clamp center for first/last row/col
    if (col === 0) centerX = Math.max(centerX, cellWidth * 0.42);
    if (col === gridCols - 1) centerX = Math.min(centerX, screenWidth - cellWidth * 0.42);
    if (row === 0) centerY = Math.max(centerY, cellHeight * 0.42);
    if (row === gridRows - 1) centerY = Math.min(centerY, screenHeight - cellHeight * 0.42);

    // Size: Large enough to overlap but not to hide everything
    const minSize = Math.min(cellWidth, cellHeight) * 2.0;
    const maxSize = Math.min(cellWidth, cellHeight) * 2.5;
    const prSeed = 5555 + i * 777;
    const size = minSize + (maxSize - minSize) * pseudoRandom(prSeed + 3);

    img.style.width = `${size}px`;
    img.style.height = "auto";

    // Position: Center of cell + SMALL deterministic jitter (to avoid grid look, but not bunching)
    const jitterRange = Math.min(cellWidth, cellHeight) * 0.18;
    const jitterX = (pseudoRandom(prSeed + 1) - 0.5) * jitterRange;
    const jitterY = (pseudoRandom(prSeed + 2) - 0.5) * jitterRange;

    // Final position is centered on (centerX + jitterX, centerY + jitterY)
    const x = centerX + jitterX - size / 2;
    const y = centerY + jitterY - size / 2;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Rotation: -35 to +35 deg, deterministic
    const angle = -35 + 70 * pseudoRandom(prSeed + 4);
    img.style.transform = `rotate(${angle}deg)`;

    container.appendChild(img);
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});