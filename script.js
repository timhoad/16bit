const container = document.getElementById('imageContainer');
const imageCount = 18; // Number of distinct images
const totalImages = 36; // 6x6 grid

// Deterministically fill array with each image twice, in order
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

  for (let index = 0; index < totalImages; index++) {
    const src = images[index];
    const img = document.createElement('img');
    img.src = src;
    img.alt = ""; // Decorative

    const col = index % cols;
    const row = Math.floor(index / cols);

    // Fixed variety in size: alternate by row, col, index for determinism
    // Images overlap their slots by 20% for edge-to-edge coverage
    const baseSize = Math.max(slotWidth, slotHeight) * 1.25;
    const sizeMod = 0.9 + 0.1 * ((col % 2) ^ (row % 2));
    const size = baseSize * sizeMod;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    // Position: center image in its slot, shifted for overlap
    const overlapX = (size - slotWidth) / 2;
    const overlapY = (size - slotHeight) / 2;
    let x = col * slotWidth - overlapX;
    let y = row * slotHeight - overlapY;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Angle: deterministic by row/col
    const rotation = -20 + 8 * col + 5 * row;
    img.style.transform = `rotate(${rotation}deg)`;

    container.appendChild(img);
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});