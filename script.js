const container = document.getElementById('imageContainer');
const imageCount = 18;
const totalImages = 36;

// Fill array with each image twice, in order
const images = [];
for (let i = 1; i <= imageCount; i++) {
  images.push(`images/image${i}.png`);
  images.push(`images/image${i}.png`);
}

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
      let swap = i + 1;
      while (swap < result.length && result[swap] === result[i]) swap++;
      if (swap < result.length) {
        [result[i], result[swap]] = [result[swap], result[i]];
      }
    }
  }
  return result;
}

function pseudoRandom(seed) {
  return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
}

function clearImages() {
  container.innerHTML = '';
}

function fillScreenWithImages() {
  clearImages();

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const shuffled = seededShuffle(images, 12345);

  // Grid dimensions (force a square grid for equal spread)
  const numImages = shuffled.length;
  const aspect = screenWidth / screenHeight;
  const gridCols = Math.ceil(Math.sqrt(numImages * aspect));
  const gridRows = Math.ceil(numImages / gridCols);

  // Image size (base) -- increased by 10%
  const cellWidth = screenWidth / gridCols;
  const cellHeight = screenHeight / gridRows;
  const baseSize = Math.max(cellWidth, cellHeight) * 1.7; // was 1.55, now 1.7

  let imgIndex = 0;
  let loadedCount = 0;
  const allImages = [];

  function checkAllLoadedAndFadeOverlay() {
    if (loadedCount === numImages) {
      setTimeout(() => {
        fadeInOverlay();
      }, 1000); // Wait 1s after all images loaded
    }
  }

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (imgIndex >= numImages) break;

      const img = document.createElement('img');
      img.src = shuffled[imgIndex];
      img.alt = "";

      // Position in a grid cell, but with strong jitter (up to 36% of cell size)
      let x = col * cellWidth + cellWidth / 2;
      let y = row * cellHeight + cellHeight / 2;
      const strongJitterX = (pseudoRandom(imgIndex * 7) - 0.5) * cellWidth * 0.36;
      const strongJitterY = (pseudoRandom(imgIndex * 13) - 0.5) * cellHeight * 0.36;
      x += strongJitterX;
      y += strongJitterY;

      // Clamp to keep 90% of image inside the screen
      const marginX = baseSize * 0.45;
      const marginY = baseSize * 0.45;
      x = Math.max(marginX, Math.min(screenWidth - marginX, x));
      y = Math.max(marginY, Math.min(screenHeight - marginY, y));

      // 10% larger size and jitter
      const size = baseSize * (0.85 + 0.3 * pseudoRandom(imgIndex * 19)) * 1.10; // +10%
      img.style.width = `${size}px`;
      img.style.height = "auto";
      img.style.position = "absolute";
      img.style.left = `${x - size / 2}px`;
      img.style.top = `${y - size / 2}px`;

      // Rotation & z-index
      const angle = -35 + 70 * pseudoRandom(imgIndex * 23);
      img.style.transform = `rotate(${angle}deg)`;
      img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(imgIndex * 29))}`;

      // Fade-in initial state
      img.style.opacity = "0";
      img.style.transition = "opacity 1.7s cubic-bezier(0.63,0.01,0.33,1.01)";

      img.addEventListener('load', () => {
        loadedCount++;
        checkAllLoadedAndFadeOverlay();
      });

      // For cached images: trigger load if already loaded
      if (img.complete) {
        loadedCount++;
        checkAllLoadedAndFadeOverlay();
      }

      container.appendChild(img);

      // Use requestAnimationFrame for reliable fade-in
      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      imgIndex++;
      allImages.push(img);
    }
  }
}

function fadeInOverlay() {
  // Choose overlay image based on screen width
  const isMobile = window.innerWidth <= 700; // You may adjust this threshold if needed
  const overlaySrc = isMobile ? 'image overlaymobile.jpg' : 'image overlaydesktop.jpg';

  let overlay = document.getElementById('overlay-desktop-img');
  if (!overlay) {
    overlay = document.createElement('img');
    overlay.id = 'overlay-desktop-img';
    overlay.src = overlaySrc;
    overlay.alt = "Overlay";
    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.zIndex = "9999";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.transition = "opacity 2.5s cubic-bezier(0.63,0.01,0.33,1.01)";
    document.body.appendChild(overlay);
    // When loaded, fade in
    overlay.onload = () => {
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
    };
    // If already loaded (cached), fade in immediately
    if (overlay.complete) {
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
    }
  } else {
    overlay.src = overlaySrc;
    overlay.style.opacity = "0";
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });
  }
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(fillScreenWithImages, 100);
});