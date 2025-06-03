const container = document.getElementById('imageContainer');
const imageCount = 20;
const images = [];

for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenArea = window.innerWidth * window.innerHeight;
  let totalCoveredArea = 0;

  while (totalCoveredArea < screenArea * 1.2) {
    const img = document.createElement('img');
    const src = images[Math.floor(Math.random() * images.length)];
    img.src = src;

    const size = Math.random() * 120 + 80; // 80–200px
    img.style.width = `${size}px`;

    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    const blur = Math.random() * 1.5; // 0–1.5px blur
    img.style.filter = `blur(${blur}px)`;

    container.appendChild(img);
    totalCoveredArea += size * size;
  }

  animateImages();
}

function animateImages() {
  const allImgs = document.querySelectorAll('.image-container img');

  allImgs.forEach((img, i) => {
    gsap.fromTo(img, {
      opacity: 0,
      scale: 2
    }, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      delay: i * 0.05,
      ease: "power4.out"
    });
  });
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  // Add debounce to prevent excessive rendering
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 300);
});
