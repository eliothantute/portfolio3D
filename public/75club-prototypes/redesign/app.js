/**
 * LE 7.5 CLUB — SCRIPTS INTERACTIFS DU SITE REDESIGN
 */

const slideData = [
  { title: "Véronique Malécot // Photographie & Scénographie", meta: "Archives In Situ • Le 7.5 Paris" },
  { title: "Domaine de Diane (1m59 sur 2m15)", meta: "Acquisition & Collection • Le 7.5 Paris" },
  { title: "Olga Titus // Icecream", meta: "Résidence d'artistes contemporains" }
];

let currentSlideIdx = 0;
let slideInterval;

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide-photo');
  const dots = document.querySelectorAll('.slide-dots .dot');
  const titleEl = document.getElementById('slideTitle');

  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  slides[index].classList.add('active');
  dots[index].classList.add('active');

  if (titleEl && slideData[index]) {
    titleEl.textContent = slideData[index].title;
  }

  currentSlideIdx = index;
}

function startSlideshow() {
  slideInterval = setInterval(() => {
    goToSlide(currentSlideIdx + 1);
  }, 4200);
}

// Logo mode switcher (Vectoriel Épuré vs 3D)
function setLogoMode(mode) {
  const vectorContainer = document.getElementById('logoVector');
  const logo3DContainer = document.getElementById('logo3D');
  const btnVector = document.getElementById('btnLogoVector');
  const btn3D = document.getElementById('btnLogo3D');

  if (mode === 'vector') {
    vectorContainer.style.display = 'flex';
    logo3DContainer.style.display = 'none';
    btnVector.classList.add('active');
    btn3D.classList.remove('active');
  } else {
    vectorContainer.style.display = 'none';
    logo3DContainer.style.display = 'block';
    btn3D.classList.add('active');
    btnVector.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  startSlideshow();

  // Parallaxe subtile au curseur sur la photo du Hero
  const heroPhotoWrap = document.getElementById('heroPhotoWrap');
  const heroPhoto = document.getElementById('heroPhoto');

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);

    if (heroPhoto) {
      heroPhoto.style.transform = `scale(1.04) translate(${x * -10}px, ${y * -10}px)`;
    }
  });

  // Navigation smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
