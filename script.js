(function () {
  const PASSWORD = 'aetherdreamstest';
  const STORAGE_KEY = 'ad_unlocked';

  if (sessionStorage.getItem(STORAGE_KEY) === 'yes') {
    document.documentElement.classList.add('ad-unlocked');
    return;
  }

  const gate = document.createElement('div');
  gate.id = 'ad-gate';
  gate.innerHTML = `
    <form id="ad-gate-form">
      <p class="ad-gate-brand">AETHER DREAMS</p>
      <p class="ad-gate-label">Введите пароль для доступа</p>
      <input type="password" id="ad-gate-input" autocomplete="off" autofocus>
      <button type="submit">Войти</button>
      <p class="ad-gate-error" id="ad-gate-error">Неверный пароль</p>
    </form>
  `;
  document.body.appendChild(gate);

  const form = gate.querySelector('#ad-gate-form');
  const input = gate.querySelector('#ad-gate-input');
  const error = gate.querySelector('#ad-gate-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'yes');
      document.documentElement.classList.add('ad-unlocked');
      gate.remove();
    } else {
      error.classList.add('is-visible');
      input.value = '';
      input.focus();
    }
  });
})();

const links = document.querySelectorAll('a[href^="#"]');

links.forEach(link => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

window.AD_reveal = function (elements) {
  elements.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 55, 300)}ms`;
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
};

window.AD_reveal(document.querySelectorAll('.feature, .archive-item, .about-block'));
