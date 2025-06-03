const container = document.getElementById('imageContainer');
const totalImages = 25;

// Add images to DOM
for (let i = 1; i <= totalImages; i++) {
  const img = document.createElement('img');
  img.src = `images/image${i}.png`;
  container.appendChild(img);
}

// Animate with GSAP
window.addEventListener('load', () => {
  const images = document.querySelectorAll('.image-container img');

  images.forEach((img, index) => {
    gsap.to(img, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      delay: index * 0.1,
      ease: "power4.out"
    });
  });
});
