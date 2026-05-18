const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

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

if (navbar) {
  const onScroll = () => {
    const fixed = window.scrollY > 48;
    navbar.classList.toggle('is-scrolled', fixed);
    document.body.classList.toggle('nav-fixed', fixed);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

const resumeModal = document.getElementById('resume-modal');
const previewResumeBtn = document.getElementById('preview-resume-btn');
const resumePreview = document.getElementById('resume-preview');
let resumeLoaded = false;

function openResumeModal() {
  if (!resumeModal) return;
  resumeModal.hidden = false;
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('resume-modal-open');
  loadResumePreview();
}

function closeResumeModal() {
  if (!resumeModal) return;
  resumeModal.hidden = true;
  resumeModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('resume-modal-open');
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
