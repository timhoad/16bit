const container = document.getElementById('imageContainer');
const imageCount = 18;
const images = [];

// Load image filenames
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenArea = window.innerWidth * window.innerHeight;
  let coveredArea = 0;

  // We’ll aim for about 3x the screen area in total image area to fully cover with overlaps
  const targetArea = screenArea * 3;

  while (coveredArea < targetArea) {
    const img = document.createElement('img');
    const src = images[Math.floor(Math.random() * images.length)];
    img.src = src;

    // Larger random size: between 150px and 400px width
    const size = Math.random() * 250 + 150;
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    // Random position anywhere inside viewport, factoring size so images don’t go off-screen
    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Random rotation between -60 and +60 degrees for more randomness
    const rotation = (Math.random() - 0.5) * 120;
    img.style.transform = `rotate(${rotation}deg)`;

    // Random subtle blur up to 2px
    const blur = Math.random() * 2;
    img.style.filter = `blur(${blur}px)`;

    container.appendChild(img);

    // Estimate area adding to coveredArea (adjusted for blur and overlap)
    coveredArea += size * size * 0.6;
  }

  animateImages();
}

function animateImages() {
  const imgs = document.querySelectorAll('.image-container img');

  imgs.forEach((img, i) => {
    // Extract rotation angle from transform style
    const rotateMatch = img.style.transform.match(/rotate\((-?\d+\.?\d*)deg\)/);
    const rotateDeg = rotateMatch ? parseFloat(rotateMatch[1]) : 0;

    gsap.fromTo(
      img,
      {
        opacity: 0,
        scale: 2,
        rotate: rotateDeg + 20, // Start rotated slightly offset
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
