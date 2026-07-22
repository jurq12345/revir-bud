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
});
