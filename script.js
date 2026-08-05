document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const okMsg = document.getElementById('form-ok');
  const errorMsg = document.getElementById('form-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    okMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie...';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();

      if (result.success) {
        form.reset();
        okMsg.style.display = 'block';
      } else {
        errorMsg.style.display = 'block';
      }
    } catch (err) {
      errorMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Wyślij zapytanie';
    }
  });

  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) {
    const uslugaSelect = document.getElementById('calc-usluga');
    const metrazInput = document.getElementById('calc-metraz');
    const standardSelect = document.getElementById('calc-standard');
    const resultValue = document.getElementById('calc-result-value');
    const note = document.getElementById('calc-note');
    const ctaLink = document.getElementById('calc-cta');
    const kontaktUsluga = document.getElementById('usluga');

    const USLUGA_TO_KONTAKT = {
      glazie: 'Gładzie i malowanie',
      plytki: 'Układanie płytek',
      gk: 'Zabudowy z płyt g-k',
      panele: 'Montaż paneli i podłóg',
      lazienka: 'Remont łazienki',
      podklucz: 'Kompleksowe wykończenie „pod klucz”',
    };

    const formatPLN = (n) => Math.round(n).toLocaleString('pl-PL') + ' zł';

    calcBtn.addEventListener('click', () => {
      const metraz = parseFloat(metrazInput.value);
      if (!metraz || metraz <= 0) {
        resultValue.textContent = '—';
        note.textContent = 'Podaj poprawny metraż, aby zobaczyć wycenę.';
        metrazInput.focus();
        return;
      }

      const option = uslugaSelect.selectedOptions[0];
      const min = parseFloat(option.dataset.min);
      const max = parseFloat(option.dataset.max);
      const mnoznik = parseFloat(standardSelect.value);

      const totalMin = Math.round((min * metraz * mnoznik) / 50) * 50;
      const totalMax = Math.round((max * metraz * mnoznik) / 50) * 50;

      resultValue.textContent = `${formatPLN(totalMin)} – ${formatPLN(totalMax)}`;
      note.textContent = `${option.textContent} · ${metraz} m² · koszt samej robocizny.`;

      ctaLink.dataset.usluga = USLUGA_TO_KONTAKT[uslugaSelect.value] || '';
    });

    ctaLink.addEventListener('click', () => {
      const value = ctaLink.dataset.usluga;
      if (!value || !kontaktUsluga) return;
      const match = [...kontaktUsluga.options].find((o) => o.textContent === value);
      if (match) kontaktUsluga.value = value;
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentGroup = [];
  let currentIndex = 0;

  const show = (index) => {
    currentIndex = (index + currentGroup.length) % currentGroup.length;
    const img = currentGroup[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  };

  const open = (group, index) => {
    currentGroup = group;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.gallery[data-lightbox-group]').forEach((gallery) => {
    const images = [...gallery.querySelectorAll('.gallery-item img')];
    images.forEach((img, index) => {
      img.addEventListener('click', () => open(images, index));
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(currentIndex - 1));
  nextBtn.addEventListener('click', () => show(currentIndex + 1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(currentIndex - 1);
    if (event.key === 'ArrowRight') show(currentIndex + 1);
  });
});
