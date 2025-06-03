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
      // Find next different image and swap
      let swap = i + 1;
      while (swap < result.length && result[swap] === result[i]) swap++;
      if (swap < result.length) {
        [result[i], result[swap]] = [result[swap], result[i]];
      }
    }
  }
  return result;
}

// Ensure no adjacent anchor images are the same (corners & edges)
function ensureNoAdjacentDuplicates(shuffled, anchorsCount) {
  // Anchor adjacency map: which anchor indices are 'neighbors'
  const neighborMap = {
    0: [1,3],
    1: [0,2],
    2: [1,4],
    3: [0,5],
    4: [2,7],
    5: [3,6],
    6: [5,7],
    7: [4,6],
  };
  for (let i = 0; i < anchorsCount; i++) {
    for (let n of neighborMap[i] || []) {
      if (shuffled[i] === shuffled[n]) {
        // Find a non-anchor, non-duplicate image to swap in
        for (let j = anchorsCount; j < shuffled.length; j++) {
          if (
            shuffled[j] !== shuffled[i] &&
            !Object.values(neighborMap).some(list =>
              list.includes(j) && shuffled[j] === shuffled[list.find(l => l !== j)])
          ) {
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            break;
          }
        }
      }
    }
  }
  return shuffled;
}

// Deterministic "random" number in [0,1)
function pseudoRandom(seed) {
  return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
}

// Vogel/Fermat spiral for even, organic coverage
function vogelSpiralPosition(i, n, width, height, spiralJitter = 0.25) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const r = Math.sqrt((i + 0.5) / n) * 0.48 + pseudoRandom(i * 777) * spiralJitter * 0.5;
  const theta = i * goldenAngle + pseudoRandom(i * 333) * 2 * Math.PI * spiralJitter;
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
  let shuffled = seededShuffle(images, 12345);

  // 8 anchors for edges/corners
  const anchors = [
    [0, 0],
    [screenWidth / 2, 0],
    [screenWidth - 1, 0],
    [0, screenHeight / 2],
    [screenWidth - 1, screenHeight / 2],
    [0, screenHeight - 1],
    [screenWidth / 2, screenHeight - 1],
    [screenWidth - 1, screenHeight - 1],
  ];

  // Ensure no adjacent anchors are identical
  shuffled = ensureNoAdjacentDuplicates(shuffled, anchors.length);

  // Place each image
  for (let i = 0; i < shuffled.length; i++) {
    const img = document.createElement('img');
    img.src = shuffled[i];
    img.alt = "";
    img.style.opacity = "0";
    img.style.transition = "opacity 1.8s cubic-bezier(0.63,0.01,0.33,1.01)";

    let x, y;
    if (i < anchors.length) {
      [x, y] = anchors[i];
      // Small inward offset so corners/edges are covered well and image is not mostly offscreen
      const offset = Math.min(screenWidth, screenHeight) * 0.08;
      if (x === 0) x += offset;
      if (x === screenWidth - 1) x -= offset;
      if (y === 0) y += offset;
      if (y === screenHeight - 1) y -= offset;
      // Add a bit of random jitter for even anchors
      x += (pseudoRandom(i + 1111) - 0.5) * offset * 0.8;
      y += (pseudoRandom(i + 2222) - 0.5) * offset * 0.8;
    } else {
      // Spiral, but with extra deterministic jitter for less grid-like feel
      [x, y] = vogelSpiralPosition(
        i - anchors.length,
        shuffled.length - anchors.length,
        screenWidth,
        screenHeight,
        0.46 // more jitter for more organic look
      );
      const jitter = Math.min(screenWidth, screenHeight) * 0.18;
      x += (pseudoRandom(i + 3333) - 0.5) * jitter;
      y += (pseudoRandom(i + 4444) - 0.5) * jitter;
    }

    // Sizing: Edge/corner images a bit larger, others slightly smaller but still overlapping
    const minSize = Math.min(screenWidth, screenHeight) * (i < anchors.length ? 0.43 : 0.32);
    const maxSize = Math.min(screenWidth, screenHeight) * (i < anchors.length ? 0.6 : 0.44);
    const prSeed = 5555 + i * 777;
    const size = minSize + (maxSize - minSize) * pseudoRandom(prSeed + 3);

    img.style.width = `${size}px`;
    img.style.height = "auto";
    img.style.left = `${x - size / 2}px`;
    img.style.top = `${y - size / 2}px`;

    // Rotation: -45 to +45 deg, deterministic (wider range for more randomness)
    const angle = -45 + 90 * pseudoRandom(prSeed + 4);
    img.style.transform = `rotate(${angle}deg)`;

    // Deterministic z-index for layering variety
    img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(prSeed + 8))}`;

    container.appendChild(img);

    // Fade-in with a stagger for a more fluid effect
    setTimeout(() => {
      img.style.opacity = "1";
    }, 120 + Math.floor(i * 45 + pseudoRandom(i + 7777) * 300));
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});