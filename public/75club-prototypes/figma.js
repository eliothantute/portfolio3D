/**
 * FIGMA WORKSPACE & PROTOTYPE INTERACTION SCRIPTS
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvasBoard = document.getElementById('canvasBoard');
  const canvasViewport = document.getElementById('canvasViewport');
  const zoomSelect = document.getElementById('zoomSelect');
  const layerItems = document.querySelectorAll('.layer-item');
  const btnModeCanvas = document.getElementById('btnModeCanvas');
  const btnModePresent = document.getElementById('btnModePresent');
  const btnPlayTop = document.getElementById('btnPlayTop');

  // 1. Zoom control
  zoomSelect.addEventListener('change', (e) => {
    const scale = e.target.value;
    canvasBoard.className = 'figma-canvas-board';
    if (scale === '0.45') canvasBoard.classList.add('scale-45');
    else if (scale === '0.65') canvasBoard.classList.add('scale-65');
    else if (scale === '0.85') canvasBoard.classList.add('scale-85');
    else if (scale === '1.0') canvasBoard.classList.add('scale-100');
  });

  // 2. Layer selection & scroll-to-frame
  layerItems.forEach(item => {
    item.addEventListener('click', () => {
      layerItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const frameId = item.getAttribute('data-frame-id');
      const targetFrame = document.getElementById(frameId);

      if (targetFrame) {
        targetFrame.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
        
        // Highlight effect
        targetFrame.style.outline = '2px solid #0d99ff';
        targetFrame.style.outlineOffset = '6px';
        setTimeout(() => {
          targetFrame.style.outline = 'none';
        }, 1200);
      }
    });
  });

  // 3. Mode Toggle: Canvas vs Present
  function enterPresentMode() {
    btnModeCanvas.classList.remove('active');
    btnModePresent.classList.add('active');

    // Switch zoom to 100% and focus on current active frame
    canvasBoard.className = 'figma-canvas-board scale-100';
    zoomSelect.value = '1.0';

    const activeItem = document.querySelector('.layer-item.active') || layerItems[0];
    const frameId = activeItem.getAttribute('data-frame-id');
    const targetFrame = document.getElementById(frameId);
    if (targetFrame) {
      targetFrame.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'start' });
    }
  }

  function enterCanvasMode() {
    btnModePresent.classList.remove('active');
    btnModeCanvas.classList.add('active');
    canvasBoard.className = 'figma-canvas-board scale-65';
    zoomSelect.value = '0.65';
  }

  btnModePresent.addEventListener('click', enterPresentMode);
  btnPlayTop.addEventListener('click', enterPresentMode);
  btnModeCanvas.addEventListener('click', enterCanvasMode);

  // 4. Diaporama automatique pour la section originale
  const slides = document.querySelectorAll('#slideWrap1 .slide-img');
  const dots = document.querySelectorAll('#slideWrap1 .s-dot');
  let currentSlide = 0;

  if (slides.length > 0) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

      currentSlide = (currentSlide + 1) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }, 3800);
  }

  // 5. Canvas Pan via drag (Middle click or Space+Drag)
  let isPanning = false;
  let startX, startY, scrollLeft, scrollTop;

  canvasViewport.addEventListener('mousedown', (e) => {
    // Only pan if clicking on the background viewport directly
    if (e.target === canvasViewport || e.button === 1 || e.spaceKey) {
      isPanning = true;
      startX = e.pageX - canvasViewport.offsetLeft;
      startY = e.pageY - canvasViewport.offsetTop;
      scrollLeft = canvasViewport.scrollLeft;
      scrollTop = canvasViewport.scrollTop;
      canvasViewport.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    canvasViewport.style.cursor = 'default';
  });

  canvasViewport.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const x = e.pageX - canvasViewport.offsetLeft;
    const y = e.pageY - canvasViewport.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    canvasViewport.scrollLeft = scrollLeft - walkX;
    canvasViewport.scrollTop = scrollTop - walkY;
  });

  // Bouton Partager
  document.getElementById('btnFigmaShare').addEventListener('click', () => {
    alert('Lien de partage du prototype Figma : http://localhost:5173/75club-prototypes/figma.html');
  });
});
