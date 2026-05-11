/* =============================================
   MEMO NOTEPAD ONLINE – APPLICATION LOGIC
   Fixed Dark Mode Text Issue
   ============================================= */

(function () {
  'use strict';

  // ---------- DOM ELEMENTS ----------
  const notesList = document.getElementById('notesList');
  const noteTitleInput = document.getElementById('noteTitle');
  const noteEditor = document.getElementById('noteEditor');
  const newNoteBtn = document.getElementById('newNoteBtn');
  const searchInput = document.getElementById('searchInput');
  const wordCountEl = document.getElementById('wordCount');
  const charCountEl = document.getElementById('charCount');
  const autoSaveStatus = document.getElementById('autoSaveStatus');
  const copyNoteBtn = document.getElementById('copyNoteBtn');
  const downloadNoteBtn = document.getElementById('downloadNoteBtn');
  const deleteNoteBtn = document.getElementById('deleteNoteBtn');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const textColorPicker = document.getElementById('textColorPicker');
  const clearFormatBtn = document.getElementById('clearFormatBtn');
  const toast = document.getElementById('toast');
  const darkToggle = document.querySelector('.dark-toggle');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const faqList = document.getElementById('faqList');

  // ---------- STATE ----------
  let notes = [];
  let currentNoteId = null;
  let autoSaveTimer = null;
  let isTyping = false;

  // ---------- STORAGE ----------
  const STORAGE_KEY = 'memo_notepad_notes';
  const SETTINGS_KEY = 'memo_notepad_settings';

  function loadNotes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        notes = JSON.parse(stored);
        notes = notes.map(note => ({
          ...note,
          content: note.content || '',
          fontSize: note.fontSize || '16px',
          fontFamily: note.fontFamily || 'DM Sans, sans-serif',
          textColor: note.textColor || '#1a1a2e',
        }));
      }
    } catch (e) {
      console.warn('Failed to load notes', e);
      notes = [];
    }
    if (!notes.length) {
      const welcomeNote = {
        id: generateId(),
        title: 'Welcome to Memo NotePad!',
        content: '<p>👋 <b>Welcome!</b> This is your first memo. You can edit it, create new ones, or delete this. Everything is auto-saved on your device.</p><p>Try the <i>formatting toolbar</i> above to style your text.</p>',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fontSize: '16px',
        fontFamily: 'DM Sans, sans-serif',
        textColor: '#1a1a2e',
      };
      notes = [welcomeNote];
      saveNotes();
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      showToast('⚠️ Storage full. Please delete some notes.');
    }
  }

  function loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (settings) {
        if (settings.darkMode) {
          document.body.classList.add('dark-mode');
          document.body.classList.remove('light-mode');
          updateDarkModeToggles(true);
        }
      }
    } catch (e) { /* ignore */ }
  }

  function saveSettings(settings) {
    const existing = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...existing, ...settings }));
  }

  // Update all dark mode toggle buttons
  function updateDarkModeToggles(isDark) {
    const toggles = document.querySelectorAll('.dark-toggle');
    toggles.forEach(toggle => {
      toggle.innerHTML = isDark ? '☀️' : '🌙';
    });
  }

  // Apply current theme to editor
  function applyThemeToEditor() {
    const isDark = document.body.classList.contains('dark-mode');
    
    if (noteTitleInput) {
      noteTitleInput.style.color = isDark ? '#EEEAE2' : (currentNoteId ? notes.find(n => n.id === currentNoteId)?.textColor || '#1a1a2e' : '#1a1a2e');
    }
    
    if (noteEditor) {
      noteEditor.style.color = isDark ? '#EEEAE2' : (currentNoteId ? notes.find(n => n.id === currentNoteId)?.textColor || '#1a1a2e' : '#1a1a2e');
    }
  }

  // ---------- UTILS ----------
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getPlainText(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  function showToast(message, duration = 2000) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  function updateStatus(saved = true) {
    if (autoSaveStatus) {
      autoSaveStatus.textContent = saved ? '✓ Auto-saved' : 'Saving...';
      autoSaveStatus.style.color = saved ? 'var(--primary-light)' : 'var(--accent)';
    }
  }

  // ---------- RENDER NOTES LIST ----------
  function renderNotesList(filter = '') {
    if (!notesList) return;
    const filtered = filter
      ? notes.filter(n => n.title.toLowerCase().includes(filter.toLowerCase()) ||
                          getPlainText(n.content).toLowerCase().includes(filter.toLowerCase()))
      : notes;
    
    notesList.innerHTML = '';
    
    if (!filtered.length) {
      notesList.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No memos found</div>';
      return;
    }

    filtered.forEach(note => {
      const item = document.createElement('div');
      item.className = `note-item${note.id === currentNoteId ? ' active' : ''}`;
      item.dataset.id = note.id;
      
      const title = escapeHtml(note.title || 'Untitled');
      const preview = escapeHtml(getPlainText(note.content).substring(0, 60) || 'Empty memo');
      const date = new Date(note.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      item.innerHTML = `
        <div class="note-item-title">${title}</div>
        <div class="note-item-preview">${preview}</div>
        <div class="note-item-date">${date}</div>
      `;
      
      item.addEventListener('click', () => selectNote(note.id));
      notesList.appendChild(item);
    });
  }

  // ---------- SELECT / LOAD NOTE ----------
  function selectNote(id) {
    if (currentNoteId && currentNoteId !== id) {
      saveCurrentNote();
    }
    
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (!note) return;

    noteTitleInput.value = note.title || '';
    noteEditor.innerHTML = note.content || '';
    
    fontSizeSelect.value = note.fontSize || '16px';
    fontFamilySelect.value = note.fontFamily || 'DM Sans, sans-serif';
    
    const isDark = document.body.classList.contains('dark-mode');
    const effectiveColor = isDark ? '#EEEAE2' : (note.textColor || '#1a1a2e');
    textColorPicker.value = note.textColor || '#1a1a2e';
    
    noteEditor.style.fontSize = note.fontSize || '16px';
    noteEditor.style.fontFamily = note.fontFamily || 'DM Sans, sans-serif';
    noteEditor.style.color = effectiveColor;
    noteTitleInput.style.color = effectiveColor;

    updateCounts();
    updateStatus(true);
    renderNotesList(searchInput?.value || '');
  }

  function saveCurrentNote() {
    if (!currentNoteId) return;
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;

    note.title = noteTitleInput.value.trim() || 'Untitled';
    note.content = noteEditor.innerHTML;
    note.fontSize = fontSizeSelect.value;
    note.fontFamily = fontFamilySelect.value;
    note.textColor = textColorPicker.value;
    note.updatedAt = Date.now();
    saveNotes();
    updateStatus(true);
    renderNotesList(searchInput?.value || '');
  }

  function createNewNote() {
    if (currentNoteId) saveCurrentNote();

    const newNote = {
      id: generateId(),
      title: 'Untitled',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fontSize: '16px',
      fontFamily: 'DM Sans, sans-serif',
      textColor: '#1a1a2e',
    };
    notes.unshift(newNote);
    saveNotes();
    selectNote(newNote.id);
    noteTitleInput.focus();
    showToast('✨ New memo created');
  }

  function deleteCurrentNote() {
    if (!currentNoteId) return;
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    if (!confirm(`Delete "${note.title}"? This cannot be undone.`)) return;

    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotes();
    
    currentNoteId = null;

    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      noteTitleInput.value = '';
      noteEditor.innerHTML = '';
      currentNoteId = null;
      createNewNote();
    }
    
    renderNotesList(searchInput?.value || '');
    showToast('🗑️ Memo deleted');
  }

  // ---------- AUTO SAVE ----------
  function scheduleAutoSave() {
    isTyping = true;
    updateStatus(false);
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveCurrentNote();
      isTyping = false;
    }, 800);
  }

  // ---------- COUNTS ----------
  function updateCounts() {
    const text = getPlainText(noteEditor.innerHTML);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    if (wordCountEl) wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    if (charCountEl) charCountEl.textContent = `${chars} char${chars !== 1 ? 's' : ''}`;
  }

  // ---------- TOOLBAR ACTIONS ----------
  function execCommand(command, value = null) {
    noteEditor.focus();
    document.execCommand(command, false, value);
    updateCounts();
    scheduleAutoSave();
  }

  function setupToolbarButtons() {
    document.querySelectorAll('.tool-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        execCommand(cmd);
      });
    });
  }

  // ---------- CLIPBOARD & DOWNLOAD ----------
  function copyNoteToClipboard() {
    const text = getPlainText(noteEditor.innerHTML);
    if (!text.trim()) {
      showToast('📋 Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Copied to clipboard!');
    }).catch(() => {
      showToast('⚠️ Failed to copy');
    });
  }

  function downloadNoteAsTxt() {
    const title = noteTitleInput.value.trim() || 'memo';
    const text = getPlainText(noteEditor.innerHTML);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 Downloaded!');
  }

  // ---------- DARK MODE ----------
  function toggleDarkMode() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      updateDarkModeToggles(false);
      saveSettings({ darkMode: false });
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      updateDarkModeToggles(true);
      saveSettings({ darkMode: true });
    }
    
    // Fix editor text color after theme change
    applyThemeToEditor();
    
    // If a note was loaded with a custom color, maintain the effective color
    if (currentNoteId) {
      const note = notes.find(n => n.id === currentNoteId);
      if (note) {
        const newIsDark = document.body.classList.contains('dark-mode');
        const effectiveColor = newIsDark ? '#EEEAE2' : (note.textColor || '#1a1a2e');
        noteEditor.style.color = effectiveColor;
        noteTitleInput.style.color = effectiveColor;
      }
    }
  }

  // ---------- MOBILE NAV ----------
  function toggleMobileNav() {
    if (mobileNav) {
      mobileNav.classList.toggle('open');
    }
  }

  // ---------- FAQ ACCORDION ----------
  function setupFaq() {
    if (!faqList) return;
    faqList.addEventListener('click', (e) => {
      const question = e.target.closest('.faq-q');
      if (!question) return;
      const item = question.closest('.faq-item');
      if (item) {
        item.classList.toggle('open');
      }
    });
  }

  // ---------- SCROLL ANIMATIONS ----------
  function setupScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    cards.forEach(card => observer.observe(card));
  }

  // ---------- SMOOTH ANCHOR LINKS ----------
  function setupSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          if (mobileNav) mobileNav.classList.remove('open');
        }
      });
    });
  }

  // ---------- EVENT LISTENERS ----------
  function bindEvents() {
    if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderNotesList(e.target.value);
      });
    }

    if (noteTitleInput) {
      noteTitleInput.addEventListener('input', () => {
        scheduleAutoSave();
      });
    }

    if (noteEditor) {
      noteEditor.addEventListener('input', () => {
        updateCounts();
        scheduleAutoSave();
      });
    }

    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', () => {
        noteEditor.style.fontSize = fontSizeSelect.value;
        scheduleAutoSave();
      });
    }

    if (fontFamilySelect) {
      fontFamilySelect.addEventListener('change', () => {
        noteEditor.style.fontFamily = fontFamilySelect.value;
        scheduleAutoSave();
      });
    }

    if (textColorPicker) {
      textColorPicker.addEventListener('input', () => {
        const isDark = document.body.classList.contains('dark-mode');
        // In dark mode, always use light color regardless of picker
        noteEditor.style.color = isDark ? '#EEEAE2' : textColorPicker.value;
        noteTitleInput.style.color = isDark ? '#EEEAE2' : textColorPicker.value;
        scheduleAutoSave();
      });
    }

    if (clearFormatBtn) {
      clearFormatBtn.addEventListener('click', () => {
        execCommand('removeFormat');
        const isDark = document.body.classList.contains('dark-mode');
        noteEditor.style.fontSize = fontSizeSelect.value;
        noteEditor.style.fontFamily = fontFamilySelect.value;
        noteEditor.style.color = isDark ? '#EEEAE2' : textColorPicker.value;
        noteTitleInput.style.color = isDark ? '#EEEAE2' : textColorPicker.value;
      });
    }

    if (copyNoteBtn) copyNoteBtn.addEventListener('click', copyNoteToClipboard);
    if (downloadNoteBtn) downloadNoteBtn.addEventListener('click', downloadNoteAsTxt);
    if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', deleteCurrentNote);

    // Dark mode toggle - handle both header and any other dark toggles
    document.addEventListener('click', (e) => {
      const darkBtn = e.target.closest('.dark-toggle');
      if (darkBtn) {
        toggleDarkMode();
      }
    });

    if (hamburger) hamburger.addEventListener('click', toggleMobileNav);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentNote();
        showToast('💾 Manually saved');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (currentNoteId) saveCurrentNote();
    });

    // Listen for dark mode changes from other components
    const observer = new MutationObserver(() => {
      applyThemeToEditor();
      if (currentNoteId) {
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
          const isDark = document.body.classList.contains('dark-mode');
          const effectiveColor = isDark ? '#EEEAE2' : (note.textColor || '#1a1a2e');
          noteEditor.style.color = effectiveColor;
          noteTitleInput.style.color = effectiveColor;
        }
      }
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // ---------- INIT ----------
  function init() {
    loadSettings();
    loadNotes();
    renderNotesList();
    
    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      createNewNote();
    }

    bindEvents();
    setupToolbarButtons();
    setupFaq();
    setupScrollAnimations();
    setupSmoothLinks();
    
    // Apply theme on init
    applyThemeToEditor();

    console.log('📝 Memo NotePad Online ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
