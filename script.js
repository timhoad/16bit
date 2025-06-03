const container = document.getElementById('imageContainer');
const imageCount = 18;
const images = [];

// Fill array with each image twice, as before
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

function clearImages() {
  container.innerHTML = '';
}

function getGridDimensions(minSlot = 220, maxCols = 8, maxRows = 8) {
  // Determine columns and rows to best fit the viewport
  const w = window.innerWidth, h = window.innerHeight;
  let cols = Math.max(3, Math.floor(w / minSlot));
  let rows = Math.max(3, Math.floor(h / minSlot));
  cols = Math.min(cols, maxCols);
  rows = Math.min(rows, maxRows);

  // If we have more images than slots, add more rows/cols as needed
  while (cols * rows < images.length) {
    if (cols <= rows && cols < maxCols) cols++;
    else if (rows < maxRows) rows++;
    else break;
  }
  return { cols, rows };
}

function fillScreenWithImages() {
  clearImages();

  const { cols, rows } = getGridDimensions();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const slotWidth = screenWidth / cols;
  const slotHeight = screenHeight / rows;

  // Randomize image order for variety
  const shuffled = images.slice().sort(() => Math.random() - 0.5);

  for (let index = 0; index < shuffled.length; index++) {
    const src = shuffled[index];
    const img = document.createElement('img');
    img.src = src;
    img.alt = ""; // Decorative

    // Calculate col and row for this image
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Size: random but fits inside slot, with a min/max clamp
    const minSize = Math.max(120, Math.min(slotWidth, slotHeight) * 0.65);
    const maxSize = Math.min(slotWidth, slotHeight) * 0.97;
    const size = Math.random() * (maxSize - minSize) + minSize;
    img.style.width = `${size}px`;
    img.style.height = "auto";

    // Place image centered in slot, randomize within slot for variety
    const padX = slotWidth - size;
    const padY = slotHeight - size;
    const x = col * slotWidth + padX * Math.random();
    const y = row * slotHeight + padY * Math.random();
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Random rotation between -38 and +38 degrees
    const rotation = (Math.random() - 0.5) * 76;
    img.style.transform = `rotate(${rotation}deg)`;

    // Subtle blur
    const blur = Math.random() * 0.75;
    img.style.filter = `blur(${blur}px)`;

    container.appendChild(img);
  }

  animateImages();
}

function animateImages() {
  const imgs = document.querySelectorAll('.image-container img');
  imgs.forEach((img, i) => {
    const rotateMatch = img.style.transform.match(/rotate\((-?\d+\.?\d*)deg\)/);
    const rotateDeg = rotateMatch ? parseFloat(rotateMatch[1]) : 0;

    gsap.fromTo(
      img,
      {
        opacity: 0,
        scale: 2,
        rotate: rotateDeg + 15,
      },
      {
        opacity: 1,
        scale: 1,
        rotate: rotateDeg,
        duration: 1.3,
        delay: i * 0.025,
        ease: 'power4.out',
      }
    );
  });
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 250);
});