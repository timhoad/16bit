const container = document.getElementById('imageContainer');
const imageCount = 18; // You have 18 images, each is used twice for 36 slots
const totalImages = 36; // 6x6 grid

// Deterministically fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

// Deterministic "random" function (simple LCG)
function pseudoRandom(seed) {
  let value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
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

    // Deterministic "random" for variety using index
    const sizeSeed = index * 13 + 7;
    const angleSeed = index * 19 + 11;

    // Make images vary in size: from 1x slot to 1.5x slot, up to 95% of slot
    let minSlot = Math.min(slotWidth, slotHeight);
    let maxSlot = minSlot * 1.35;
    let size = minSlot * (0.95 + 0.3 * pseudoRandom(sizeSeed));
    size = Math.max(minSlot * 0.95, Math.min(size, maxSlot));

    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    // Center within slot, but allow overlap beyond slot edges for better coverage
    let overlap = size - minSlot;
    let x = col * slotWidth - overlap / 2;
    let y = row * slotHeight - overlap / 2;

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Deterministic angle (-30° to +30°)
    const rotation = -30 + 60 * pseudoRandom(angleSeed);
    img.style.transform = `rotate(${rotation}deg)`;

    container.appendChild(img);
  }

  // No animation needed if always deterministic, but can fade in if you like
  // animateImages();
}

// If you want a fade-in animation, uncomment below:
/*
function animateImages() {
  const imgs = document.querySelectorAll('.image-container img');
  imgs.forEach((img, i) => {
    gsap.fromTo(
      img,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.0,
        delay: i * 0.01,
        ease: 'power2.out',
      }
    );
  });
}
*/

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});