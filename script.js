const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

const RESUME = {
  docx: 'Wahid_Ur_Rehman_Resume.docx',
  pdf: 'Wahid Ur Rehman.pdf',
};

function assetUrl(filename) {
  return new URL(filename, window.location.href).href;
}

function setResumeDownloadLinks(url, filename) {
  document.querySelectorAll('[data-resume-download]').forEach((link) => {
    link.href = url;
    link.download = filename;
    link.textContent = filename.endsWith('.docx') ? 'Download DOCX' : 'Download PDF';
  });
}

async function resolveResumeDownload() {
  const docxUrl = assetUrl(RESUME.docx);
  const pdfUrl = assetUrl(RESUME.pdf);

  try {
    const response = await fetch(docxUrl, { method: 'HEAD' });
    if (response.ok) {
      setResumeDownloadLinks(docxUrl, RESUME.docx);
      return { url: docxUrl, type: 'docx' };
    }
  } catch {
    // Fall back to PDF when DOCX is not deployed yet.
  }

  setResumeDownloadLinks(pdfUrl, RESUME.pdf);
  return { url: pdfUrl, type: 'pdf' };
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

const resumeModal = document.getElementById('resume-modal');
const previewResumeBtn = document.getElementById('preview-resume-btn');
const resumePreview = document.getElementById('resume-preview');
let resumeLoaded = false;
let resumeDownload = null;

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

async function loadResumePreview() {
  if (!resumePreview || resumeLoaded) return;

  const docxUrl = assetUrl(RESUME.docx);
  const pdfUrl = assetUrl(RESUME.pdf);

  resumePreview.classList.add('is-loading');
  resumePreview.classList.remove('is-error');
  resumePreview.textContent = 'Loading resume preview...';

  if (typeof docx !== 'undefined') {
    try {
      const response = await fetch(docxUrl);
      if (response.ok) {
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
        return;
      }
    } catch {
      // Use PDF preview on GitHub Pages when DOCX is missing or cannot render.
    }
  }

  showPdfPreview(pdfUrl);
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

resolveResumeDownload().then((download) => {
  resumeDownload = download;
});
