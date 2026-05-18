const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.getElementById('nav-overlay');
const navbar = document.querySelector('.navbar');
const scrollProgress = document.getElementById('scroll-progress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setNavOpen(isOpen) {
  if (navToggle) navToggle.setAttribute('aria-expanded', String(isOpen));
  if (navLinks) navLinks.dataset.visible = String(isOpen);
  if (navOverlay) {
    if (isOpen) {
      navOverlay.hidden = false;
      navOverlay.classList.add('is-visible');
      navOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-menu-open');
    } else {
      navOverlay.classList.remove('is-visible');
      navOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-menu-open');
      setTimeout(() => {
        if (!navLinks?.dataset.visible || navLinks.dataset.visible === 'false') {
          navOverlay.hidden = true;
        }
      }, 300);
    }
  }
}

const RESUME = {
  docx: 'Wahid_Ur_Rehman_Resume_GCC.docx',
  docxFallback: 'Wahid_Ur_Rehman_Resume.docx',
  pdf: 'Wahid Ur Rehman.pdf',
};

function assetUrl(filename) {
  return new URL(filename, window.location.href).href;
}

function setResumeDownloadLinks(url, filename) {
  document.querySelectorAll('[data-resume-download]').forEach((link) => {
    link.href = url;
    link.download = filename;
  });
}

async function fileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function resolveResumeDownload() {
  const candidates = [RESUME.docx, RESUME.docxFallback, RESUME.pdf];

  for (const file of candidates) {
    const url = assetUrl(file);
    if (await fileExists(url)) {
      setResumeDownloadLinks(url, file);
      return { url, file };
    }
  }

  return null;
}

if (navToggle && navLinks) {
  navLinks.dataset.visible = 'false';

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    setNavOpen(!isExpanded);
  });

  navLinks.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link) setNavOpen(false);
  });

  navOverlay?.addEventListener('click', () => setNavOpen(false));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setNavOpen(false);
  });
}

if (navbar) {
  const navAnchors = navLinks ? [...navLinks.querySelectorAll('a[href^="#"]')] : [];
  const sections = [...document.querySelectorAll('main section[id]')];

  const onScroll = () => {
    const fixed = window.scrollY > 48;
    navbar.classList.toggle('is-scrolled', fixed);
    document.body.classList.toggle('nav-fixed', fixed);

    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = `${progress}%`;
    }

    if (sections.length && navAnchors.length) {
      const scrollPos = window.scrollY + 120;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.offsetTop <= scrollPos) current = section.id;
      }
      navAnchors.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initScrollReveal() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.section-header').forEach((el) => el.setAttribute('data-reveal', ''));
  document.querySelectorAll('.about-card, .education-card').forEach((el) => el.setAttribute('data-reveal', ''));
  document.querySelectorAll('.timeline, .skills-grid, .projects-grid').forEach((el) => {
    el.setAttribute('data-reveal-stagger', '');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.count || '0');
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = target * eased;
    const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
    el.textContent = `${display}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initStatCounters() {
  const stats = document.querySelectorAll('.hero-stats [data-count]');
  if (!stats.length || prefersReducedMotion) {
    stats.forEach((el) => {
      el.textContent = `${el.dataset.count}${el.dataset.suffix || ''}`;
    });
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((el) => counterObserver.observe(el));
}

initScrollReveal();
initStatCounters();

const resumeModal = document.getElementById('resume-modal');
const previewResumeBtn = document.getElementById('preview-resume-btn');
const resumePreview = document.getElementById('resume-preview');
let resumeLoaded = false;

function openResumeModal() {
  if (!resumeModal) return;
  resumeModal.classList.remove('is-closing');
  resumeModal.hidden = false;
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('resume-modal-open');
  loadResumePreview();
}

function closeResumeModal() {
  if (!resumeModal || resumeModal.hidden) return;

  if (prefersReducedMotion) {
    resumeModal.hidden = true;
    resumeModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('resume-modal-open');
    return;
  }

  resumeModal.classList.add('is-closing');
  const dialog = resumeModal.querySelector('.resume-modal-dialog');
  const onEnd = () => {
    resumeModal.hidden = true;
    resumeModal.setAttribute('aria-hidden', 'true');
    resumeModal.classList.remove('is-closing');
    document.body.classList.remove('resume-modal-open');
    dialog?.removeEventListener('animationend', onEnd);
  };
  dialog?.addEventListener('animationend', onEnd);
  setTimeout(onEnd, 300);
}

function showPdfPreview(pdfUrl) {
  if (!resumePreview) return;
  resumePreview.classList.remove('is-loading', 'is-error');
  resumePreview.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.className = 'resume-pdf-frame';
  iframe.src = pdfUrl;
  iframe.title = 'Resume preview';
  resumePreview.appendChild(iframe);
  resumeLoaded = true;
}

async function tryDocxPreview(docxUrl) {
  if (typeof docx === 'undefined') return false;
  const response = await fetch(docxUrl);
  if (!response.ok) return false;
  const blob = await response.blob();
  resumePreview.classList.remove('is-loading');
  resumePreview.textContent = '';
  await docx.renderAsync(blob, resumePreview, undefined, {
    className: 'docx',
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
  });
  resumeLoaded = true;
  return true;
}

async function loadResumePreview() {
  if (!resumePreview || resumeLoaded) return;

  resumePreview.classList.add('is-loading');
  resumePreview.classList.remove('is-error');
  resumePreview.textContent = 'Loading resume preview...';

  const docxUrls = [assetUrl(RESUME.docx), assetUrl(RESUME.docxFallback)];

  for (const url of docxUrls) {
    try {
      if (await tryDocxPreview(url)) return;
    } catch {
      // Try next source.
    }
  }

  showPdfPreview(assetUrl(RESUME.pdf));
}

if (previewResumeBtn) {
  previewResumeBtn.addEventListener('click', openResumeModal);
}

if (resumeModal) {
  resumeModal.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-close-resume]')) {
      closeResumeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !resumeModal.hidden) {
      closeResumeModal();
    }
  });
}

resolveResumeDownload();
