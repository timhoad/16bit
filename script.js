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
  return result;
}

// Deterministic "random" number in [0,1)
function pseudoRandom(seed) {
  return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
}

// Helper: anchor points for corners and edges
function edgeAnchors(width, height) {
  return [
    [0, 0],                                 // top-left
    [width / 2, 0],                         // top-center
    [width - 1, 0],                         // top-right
    [0, height / 2],                        // left-center
    [width - 1, height / 2],                // right-center
    [0, height - 1],                        // bottom-left
    [width / 2, height - 1],                // bottom-center
    [width - 1, height - 1],                // bottom-right
  ];
}

// Vogel/Fermat spiral for even, organic coverage
function vogelSpiralPosition(i, n, width, height) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const r = Math.sqrt(i / n) * 0.5; // radius (0..0.5)
  const theta = i * goldenAngle;
  const x = (0.5 + r * Math.cos(theta)) * width;
  const y = (0.5 + r * Math.sin(theta)) * height;
  return [x, y];
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const shuffled = seededShuffle(images, 12345);

  // 8 anchors for edges/corners
  const anchors = edgeAnchors(screenWidth, screenHeight);

  // Place each image
  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";

    let x, y;
    // First 8 images at explicit anchors
    if (i < anchors.length) {
      [x, y] = anchors[i];
      // Small inward offset so corners/edges are covered well and image is not mostly offscreen
      const offset = Math.min(screenWidth, screenHeight) * 0.08;
      if (x === 0) x += offset;
      if (x === screenWidth - 1) x -= offset;
      if (y === 0) y += offset;
      if (y === screenHeight - 1) y -= offset;
    } else {
      // Spread others by Vogel spiral for even organic fill
      [x, y] = vogelSpiralPosition(i - anchors.length, shuffled.length - anchors.length, screenWidth, screenHeight);
      // Add deterministic jitter for natural look
      const jitter = Math.min(screenWidth, screenHeight) * 0.09;
      x += (pseudoRandom(i + 321) - 0.5) * jitter;
      y += (pseudoRandom(i + 654) - 0.5) * jitter;
    }

    // Sizing: Edge/corner images a bit larger, others slightly smaller but still overlapping
    const minSize = Math.min(screenWidth, screenHeight) * (i < anchors.length ? 0.43 : 0.36);
    const maxSize = Math.min(screenWidth, screenHeight) * (i < anchors.length ? 0.6 : 0.5);
    const prSeed = 5555 + i * 777;
    const size = minSize + (maxSize - minSize) * pseudoRandom(prSeed + 3);

    img.style.width = `${size}px`;
    img.style.height = "auto";
    img.style.left = `${x - size / 2}px`;
    img.style.top = `${y - size / 2}px`;

    // Rotation: -35 to +35 deg, deterministic
    const angle = -35 + 70 * pseudoRandom(prSeed + 4);
    img.style.transform = `rotate(${angle}deg)`;

    // Deterministic z-index for layering variety
    img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(prSeed + 8))}`;

    container.appendChild(img);
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});