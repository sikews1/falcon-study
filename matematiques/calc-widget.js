// Floating calculator widget - adds a button to open calculadora.html in a popup
(function() {
    // Create floating button
    const btn = document.createElement('button');
    btn.id = 'calc-float-btn';
    btn.innerHTML = '&#x1F5A9;';
    btn.title = 'Obrir calculadora';
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;font-size:1.5rem;cursor:pointer;box-shadow:0 4px 20px rgba(5,150,105,0.3);z-index:9000;transition:all 0.3s;display:flex;align-items:center;justify-content:center;';
    btn.onmouseover = function() { this.style.transform = 'scale(1.1)'; this.style.boxShadow = '0 8px 30px rgba(5,150,105,0.4)'; };
    btn.onmouseout = function() { this.style.transform = ''; this.style.boxShadow = '0 4px 20px rgba(5,150,105,0.3)'; };

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'calc-overlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9500;backdrop-filter:blur(4px);';

    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'calc-popup';
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:420px;max-height:85vh;background:var(--bg-raised,#fff);border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,0.3);z-index:9600;overflow:hidden;display:none;';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.8rem;color:var(--text-secondary,#666);cursor:pointer;z-index:10;line-height:1;';

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:80vh;max-height:600px;border:none;';

    popup.appendChild(closeBtn);
    popup.appendChild(iframe);

    function openCalc() {
        iframe.src = (window.location.pathname.includes('/matematiques/') ? '' : 'matematiques/') + 'calculadora.html';
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }

    function closeCalc() {
        overlay.style.display = 'none';
        popup.style.display = 'none';
        iframe.src = '';
    }

    btn.onclick = openCalc;
    overlay.onclick = closeCalc;
    closeBtn.onclick = closeCalc;

    // Don't show on calculadora.html itself
    if (!window.location.pathname.includes('calculadora.html')) {
        document.body.appendChild(btn);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }
})();
