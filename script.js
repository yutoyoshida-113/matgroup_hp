/* ============================================================
   MAT GROUP Corporate Website — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. Header shadow on scroll
     Adds/removes the "scrolled" class on the <header> element
     to trigger the box-shadow transition defined in CSS.
  ============================================================ */
  const siteHeader = document.getElementById('site-header');

  function handleHeaderScroll() {
    if (window.scrollY > 10) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  // Run once on load in case the page is refreshed mid-scroll
  handleHeaderScroll();


  /* ============================================================
     2. Mobile nav toggle (hamburger ↔ X)
     Toggles aria-expanded on the button and is-open on the nav.
  ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const siteNav   = document.getElementById('site-nav');

  function openNav() {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    siteNav.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeNav() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    siteNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close nav when pressing Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
      closeNav();
      hamburger.focus();
    }
  });


  /* ============================================================
     3. Close nav on nav-link click (mobile)
     Each nav link closes the mobile menu before smooth-scrolling.
  ============================================================ */
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (siteNav.classList.contains('is-open')) {
        closeNav();
      }
    });
  });


  /* ============================================================
     4. Smooth scroll with header height offset
     Intercepts anchor clicks and manually scrolls so the target
     section is not hidden behind the fixed header.
  ============================================================ */
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const headerHeight = siteHeader.offsetHeight;
    const targetTop    = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });


  /* ============================================================
     5. IntersectionObserver — strength-item fade-in (staggered)
     Each .strength-item starts hidden (opacity:0, translate:24px)
     via CSS. Once it enters the viewport, we add .is-visible
     with a staggered delay (index × 100ms) so cards appear one
     after another.
  ============================================================ */
  const strengthItems = document.querySelectorAll('.strength-item');

  if (strengthItems.length > 0 && 'IntersectionObserver' in window) {
    const strengthObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el    = entry.target;
            const index = Number(el.dataset.strengthIndex) || 0;

            // Apply staggered delay then add visible class
            setTimeout(function () {
              el.classList.add('is-visible');
            }, index * 100);

            // Stop observing once animated
            strengthObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    strengthItems.forEach(function (item, index) {
      item.dataset.strengthIndex = index;
      strengthObserver.observe(item);
    });
  } else {
    // Fallback: show all immediately (also handles prefers-reduced-motion via CSS)
    strengthItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }


  /* ============================================================
     6. IntersectionObserver — active nav link highlighting
     Tracks which section is currently visible and marks the
     corresponding nav link with the "active" class.
  ============================================================ */
  const sections   = document.querySelectorAll('main section[id]');
  const navLinkMap = {};

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkMap[href.slice(1)] = link;
    }
  });

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.remove('active');
    });
    if (id && navLinkMap[id]) {
      navLinkMap[id].classList.add('active');
    }
  }

  if (sections.length > 0 && 'IntersectionObserver' in window) {
    // Track which sections are currently intersecting
    const visibleSections = new Set();

    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        // Activate the first (topmost) visible section
        let topId = null;
        sections.forEach(function (section) {
          if (visibleSections.has(section.id)) {
            if (topId === null) {
              topId = section.id;
            }
          }
        });

        setActiveLink(topId);
      },
      {
        // Trigger when the top portion of a section is in view
        rootMargin: '-' + siteHeader.offsetHeight + 'px 0px -55% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }


  /* ============================================================
     7. Dynamic copyright year
     Sets the current year inside the #copyright-year span so the
     footer always displays the correct year without manual edits.
  ============================================================ */
  const copyrightYearEl = document.getElementById('copyright-year');
  if (copyrightYearEl) {
    copyrightYearEl.textContent = new Date().getFullYear();
  }

})();
