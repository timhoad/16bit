const container = document.getElementById('imageContainer');
const imageCount = 18;
const totalImages = 36;

// Fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

// Use a true random shuffle for different layouts on every reload
function shuffle(array) {
  let result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const shuffled = shuffle(images);

  // Set up a grid but fill only 90% of the width and height for less edge clustering
  const numImages = shuffled.length;
  const gridCols = Math.ceil(Math.sqrt(numImages * screenWidth / screenHeight));
  const gridRows = Math.ceil(numImages / gridCols);

  const gridMarginX = screenWidth * 0.05;
  const gridMarginY = screenHeight * 0.05;
  const usableWidth = screenWidth - 2 * gridMarginX;
  const usableHeight = screenHeight - 2 * gridMarginY;

  const cellWidth = usableWidth / gridCols;
  const cellHeight = usableHeight / gridRows;
  const baseSize = Math.max(cellWidth, cellHeight) * 1.1; // 10% larger

  let imgIndex = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (imgIndex >= numImages) break;

      const img = document.createElement('img');
      img.src = shuffled[imgIndex];
      img.alt = "";

      // Position within the grid cell, with jitter (up to 40% of cell size)
      let x = gridMarginX + col * cellWidth + cellWidth / 2;
      let y = gridMarginY + row * cellHeight + cellHeight / 2;

      const jitterX = (Math.random() - 0.5) * cellWidth * 0.4;
      const jitterY = (Math.random() - 0.5) * cellHeight * 0.4;
      x += jitterX;
      y += jitterY;

      // Clamp so image stays within the usable area
      const marginX = baseSize * 0.5;
      const marginY = baseSize * 0.5;
      x = Math.max(gridMarginX + marginX, Math.min(screenWidth - gridMarginX - marginX, x));
      y = Math.max(gridMarginY + marginY, Math.min(screenHeight - gridMarginY - marginY, y));

      // Size: 10% larger, with slight random variation
      const size = baseSize * (0.98 + 0.1 * Math.random());
      img.style.width = `${size}px`;
      img.style.height = "auto";
      img.style.position = "absolute";
      img.style.left = `${x - size / 2}px`;
      img.style.top = `${y - size / 2}px`;

      // Natural rotation and z-index
      const angle = -20 + 40 * Math.random();
      img.style.transform = `rotate(${angle}deg)`;
      img.style.zIndex = `${10 + Math.floor(10 * Math.random())}`;

      // Fade-in initial state
      img.style.opacity = "0";
      img.style.transition = "opacity 2.0s cubic-bezier(0.63,0.01,0.33,1.01)";

      container.appendChild(img);

      // Use requestAnimationFrame for reliable fade-in
      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      imgIndex++;
    }
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});