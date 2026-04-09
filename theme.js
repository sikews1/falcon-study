// === THEME TOGGLE & CARD GLOW ===

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next === 'light' ? '' : 'dark');
    if (next === 'light') html.removeAttribute('data-theme');
    else html.setAttribute('data-theme', 'dark');
    localStorage.setItem('falcon_theme', next);
    updateToggleIcon();
}

function updateToggleIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    });
}

// Load saved theme
(function() {
    const saved = localStorage.getItem('falcon_theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateToggleIcon();
            initCardGlow();
            injectToggle();
        });
    } else {
        updateToggleIcon();
        initCardGlow();
        injectToggle();
    }
})();

// Inject toggle button into top-bar if not already there
function injectToggle() {
    const topBar = document.querySelector('.top-bar');
    if (topBar && !topBar.querySelector('.theme-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.onclick = toggleTheme;
        btn.title = 'Cambiar tema';
        topBar.appendChild(btn);
        updateToggleIcon();
    }
}

// Card mouse glow effect
function initCardGlow() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.card, .actor-card, .module-card, .scenario-card, .flashcard-front, .flashcard-back').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });
    });
}
