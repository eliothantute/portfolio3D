/**
 * LE SEPT CINQ — ART GALLERY INTERACTION SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Filtrage du catalogue d'œuvres
  const filterBtns = document.querySelectorAll('#galleryFilters .filter-btn');
  const artCards = document.querySelectorAll('.art-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      artCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2. Lang switch toggle
  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) {
    langSwitch.addEventListener('click', () => {
      langSwitch.textContent = langSwitch.textContent === 'FR / EN' ? 'EN / FR' : 'FR / EN';
    });
  }
});

// Modal functions
function openDossierModal() {
  const modal = document.getElementById('inquiryModal');
  document.getElementById('modalArtTitle').textContent = "Dossier d'Exposition : « Formes qui se Font & Défont »";
  modal.classList.add('active');
}

function inquireArtwork(title) {
  const modal = document.getElementById('inquiryModal');
  document.getElementById('modalArtTitle').textContent = "Acquisition : " + title;
  modal.classList.add('active');
}

function closeInquiryModal() {
  const modal = document.getElementById('inquiryModal');
  modal.classList.remove('active');
}

window.addEventListener('click', (e) => {
  const modal = document.getElementById('inquiryModal');
  if (e.target === modal) {
    closeInquiryModal();
  }
});
