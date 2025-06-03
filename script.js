const container = document.getElementById('imageContainer');
const imageCount = 18;
const images = [];

// Add each image twice
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Divide viewport roughly into a grid of 6 columns x 6 rows = 36 slots
  // Place exactly one image in each slot to spread evenly
  const cols = 6;
  const rows = 6;
  const slotWidth = screenWidth / cols;
  const slotHeight = screenHeight / rows;

  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;

    // Size 250-400px
    const size = Math.random() * 150 + 250;
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    // Calculate col and row for this image
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Position roughly within the slot, but allow slight overflow beyond edges
    // Position x/y is randomized inside the slot with a small padding overflow
    const paddingX = slotWidth * 0.3;
    const paddingY = slotHeight * 0.3;

    let x = col * slotWidth + (Math.random() * (slotWidth + paddingX) - paddingX / 2);
    let y = row * slotHeight + (Math.random() * (slotHeight + paddingY) - paddingY / 2);

    // Allow images to slightly overflow viewport edges (clamp x/y to -padding to screen + padding)
    x = Math.min(Math.max(x, -paddingX), screenWidth - size + paddingX);
    y = Math.min(Math.max(y, -paddingY), screenHeight - size + paddingY);

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Random rotation between -45 and +45 degrees
    const rotation = (Math.random() - 0.5) * 90;
    img.style.transform = `rotate(${rotation}deg)`;

    // Reduced blur: 0 to 0.75px max (half of before)
    const blur = Math.random() * 0.75;
    img.style.filter = `blur(${blur}px)`;

    container.appendChild(img);
  });

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
        duration: 1.5,
        delay: i * 0.04,
        ease: 'power4.out',
      }
    );
  });
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 300);
});
