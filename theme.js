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

// Load saved theme + lang
(function() {
    const savedTheme = localStorage.getItem('falcon_theme');
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    const savedLang = localStorage.getItem('falcon_lang');
    if (savedLang === 'en') document.documentElement.setAttribute('data-lang', 'en');

    function initAll() {
        updateToggleIcon();
        updateLangIcon();
        initCardGlow();
        injectToggle();
        injectLangToggle();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();
})();

// Helper: check if bilingual mode is on
function isBilingual() {
    return document.documentElement.getAttribute('data-lang') === 'en';
}

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

// Language toggle (ES only / EN+ES bilingual)
function toggleLang() {
    const current = document.documentElement.getAttribute('data-lang');
    const next = current === 'en' ? '' : 'en';
    if (next) document.documentElement.setAttribute('data-lang', 'en');
    else document.documentElement.removeAttribute('data-lang');
    localStorage.setItem('falcon_lang', next || 'es');
    updateLangIcon();
}

function updateLangIcon() {
    const isEn = document.documentElement.getAttribute('data-lang') === 'en';
    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.textContent = isEn ? 'EN' : 'ES';
        btn.title = isEn ? 'Modo bilingue activo (clic para solo espanol)' : 'Solo espanol (clic para bilingue EN+ES)';
    });
}

function injectLangToggle() {
    const topBar = document.querySelector('.top-bar');
    if (topBar && !topBar.querySelector('.lang-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle lang-toggle';
        btn.onclick = toggleLang;
        btn.style.cssText = 'font-size:0.75rem;font-weight:700;font-family:var(--font-sans);';
        topBar.appendChild(btn);
        updateLangIcon();
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
