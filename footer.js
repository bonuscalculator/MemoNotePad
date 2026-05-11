/* =============================================
   MEMO NOTEPAD ONLINE – FOOTER COMPONENT
   ============================================= */

(function () {
  'use strict';

  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <a href="/" class="header-logo">
              <div class="logo-icon">📝</div>
              <span>Memo NotePad</span>
            </a>
            <p>
              Your free, fast, and secure online notepad. Capture ideas, write memos, and organize thoughts instantly — no account needed. Works everywhere.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/#app">Open App</a></li>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><a href="/#faq">FAQ</a></li>
              <li><a href="/#cta">Get Started</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/#tips">Tips & Tricks</a></li>
              <li><a href="/#use-cases">Use Cases</a></li>
              <li><a href="/#why-us">Why Choose Us</a></li>
              <li><a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">Back to Top</a></li>
            </ul>
          </div>

          <!-- Connect -->
          <div class="footer-col">
            <h4>Pages</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Use</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${currentYear} MemoNotePad.online — Free Online Notepad. All rights reserved.</p>
          <p>Built with ❤️ for writers, students, and thinkers everywhere.</p>
        </div>
      </div>
    </footer>
  `;

  function injectFooter() {
    const footerRoot = document.getElementById('footer-root');
    if (!footerRoot) {
      console.warn('Footer root element not found');
      return;
    }

    footerRoot.innerHTML = footerHTML;

    // Add smooth scrolling for footer links
    footerRoot.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }

})();
