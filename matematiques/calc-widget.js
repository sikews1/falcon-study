// Floating calculator - self-contained, no iframe
(function() {
    let expr = '', hist = [];

    const btn = document.createElement('button');
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="16" y2="18"/></svg>';
    btn.title = 'Calculadora';
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(5,150,105,0.3);z-index:9000;transition:all .25s;display:flex;align-items:center;justify-content:center;';
    btn.onmouseover = function(){this.style.transform='scale(1.08)';};
    btn.onmouseout = function(){this.style.transform='';};

    const overlay = document.createElement('div');
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9500;backdrop-filter:blur(4px);';

    const popup = document.createElement('div');
    popup.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:340px;max-width:95vw;background:var(--bg-raised,#fff);border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,0.25);z-index:9600;padding:16px;';

    const css = document.createElement('style');
    css.textContent = `
.cw-close{position:absolute;top:8px;right:12px;background:none;border:none;font-size:1.4rem;color:var(--text-muted,#999);cursor:pointer;line-height:1;padding:4px;}
.cw-close:hover{color:var(--text-primary,#333);}
.cw-display{background:var(--bg-overlay,#f0f0f3);border-radius:12px;padding:12px 16px;margin-bottom:10px;text-align:right;min-height:70px;display:flex;flex-direction:column;justify-content:flex-end;}
.cw-input{font-size:.82rem;color:var(--text-muted,#999);min-height:16px;word-break:break-all;font-family:'Inter',monospace;}
.cw-result{font-size:2rem;font-weight:800;color:var(--text-primary,#1d1d1f);word-break:break-all;font-family:'Inter',monospace;line-height:1.2;}
.cw-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;}
.cw-b{height:42px;border:1px solid var(--border-subtle,#e5e5e5);border-radius:10px;background:var(--bg-raised,#fff);color:var(--text-primary,#1d1d1f);font-size:.88rem;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;transition:all .12s;display:flex;align-items:center;justify-content:center;}
.cw-b:hover{background:var(--bg-hover,#e5e5e5);transform:translateY(-1px);}
.cw-b:active{transform:translateY(0);}
.cw-b.num{font-size:1.05rem;}
.cw-b.op{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-color:transparent;font-size:1.05rem;}
.cw-b.op:hover{filter:brightness(1.1);}
.cw-b.sci{background:var(--bg-overlay,#f0f0f3);font-size:.75rem;font-weight:500;}
.cw-b.sci:hover{background:rgba(5,150,105,.12);color:#059669;}
.cw-b.clr{background:rgba(239,68,68,.08);color:#ef4444;border-color:transparent;font-weight:700;}
.cw-b.clr:hover{background:rgba(239,68,68,.15);}
.cw-b.eq{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-color:transparent;grid-column:span 2;font-size:1.2rem;font-weight:800;}
.cw-b.eq:hover{filter:brightness(1.1);}
.cw-hist{margin-top:8px;max-height:120px;overflow-y:auto;font-size:.72rem;color:var(--text-muted,#999);font-family:'Inter',monospace;}
.cw-hist div{display:flex;justify-content:space-between;padding:3px 4px;border-radius:4px;cursor:pointer;}
.cw-hist div:hover{background:var(--bg-hover,#e5e5e5);}
.cw-hist .r{color:#059669;font-weight:700;}
`;
    document.head.appendChild(css);

    popup.innerHTML = `
<button class="cw-close" onclick="this.parentElement.style.display='none';document.getElementById('cw-ov').style.display='none';">&times;</button>
<div class="cw-display"><div class="cw-input" id="cwI"></div><div class="cw-result" id="cwR">0</div></div>
<div class="cw-grid">
<button class="cw-b sci" data-v="sin(">sin</button><button class="cw-b sci" data-v="cos(">cos</button><button class="cw-b sci" data-v="tan(">tan</button><button class="cw-b sci" data-v="sqrt(">&#8730;</button><button class="cw-b sci" data-v="^2">x&#178;</button>
<button class="cw-b sci" data-v="log(">log</button><button class="cw-b sci" data-v="ln(">ln</button><button class="cw-b sci" data-v="pi">&#960;</button><button class="cw-b sci" data-v="e">e</button><button class="cw-b sci" data-v="%">%</button>
<button class="cw-b clr" data-a="clr">C</button><button class="cw-b clr" data-a="ce">&#9003;</button><button class="cw-b" data-v="(">(</button><button class="cw-b" data-v=")">)</button><button class="cw-b op" data-v="&#247;">&#247;</button>
<button class="cw-b num" data-v="7">7</button><button class="cw-b num" data-v="8">8</button><button class="cw-b num" data-v="9">9</button><button class="cw-b op" data-v="&#215;">&#215;</button><button class="cw-b" data-a="sgn">&#177;</button>
<button class="cw-b num" data-v="4">4</button><button class="cw-b num" data-v="5">5</button><button class="cw-b num" data-v="6">6</button><button class="cw-b op" data-v="&#8722;">&#8722;</button><button class="cw-b op" data-v="+">+</button>
<button class="cw-b num" data-v="1">1</button><button class="cw-b num" data-v="2">2</button><button class="cw-b num" data-v="3">3</button><button class="cw-b eq" data-a="calc">=</button>
<button class="cw-b num" data-v="0" style="grid-column:span 2">0</button><button class="cw-b num" data-v=".">.</button>
</div>
<div class="cw-hist" id="cwH"></div>
`;

    overlay.id = 'cw-ov';

    // Button handlers
    popup.addEventListener('click', function(e) {
        const b = e.target.closest('.cw-b');
        if (!b) return;
        if (b.dataset.v) { expr += b.dataset.v; upd(); }
        else if (b.dataset.a === 'clr') { expr = ''; document.getElementById('cwR').textContent = '0'; upd(); }
        else if (b.dataset.a === 'ce') { expr = expr.slice(0, -1); upd(); }
        else if (b.dataset.a === 'sgn') { sgn(); }
        else if (b.dataset.a === 'calc') { calc(); }
    });

    function upd() { document.getElementById('cwI').textContent = expr || ''; }

    function sgn() {
        const m = expr.match(/(.*?)(-?\d+\.?\d*)$/);
        if (m) { expr = m[2].startsWith('-') ? m[1]+m[2].slice(1) : m[1]+'(-'+m[2]+')'; upd(); }
    }

    function prep(e) {
        return e.replace(/\u00d7/g,'*').replace(/\u00f7/g,'/').replace(/\u2212/g,'-')
            .replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(')
            .replace(/sqrt\(/g,'Math.sqrt(').replace(/log\(/g,'Math.log10(').replace(/ln\(/g,'Math.log(')
            .replace(/\^2/g,'**2').replace(/pi/g,'Math.PI')
            .replace(/(?<!Math\.\w*)(?<![\w.])e(?![\w])/g,'Math.E').replace(/%/g,'/100');
    }

    function calc() {
        if (!expr) return;
        try {
            const r = Function('"use strict";return(' + prep(expr) + ')')();
            if (r === undefined || r === null || isNaN(r)) { document.getElementById('cwR').textContent = 'Error'; return; }
            const d = Number.isInteger(r) ? r.toString() : parseFloat(r.toFixed(10)).toString();
            document.getElementById('cwR').textContent = d;
            hist.unshift({ e: expr, r: d }); if (hist.length > 10) hist.pop(); renderH();
            expr = d; upd();
        } catch (e) { document.getElementById('cwR').textContent = 'Error'; }
    }

    function renderH() {
        const h = document.getElementById('cwH');
        if (!hist.length) { h.innerHTML = ''; return; }
        h.innerHTML = hist.map(x => `<div onclick="document.getElementById('cwI').textContent='${x.r}';document.getElementById('cwR').textContent='${x.r}';"><span>${x.e}</span><span class="r">= ${x.r}</span></div>`).join('');
    }

    function openCalc() { overlay.style.display = 'block'; popup.style.display = 'block'; }
    function closeCalc() { overlay.style.display = 'none'; popup.style.display = 'none'; }

    btn.onclick = openCalc;
    overlay.onclick = closeCalc;

    if (!window.location.pathname.includes('calculadora.html')) {
        document.body.appendChild(btn);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }
})();
