/* ================================================================
   JAIME UY DE BARON — PORTFOLIO JAVASCRIPT
   ================================================================
   Handles:
   1.  Navbar: scroll shadow + active section highlighting
   2.  Mobile hamburger menu toggle
   3.  Smooth scroll (enhanced with offset for fixed nav)
   4.  Scroll reveal animations (IntersectionObserver)
   5.  Project card modal (open, close, keyboard support)
   6.  Extracurriculars card modal (open, close, keyboard support)
================================================================ */


/* ── 1. NAVBAR — SCROLL SHADOW & ACTIVE LINK ───────────────────
   Adds .scrolled class to navbar when page is scrolled.
   Updates .active class on nav links based on visible section.
──────────────────────────────────────────────────────────────── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
const sections = document.querySelectorAll('section[id], footer[id]');

function onScroll() {
  // Shadow on scroll
  navbar.classList.toggle('scrolled', window.scrollY > 10);

  // Active section detection — find whichever section is near the top of viewport
  let current = '';
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= 80) current = section.id;
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // Run once on load


/* ── 2. MOBILE HAMBURGER MENU ───────────────────────────────────
   Toggles .open on the mobile nav dropdown.
   Closes when any nav link is clicked.
──────────────────────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navMobile  = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

// Close mobile menu when a link is tapped
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});


/* ── 3. SMOOTH SCROLL WITH NAV OFFSET ──────────────────────────
   Intercepts all anchor links and scrolls with a fixed nav offset
   so section headings aren't hidden behind the navbar.
──────────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 4. SCROLL REVEAL ───────────────────────────────────────────
   Elements with class .reveal animate in when they enter the
   viewport. Applied automatically to section titles, cards, etc.
──────────────────────────────────────────────────────────────── */

// Add .reveal to elements we want to animate on scroll
const revealTargets = [
  '.section-title',
  '.about-principles',
  '.about-bio',
  '.timeline-item',
  '.project-card',
  '.skill-group',
  '.education-card',
  '.extracurr-card',
  '.section-sub',
];
document.querySelectorAll(revealTargets.join(', ')).forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger cards within a grid
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Only animate once
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── 5. PROJECT MODAL ───────────────────────────────────────────
   Opens a modal when a .project-card is clicked or Enter pressed.
   Reads content from data-* attributes on the card element.
   Injects HTML into #modal-body and displays #project-modal.
──────────────────────────────────────────────────────────────── */
const projectModal   = document.getElementById('project-modal');
const modalBody      = document.getElementById('modal-body');
const modalClose     = document.getElementById('modal-close');
const modalOverlay   = document.getElementById('modal-overlay');

/**
 * Build and inject HTML into the project modal body.
 * @param {HTMLElement} card - The clicked .project-card element
 */
function openProjectModal(card) {
  const title   = card.dataset.title   || '';
  const company = card.dataset.company || '';
  const desc    = card.dataset.desc    || '';
  const outcome = card.dataset.outcome || '';
  const github  = card.dataset.github  || '';
  const logo    = card.dataset.logo    || '';
  const tags    = card.dataset.tags    ? card.dataset.tags.split(',') : [];
  const responsibilities = card.dataset.responsibilities || '';
  const learnings = card.dataset.learnings || '';

  // Build logo HTML (only rendered if a logo URL is provided)
  const logoHtml = logo
    ? `<img src="${logo}" alt="Project Logo" class="modal-logo">`
    : '';

  // Build tag HTML
  const tagsHtml = tags.map(t => `<span>${t.trim()}</span>`).join('');

  // Build GitHub link HTML (only rendered if a URL is provided)
  const githubHtml = github
    ? `<a href="${github}" target="_blank" rel="noopener" class="modal-github">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
         </svg>
         View on GitHub
       </a>`
    : '';

  modalBody.innerHTML = `
    ${logoHtml}
    <h2>${title}</h2>
    <p class="modal-company">${company}</p>
    <p class="modal-desc">${desc}</p>
    ${responsibilities ? '<p class="modal-outcome-label">Key Responsibilities</p>' : ''}
    ${responsibilities ? '<ul class="modal-bullets">' + responsibilities.split('|').map(r => `<li>${r.trim()}</li>`).join('') + '</ul>' : ''}
    ${learnings ? '<p class="modal-outcome-label">Key Learnings</p>' : ''}
    ${learnings ? '<ul class="modal-bullets">' + learnings.split('|').map(l => `<li>${l.trim()}</li>`).join('') + '</ul>' : ''}
    <p class="modal-outcome-label">Outcome</p>
    <p class="modal-outcome">${outcome}</p>
    <div class="modal-tags">${tagsHtml}</div>
    ${githubHtml}
  `;

  projectModal.classList.add('modal-open');
  document.body.style.overflow = 'hidden'; // Prevent background scroll
  modalClose.focus();
}

function closeProjectModal() {
  projectModal.classList.remove('modal-open');
  document.body.style.overflow = '';
}

// Attach click listeners to all project cards
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => openProjectModal(card));
  // Keyboard accessibility: open on Enter or Space
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(card);
    }
  });
});

modalClose.addEventListener('click', closeProjectModal);
modalOverlay.addEventListener('click', closeProjectModal);


/* ── 6. EXTRACURRICULARS MODAL ──────────────────────────────────
   Same pattern as project modal but for .extracurr-card elements.
   Reads data-title, data-role, data-dates, data-bullets (pipe "|"
   separated string that becomes a bullet list).
──────────────────────────────────────────────────────────────── */
const extracurrModal        = document.getElementById('extracurr-modal');
const extracurrModalBody    = document.getElementById('extracurr-modal-body');
const extracurrModalClose   = document.getElementById('extracurr-modal-close');
const extracurrModalOverlay = document.getElementById('extracurr-modal-overlay');

/**
 * Build and inject HTML into the extracurriculars modal body.
 * @param {HTMLElement} card - The clicked .extracurr-card element
 */
function openExtracurrModal(card) {
  const title   = card.dataset.title   || '';
  const role    = card.dataset.role    || '';
  const dates   = card.dataset.dates   || '';
  const bullets = card.dataset.bullets || '';

  // Split pipe-separated bullets into <li> items
  const bulletItems = bullets
    .split('|')
    .filter(b => b.trim())
    .map(b => `<li>${b.trim()}</li>`)
    .join('');

  extracurrModalBody.innerHTML = `
    <h2>${title}</h2>
    <p class="modal-company">${role} &nbsp;·&nbsp; ${dates}</p>
    <p class="modal-outcome-label">Contributions</p>
    <ul class="modal-bullets">${bulletItems}</ul>
    <!-- 
      PHOTO SECTION — add real photos here when ready.
      Example:
      <img src="images/mechtron-event.jpg" alt="Mechatronics Society event" style="width:100%;border-radius:8px;margin-top:16px;">
    -->
  `;

  extracurrModal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  extracurrModalClose.focus();
}

function closeExtracurrModal() {
  extracurrModal.classList.remove('modal-open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.extracurr-card').forEach(card => {
  card.addEventListener('click', () => openExtracurrModal(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openExtracurrModal(card);
    }
  });
});

extracurrModalClose.addEventListener('click', closeExtracurrModal);
extracurrModalOverlay.addEventListener('click', closeExtracurrModal);


/* ── GLOBAL KEYBOARD HANDLER ────────────────────────────────────
   Closes any open modal when Escape is pressed.
──────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeProjectModal();
    closeExtracurrModal();
  }
});
