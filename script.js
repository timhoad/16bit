const container = document.getElementById('imageContainer');
const imageCount = 18;
const totalImages = 36; // Use each image twice

// Fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

// Fisher-Yates shuffle (deterministic, based on a fixed seed)
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

  // Shuffle images deterministically so repeats are not next to each other
  const shuffled = seededShuffle(images, 12345);

  // Divide the screen into a grid for even distribution
  const gridCols = 6;
  const gridRows = 6;
  const cellWidth = screenWidth / gridCols;
  const cellHeight = screenHeight / gridRows;

  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";

    // Which grid cell?
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);

    // Deterministic offset within cell for organic look
    const prSeed = 5555 + i * 777;
    const offsetX = pseudoRandom(prSeed + 1) * (cellWidth * 0.35) - cellWidth * 0.175;
    const offsetY = pseudoRandom(prSeed + 2) * (cellHeight * 0.35) - cellHeight * 0.175;

    // Make images large so they overlap, but not so large they always spill off the screen
    const minSize = Math.min(cellWidth, cellHeight) * 2.0;
    const maxSize = Math.min(cellWidth, cellHeight) * 2.7;
    const size = minSize + (maxSize - minSize) * pseudoRandom(prSeed + 3);

    img.style.width = `${size}px`;
    img.style.height = "auto";

    // Compute position so images are centered in their cell plus offset
    const x = col * cellWidth + (cellWidth - size) / 2 + offsetX;
    const y = row * cellHeight + (cellHeight - size) / 2 + offsetY;
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