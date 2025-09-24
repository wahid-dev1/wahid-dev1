const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navLinks.dataset.visible = 'false';

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
    navLinks.dataset.visible = String(!isExpanded);
  });

  navLinks.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link) {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.dataset.visible = 'false';
    }
  });
}
