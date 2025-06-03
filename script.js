const container = document.getElementById('imageContainer');
const imageCount = 18; // Number of distinct images
const totalImages = 36; // 2x each image

// Deterministically fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

// Deterministic hash for "random" values in [0,1)
function pseudoRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  for (let i = 0; i < images.length; i++) {
    const img = document.createElement('img');
    img.src = images[i];
    img.alt = "";

    // Deterministic "random" for position, size, angle
    // Spread positions across the viewport, but allow overlap
    const px = pseudoRandom(i * 13 + 1);
    const py = pseudoRandom(i * 17 + 2);

    // Coverage: allow images to extend slightly past edges
    const minSize = Math.min(screenWidth, screenHeight) * 0.18;
    const maxSize = Math.min(screenWidth, screenHeight) * 0.38;
    const size = minSize + (maxSize - minSize) * pseudoRandom(i * 23 + 3);

    // X, Y position: from (-0.15*size) to (width/height - 0.85*size) so they can overlap edges
    const x = -0.15 * size + px * (screenWidth - 0.7 * size);
    const y = -0.15 * size + py * (screenHeight - 0.7 * size);

    img.style.width = `${size}px`;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.height = "auto";

    // Deterministic angle between -40 and +40
    const angle = -40 + 80 * pseudoRandom(i * 31 + 7);
    img.style.transform = `rotate(${angle}deg)`;

    container.appendChild(img);
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});