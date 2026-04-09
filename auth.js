// === FALCON STUDY - User System ===
const USER_KEY = 'falcon_user_name';

function getUser() { return localStorage.getItem(USER_KEY); }
function setUser(name) { localStorage.setItem(USER_KEY, name.trim()); }

function logout() {
    if (confirm('Cerrar sesion? Tu progreso se mantendra en este navegador.')) {
        localStorage.removeItem(USER_KEY);
        location.reload();
    }
}

function showLoginScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'loginOverlay';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bg = isDark ? 'rgba(10,12,18,0.95)' : 'rgba(250,250,250,0.95)';
    const cardBg = isDark ? '#131316' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textColor = isDark ? '#fafafa' : '#18181b';
    const textSec = isDark ? '#a1a1aa' : '#52525b';
    const textMuted = isDark ? '#52525b' : '#a1a1aa';
    const inputBg = isDark ? '#09090b' : '#f4f4f5';

    overlay.innerHTML = `
        <div style="position:fixed;inset:0;background:${bg};z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(24px);">
            <div style="background:${cardBg};padding:50px 40px;border-radius:24px;border:1px solid ${cardBorder};max-width:450px;width:90%;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.15),0 0 60px rgba(139,92,246,0.05);">
                <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:16px;background:linear-gradient(135deg,#f97316,#fb923c);display:flex;align-items:center;justify-content:center;font-size:1.8rem;box-shadow:0 8px 24px rgba(249,115,22,0.2);">&#x1F6E1;&#xFE0F;</div>
                <h1 style="color:${textColor};font-size:1.6rem;margin-bottom:5px;font-family:'Inter','Segoe UI',sans-serif;font-weight:800;letter-spacing:-0.02em;"><span style="background:linear-gradient(135deg,#f97316,#fb923c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">CrowdStrike</span> Falcon</h1>
                <p style="color:${textSec};margin-bottom:30px;font-family:'Inter','Segoe UI',sans-serif;font-size:0.9rem;">Material de estudio - Administrator</p>
                <p style="color:${textColor};margin-bottom:20px;font-family:'Inter','Segoe UI',sans-serif;font-size:1rem;">Como te llamas?</p>
                <input type="text" id="loginName" placeholder="Tu nombre..."
                    style="width:100%;padding:14px 20px;border-radius:12px;border:1px solid ${cardBorder};background:${inputBg};color:${textColor};font-size:1.1rem;outline:none;font-family:'Inter','Segoe UI',sans-serif;text-align:center;margin-bottom:20px;transition:border-color 0.3s;"
                    onfocus="this.style.borderColor='#f97316';this.style.boxShadow='0 0 0 3px rgba(249,115,22,0.1)'" onblur="this.style.borderColor='${cardBorder}';this.style.boxShadow='none'"
                    autofocus>
                <br>
                <button onclick="doLogin()"
                    style="padding:14px 50px;border-radius:25px;border:none;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-size:1rem;font-weight:700;cursor:pointer;font-family:'Inter','Segoe UI',sans-serif;transition:all 0.3s;box-shadow:0 4px 20px rgba(249,115,22,0.15);"
                    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px rgba(249,115,22,0.25)'"
                    onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(249,115,22,0.15)'">
                    Entrar
                </button>
                <p style="color:${textMuted};font-size:0.75rem;margin-top:20px;font-family:'Inter','Segoe UI',sans-serif;">Tu progreso se guarda en este navegador</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('loginName').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
    setTimeout(() => document.getElementById('loginName').focus(), 100);
}

function doLogin() {
    const name = document.getElementById('loginName').value.trim();
    if (!name) { document.getElementById('loginName').style.borderColor = '#ef4444'; return; }
    setUser(name);
    document.getElementById('loginOverlay').remove();
    updateUserDisplay();
}

function updateUserDisplay() {
    const user = getUser();
    if (!user) return;
    const header = document.querySelector('.header');
    if (header) {
        let badge = header.querySelector('.user-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'user-badge';
            badge.style.cssText = 'margin-top:12px;display:inline-flex;align-items:center;gap:8px;background:var(--accent-soft);padding:6px 18px;border-radius:20px;font-size:0.85rem;color:var(--accent);font-weight:600;cursor:pointer;border:1px solid var(--accent-glow);transition:all 0.3s;';
            badge.title = 'Clic para cerrar sesion';
            badge.onclick = logout;
            header.appendChild(badge);
        }
        badge.innerHTML = '&#x1F464; ' + user;
    }
}

(function() {
    const init = getUser() ? updateUserDisplay : showLoginScreen;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
