const container = document.getElementById('imageContainer');
const imageCount = 18; // Number of distinct images
const totalCells = 36; // 6x6 grid

// Fill image array deterministically: each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const cols = 6;
  const rows = 6;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const slotWidth = screenWidth / cols;
  const slotHeight = screenHeight / rows;

  for (let index = 0; index < totalCells; index++) {
    const src = images[index];
    const img = document.createElement('img');
    img.src = src;
    img.alt = "";

    const col = index % cols;
    const row = Math.floor(index / cols);

    // Deterministic size: vary by row and col, ensure overlap
    // Sizes between 110% and 140% of the slot, based on grid position
    const sizeFactor = 1.1 + ((col * 0.07 + row * 0.09) % 0.3); // range 1.1-1.4
    const size = Math.max(slotWidth, slotHeight) * sizeFactor;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    // Deterministic rotation: unique but fixed for each cell
    const baseAngle = -25 + 10 * (col % 3) + 8 * (row % 4);
    img.style.transform = `rotate(${baseAngle}deg)`;

    // Position: center the image in its slot, but allow it to overlap for coverage
    const offsetX = (size - slotWidth) / 2;
    const offsetY = (size - slotHeight) / 2;
    img.style.left = `${col * slotWidth - offsetX}px`;
    img.style.top = `${row * slotHeight - offsetY}px`;

    container.appendChild(img);
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});