const container = document.getElementById('imageContainer');
const imageCount = 18;
const images = [];

// Load images twice each
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

  images.forEach((src) => {
    const img = document.createElement('img');
    img.src = src;

    // Larger size, between 250px and 400px width
    const size = Math.random() * 150 + 250;
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    // Position anywhere from -20% off left/top edge to 100% viewport width/height
    // This allows images to slightly overflow/cut off edges to ensure full coverage
    const x = Math.random() * (screenWidth * 1.2) - (screenWidth * 0.2);
    const y = Math.random() * (screenHeight * 1.2) - (screenHeight * 0.2);
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Rotation between -45 and +45 degrees for randomness
    const rotation = (Math.random() - 0.5) * 90;
    img.style.transform = `rotate(${rotation}deg)`;

    // Subtle blur 0–1.5px
    const blur = Math.random() * 1.5;
    img.style.filter = `blur(${blur}px)`;

    container.appendChild(img);
  });

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
        rotate: rotateDeg + 15, // start slightly offset
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
