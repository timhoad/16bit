const container = document.getElementById('imageContainer');
const imageCount = 18; // Number of distinct images
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

  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";

    // Deterministic "random" for position, size, angle
    const prSeed = 5555 + i * 777;
    const px = pseudoRandom(prSeed + 1);
    const py = pseudoRandom(prSeed + 2);

    // Size: 34% - 65% of the smaller dimension (increased from previous 18-40)
    const minSize = Math.min(screenWidth, screenHeight) * 0.34;
    const maxSize = Math.min(screenWidth, screenHeight) * 0.65;
    const size = minSize + (maxSize - minSize) * pseudoRandom(prSeed + 3);

    img.style.width = `${size}px`;
    img.style.height = "auto";

    // X, Y: from -10% size (left/top overflow) to (screen - 90% size) (right/bottom overflow)
    const x = -0.10 * size + px * (screenWidth - 0.80 * size);
    const y = -0.10 * size + py * (screenHeight - 0.80 * size);
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