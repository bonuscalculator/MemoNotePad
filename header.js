/* =============================================
   MEMO NOTEPAD ONLINE – HEADER COMPONENT
   ============================================= */

(function () {
  'use strict';

  const headerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="/" class="header-logo">
          <div class="logo-icon">📝</div>
          <span>Memo NotePad</span>
        </a>

        <nav class="header-nav" id="headerNav">
          <a href="/#app" class="nav-link active">App</a>
          <a href="/diary" class="nav-link">Diary</a>
          <a href="/random-text" class="nav-link">Random Text</a>
          <a href="/list-maker" class="nav-link">List Maker</a>
          <a href="/choice-maker" class="nav-link">Decision Maker</a>
          <a href="/word-counter" class="nav-link">Word Counter</a>
          <a href="/#faq" class="nav-link">FAQ</a>
        </nav>

        <div class="header-actions">
          <button class="dark-toggle" id="darkToggleHeader" title="Toggle dark mode" aria-label="Toggle dark mode">🌙</button>
          <button class="hamburger" id="hamburgerBtn" aria-label="Toggle mobile menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <nav class="mobile-nav" id="mobileNav" aria-hidden="true">
        <a href="/#app" class="nav-link">App</a>
        <a href="/diary" class="nav-link">Diary</a>
        <a href="/random-text" class="nav-link">Random Text</a>
        <a href="/list-maker" class="nav-link">List Maker</a>
        <a href="/choice-maker" class="nav-link">Decision Maker</a>
        <a href="/word-counter" class="nav-link">Word Counter</a>
        <a href="/#faq" class="nav-link">FAQ</a>
      </nav>
    </header>
  `;

  function injectHeader() {
    const headerRoot = document.getElementById('header-root');
    if (!headerRoot) {
      console.warn('Header root element not found');
      return;
    }

    headerRoot.innerHTML = headerHTML;

    // Setup mobile menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        mobileNav.setAttribute('aria-hidden', !isOpen);
      });

      // Close mobile nav when clicking a link
      mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileNav.setAttribute('aria-hidden', 'true');
        });
      });
    }

    // Dark mode toggle in header
    const darkToggleHeader = document.getElementById('darkToggleHeader');
    if (darkToggleHeader) {
      darkToggleHeader.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        
        if (isDark) {
          document.body.classList.remove('dark-mode');
          document.body.classList.add('light-mode');
          darkToggleHeader.innerHTML = '🌙';
          // Also update the other dark toggle if it exists
          const otherToggle = document.querySelector('.dark-toggle:not(#darkToggleHeader)');
          if (otherToggle) otherToggle.innerHTML = '🌙';
          // Save setting
          saveDarkModeSetting(false);
        } else {
          document.body.classList.add('dark-mode');
          document.body.classList.remove('light-mode');
          darkToggleHeader.innerHTML = '☀️';
          const otherToggle = document.querySelector('.dark-toggle:not(#darkToggleHeader)');
          if (otherToggle) otherToggle.innerHTML = '☀️';
          saveDarkModeSetting(true);
        }
      });

      // Sync with initial dark mode state
      if (document.body.classList.contains('dark-mode')) {
        darkToggleHeader.innerHTML = '☀️';
      }
    }

    // Active nav link highlighting based on scroll position
    setupActiveNavHighlight();
  }

  function saveDarkModeSetting(isDark) {
    try {
      const settings = JSON.parse(localStorage.getItem('memo_notepad_settings') || '{}');
      settings.darkMode = isDark;
      localStorage.setItem('memo_notepad_settings', JSON.stringify(settings));
    } catch (e) {
      // ignore storage errors
    }
  }

  function setupActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header-nav .nav-link, .mobile-nav .nav-link');

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }

})();
