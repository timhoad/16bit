const container = document.getElementById('imageContainer');
const imageCount = 18;
const totalImages = 36;

// Fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

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

// Improved: Grid with strong jitter, 10% larger images, and fade-in
function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const shuffled = seededShuffle(images, 12345);

  // Grid dimensions (force a square grid for equal spread)
  const numImages = shuffled.length;
  const aspect = screenWidth / screenHeight;
  const gridCols = Math.ceil(Math.sqrt(numImages * aspect));
  const gridRows = Math.ceil(numImages / gridCols);

  // Image size (base) -- increased by 10%
  const cellWidth = screenWidth / gridCols;
  const cellHeight = screenHeight / gridRows;
  const baseSize = Math.max(cellWidth, cellHeight) * 1.7; // was 1.55, now 1.7

  let imgIndex = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (imgIndex >= numImages) break;

      const img = document.createElement('img');
      img.src = shuffled[imgIndex];
      img.alt = "";
      img.style.opacity = "0";
      img.style.transition = "opacity 1.7s cubic-bezier(0.63,0.01,0.33,1.01)";

      // Position in a grid cell, but with strong jitter (up to 36% of cell size)
      let x = col * cellWidth + cellWidth / 2;
      let y = row * cellHeight + cellHeight / 2;
      const strongJitterX = (pseudoRandom(imgIndex * 7) - 0.5) * cellWidth * 0.36;
      const strongJitterY = (pseudoRandom(imgIndex * 13) - 0.5) * cellHeight * 0.36;
      x += strongJitterX;
      y += strongJitterY;

      // Clamp to keep 90% of image inside the screen
      const marginX = baseSize * 0.45;
      const marginY = baseSize * 0.45;
      x = Math.max(marginX, Math.min(screenWidth - marginX, x));
      y = Math.max(marginY, Math.min(screenHeight - marginY, y));

      // 10% larger size and jitter
      const size = baseSize * (0.85 + 0.3 * pseudoRandom(imgIndex * 19)) * 1.10; // +10%
      img.style.width = `${size}px`;
      img.style.height = "auto";
      img.style.left = `${x - size / 2}px`;
      img.style.top = `${y - size / 2}px`;

      // Rotation & z-index
      const angle = -35 + 70 * pseudoRandom(imgIndex * 23);
      img.style.transform = `rotate(${angle}deg)`;
      img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(imgIndex * 29))}`;

      container.appendChild(img);

      // Fade in with stagger
      setTimeout(() => {
        img.style.opacity = "1";
      }, 120 + Math.floor(imgIndex * 40 + pseudoRandom(imgIndex + 7777) * 200));

      imgIndex++;
    }
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});