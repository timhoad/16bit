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
  let coveredArea = 0;

  while (coveredArea < screenArea * 1.8) { // Overfill for good coverage
    const img = document.createElement('img');
    const src = images[Math.floor(Math.random() * images.length)];
    img.src = src;

    // Random size (small to large tiles)
    const size = Math.random() * 200 + 100; // 100–300px
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    // Random position within viewport
    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // Random rotation (-30 to +30 degrees)
    const rotation = (Math.random() - 0.5) * 60;

    // Optional blur for depth
    const blur = Math.random() * 1.5;

    img.style.filter = `blur(${blur}px)`;
    img.style.transform = `rotate(${rotation}deg)`;

    container.appendChild(img);

    coveredArea += size * size * 0.6; // Adjusted estimate
  }

  animateImages();
}

function animateImages() {
  const imgs = document.querySelectorAll('.image-container img');
  imgs.forEach((img, i) => {
    gsap.fromTo(
      img,
      {
        opacity: 0,
        scale: 2,
        rotate: img.style.transform.match(/-?\d+/)?.[0] || 0
      },
      {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        delay: i * 0.03,
        ease: 'power4.out'
      }
    );
  });
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 300);
});
