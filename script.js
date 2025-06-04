const container = document.getElementById('imageContainer');
const imageCount = 18;

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

  const numImages = shuffled.length;
  const aspect = screenWidth / screenHeight;
  const gridCols = Math.ceil(Math.sqrt(numImages * aspect));
  const gridRows = Math.ceil(numImages / gridCols);

  const cellWidth = screenWidth / gridCols;
  const cellHeight = screenHeight / gridRows;
  const baseSize = Math.max(cellWidth, cellHeight) * 1.7;

  let imgIndex = 0;
  let loadedCount = 0;
  let overlayTriggered = false;

  function tryTriggerOverlay() {
    if (!overlayTriggered && loadedCount === numImages) {
      overlayTriggered = true;
      setTimeout(() => {
        fadeInOverlay();
      }, 2500); // Wait 2.5s after all images loaded
    }
  }

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (imgIndex >= numImages) break;

      const img = document.createElement('img');
      img.src = shuffled[imgIndex];
      img.alt = "";

      let x = col * cellWidth + cellWidth / 2;
      let y = row * cellHeight + cellHeight / 2;
      const strongJitterX = (pseudoRandom(imgIndex * 7) - 0.5) * cellWidth * 0.36;
      const strongJitterY = (pseudoRandom(imgIndex * 13) - 0.5) * cellHeight * 0.36;
      x += strongJitterX;
      y += strongJitterY;

      const marginX = baseSize * 0.45;
      const marginY = baseSize * 0.45;
      x = Math.max(marginX, Math.min(screenWidth - marginX, x));
      y = Math.max(marginY, Math.min(screenHeight - marginY, y));

      const size = baseSize * (0.85 + 0.3 * pseudoRandom(imgIndex * 19)) * 1.10;
      img.style.width = `${size}px`;
      img.style.height = "auto";
      img.style.position = "absolute";
      img.style.left = `${x - size / 2}px`;
      img.style.top = `${y - size / 2}px`;

      const angle = -35 + 70 * pseudoRandom(imgIndex * 23);
      // Enhanced zoom effect: 1.38 for a stronger zoom-in
      img.style.transform = `scale(1.38) rotate(${angle}deg)`;
      img.style.zIndex = `${10 + Math.floor(10 * pseudoRandom(imgIndex * 29))}`;

      img.style.opacity = "0";
      img.style.transition = "opacity 1.7s cubic-bezier(0.63,0.01,0.33,1.01), transform 1.7s cubic-bezier(0.63,0.01,0.33,1.01)";

      img.addEventListener('load', () => {
        loadedCount++;
        tryTriggerOverlay();
      });

      if (img.complete) {
        loadedCount++;
        tryTriggerOverlay();
      }

      container.appendChild(img);

      requestAnimationFrame(() => {
        img.style.opacity = "1";
        // Animate zoom to normal size
        img.style.transform = `scale(1) rotate(${angle}deg)`;
      });

      imgIndex++;
    }
  }
}

// Overlay fade-in and email hotspot
function fadeInOverlay() {
  // Remove any previous overlay image if present
  const oldOverlay = document.getElementById('overlay-img');
  if (oldOverlay) oldOverlay.remove();

  removeEmailHotspot(); // Remove any previous hotspot

  const isMobile = window.innerWidth <= 700;
  const overlaySrc = isMobile ? 'overlaymobile.jpg' : 'overlaydesktop.jpg';

  const overlay = document.createElement('img');
  overlay.id = 'overlay-img';
  overlay.src = overlaySrc;
  overlay.alt = "Overlay";
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "9999";
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "auto";
  overlay.style.transition = "opacity 3.25s cubic-bezier(0.63,0.01,0.33,1.01)";
  document.body.appendChild(overlay);

  // Set opacity to 96% (0.96) instead of 98%
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "0.96";
    });
  });

  // Add the clickable email hotspot
  addEmailHotspot(isMobile);
}

// Remove the hotspot if it exists
function removeEmailHotspot() {
  const oldHotspot = document.getElementById('email-hotspot');
  if (oldHotspot) oldHotspot.remove();
}

// Add the hotspot for the email link
function addEmailHotspot(isMobile) {
  removeEmailHotspot();

  // Desktop: move up by 0.8cm (≈30px). Mobile: keep as is, ensure no effect on mosaic.
  let left, bottom, width, height, style;

  if (isMobile) {
    // Example values for mobile overlay
    left = "calc(50vw - 90px)";
    bottom = "20px";
    width = "180px";
    height = "28px";
    style = `
      display:block;
      position:fixed;
      left:${left};
      bottom:${bottom};
      width:${width};
      height:${height};
      z-index:10000;
      cursor:pointer;
      background:rgba(0,0,0,0);
      pointer-events:auto;
      outline:none;
      touch-action:manipulation;
      margin:0;
      padding:0;
    `;
  } else {
    // Example values for desktop overlay, moved up by 0.8cm (approx 30px)
    left = "calc(50vw - 100px)";
    bottom = "60px";
    width = "200px";
    height = "30px";
    style = `
      display:block;
      position:fixed;
      left:${left};
      bottom:${bottom};
      width:${width};
      height:${height};
      z-index:10000;
      cursor:pointer;
      background:rgba(0,0,0,0);
      pointer-events:auto;
      outline:none;
      margin:0;
      padding:0;
    `;
  }

  const link = document.createElement('a');
  link.href = 'mailto:contact@16-bit.gg';
  link.id = 'email-hotspot';
  link.setAttribute('style', style);
  link.tabIndex = 0; // for accessibility

  // Screen reader only text
  const srText = document.createElement('span');
  srText.textContent = 'Email contact@16-bit.gg';
  srText.style.position = 'absolute';
  srText.style.left = '-9999px';
  link.appendChild(srText);

  // Make sure the hotspot is a direct child of body, NOT inside the mosaic container
  document.body.appendChild(link);
}

// Handle overlay/hotspot on resize as well
function handleResize() {
  clearTimeout(window.resized);
  window.resized = setTimeout(() => {
    fillScreenWithImages();
    // If overlay is present, re-add hotspot for new dimensions
    if (document.getElementById('overlay-img')) {
      addEmailHotspot(window.innerWidth <= 700);
    }
  }, 100);
}

window.addEventListener('load', fillScreenWithImages);
window.addEventListener('resize', handleResize);