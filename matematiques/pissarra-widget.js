// Pissarra màgica - scrollable, persistent, clear icons
(function() {
    let isOpen = false;
    let isDrawing = false;
    let ctx, canvas;
    let color = '#1d1d1f';
    let lineWidth = 3;
    let savedData = null; // persist drawing when closing
    let history = [];
    let historyIdx = -1;
    let showGrid = false;

    // Floating button - pencil icon with label
    const btn = document.createElement('button');
    btn.id = 'pissarra-btn';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>';
    btn.title = 'Pissarra';
    btn.style.cssText = 'position:fixed;bottom:24px;right:86px;width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(59,130,246,0.3);z-index:9000;transition:all .25s;display:flex;align-items:center;justify-content:center;';
    btn.onmouseover = function() { this.style.transform = 'scale(1.1)'; };
    btn.onmouseout = function() { this.style.transform = ''; };

    // Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9500;backdrop-filter:blur(4px);';

    // Popup
    const popup = document.createElement('div');
    popup.style.cssText = 'display:none;position:fixed;top:3%;left:50%;transform:translateX(-50%);width:95%;max-width:900px;height:92vh;background:var(--bg-raised,#fff);border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,0.3);z-index:9600;overflow:hidden;display:none;flex-direction:column;';

    popup.innerHTML = `
        <div id="pissarra-toolbar" style="padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle,#e5e5e5);flex-wrap:wrap;gap:6px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-weight:700;font-size:.85rem;color:var(--text-primary,#1d1d1f);">Pissarra</span>
                <div style="display:flex;gap:3px;align-items:center;" id="p-colors"></div>
                <div style="width:1px;height:20px;background:var(--border-subtle,#ddd);margin:0 4px;"></div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted,#999);"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <input type="range" min="1" max="15" value="3" id="p-width" style="width:50px;accent-color:#3b82f6;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color:var(--text-muted,#999);"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
            </div>
            <div style="display:flex;gap:4px;">
                <button id="p-undo" class="p-tool-btn" title="Desfer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    <span>Desfer</span>
                </button>
                <button id="p-grid" class="p-tool-btn" title="Quadrícula">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                    <span>Quadrícula</span>
                </button>
                <button id="p-clear" class="p-tool-btn" title="Esborrar tot" style="color:#ef4444;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>Esborrar</span>
                </button>
                <button id="p-close" class="p-tool-btn" title="Tancar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span>Tancar</span>
                </button>
            </div>
        </div>
        <div id="p-scroll" style="flex:1;overflow-y:auto;padding:8px;background:var(--bg-overlay,#f0f0f0);">
            <canvas id="p-canvas" style="width:100%;border-radius:12px;cursor:crosshair;background:#fff;display:block;touch-action:none;box-shadow:0 2px 10px rgba(0,0,0,0.1);"></canvas>
        </div>
    `;

    // Inject toolbar button styles
    const style = document.createElement('style');
    style.textContent = `.p-tool-btn{display:flex;align-items:center;gap:4px;padding:5px 10px;border-radius:8px;border:1px solid var(--border-default,#ddd);background:var(--bg-base,#f5f5f5);cursor:pointer;font-size:.72rem;font-weight:500;color:var(--text-secondary,#666);transition:all .2s;font-family:inherit;}.p-tool-btn:hover{background:var(--bg-hover,#e5e5e5);}.p-tool-btn.active{background:#3b82f6;color:#fff;border-color:#3b82f6;}.p-tool-btn span{display:none;}@media(min-width:600px){.p-tool-btn span{display:inline;}}`;
    document.head.appendChild(style);

    const colors = [
        { c: '#1d1d1f', n: 'Negre' },
        { c: '#3b82f6', n: 'Blau' },
        { c: '#ef4444', n: 'Vermell' },
        { c: '#059669', n: 'Verd' },
        { c: '#f97316', n: 'Taronja' },
        { c: '#8b5cf6', n: 'Lila' },
        { c: '#ERASER', n: 'Esborrador' },
    ];

    function init() {
        const cd = popup.querySelector('#p-colors');
        colors.forEach((col, i) => {
            const b = document.createElement('button');
            const isEraser = col.c === '#ERASER';
            b.style.cssText = `width:26px;height:26px;border-radius:50%;border:2px solid ${isEraser ? '#aaa' : col.c};background:${isEraser ? '#fff' : col.c};cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;${i === 0 ? 'box-shadow:0 0 0 2px #3b82f6;transform:scale(1.15);' : ''}`;
            b.title = col.n;
            if (isEraser) b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';
            b.onclick = () => {
                color = isEraser ? '#ffffff' : col.c;
                lineWidth = isEraser ? 25 : parseInt(popup.querySelector('#p-width').value);
                cd.querySelectorAll('button').forEach(x => { x.style.boxShadow = ''; x.style.transform = ''; });
                b.style.boxShadow = '0 0 0 2px #3b82f6';
                b.style.transform = 'scale(1.15)';
            };
            cd.appendChild(b);
        });

        popup.querySelector('#p-width').oninput = function() { if (color !== '#ffffff') lineWidth = parseInt(this.value); };
        popup.querySelector('#p-clear').onclick = () => { if (confirm('Esborrar tota la pissarra?')) clearCanvas(); };
        popup.querySelector('#p-undo').onclick = undo;
        popup.querySelector('#p-close').onclick = closePopup;
        popup.querySelector('#p-grid').onclick = toggleGrid;
    }

    // Canvas height = 3x viewport (scrollable)
    const CANVAS_PAGES = 3;

    function setupCanvas(restore) {
        canvas = popup.querySelector('#p-canvas');
        const container = popup.querySelector('#p-scroll');
        const w = container.clientWidth - 16;
        const h = window.innerHeight * CANVAS_PAGES;
        canvas.width = w * 2;
        canvas.height = h * 2;
        canvas.style.height = h + 'px';
        ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (restore && savedData) {
            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
            };
            img.src = savedData;
        } else if (!restore) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            history = [];
            historyIdx = -1;
            saveState();
        }
        applyGrid();

        canvas.onmousedown = startDraw;
        canvas.onmousemove = draw;
        canvas.onmouseup = endDraw;
        canvas.onmouseleave = endDraw;
        canvas.ontouchstart = e => { e.preventDefault(); startDraw(getTouchPos(e)); };
        canvas.ontouchmove = e => { e.preventDefault(); draw(getTouchPos(e)); };
        canvas.ontouchend = e => { e.preventDefault(); endDraw(); };
    }

    function getTouchPos(e) {
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0];
        return { offsetX: t.clientX - rect.left, offsetY: t.clientY - rect.top };
    }

    function getScale() {
        return { x: (canvas.width / 2) / canvas.offsetWidth, y: (canvas.height / 2) / canvas.offsetHeight };
    }

    function startDraw(e) {
        isDrawing = true;
        const s = getScale();
        ctx.beginPath();
        ctx.moveTo(e.offsetX * s.x, e.offsetY * s.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.globalCompositeOperation = color === '#ffffff' ? 'destination-out' : 'source-over';
    }

    function draw(e) {
        if (!isDrawing) return;
        const s = getScale();
        ctx.lineTo(e.offsetX * s.x, e.offsetY * s.y);
        ctx.stroke();
    }

    function endDraw() {
        if (isDrawing) {
            isDrawing = false;
            ctx.globalCompositeOperation = 'source-over';
            saveState();
        }
    }

    function saveState() {
        historyIdx++;
        history = history.slice(0, historyIdx);
        history.push(canvas.toDataURL());
        if (history.length > 30) { history.shift(); historyIdx--; }
    }

    function undo() {
        if (historyIdx > 0) {
            historyIdx--;
            restoreState(history[historyIdx]);
        }
    }

    function restoreState(dataUrl) {
        const w = canvas.width / 2, h = canvas.height / 2;
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
        };
        img.src = dataUrl;
    }

    function clearCanvas() {
        if (!ctx) return;
        const w = canvas.width / 2, h = canvas.height / 2;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        history = [];
        historyIdx = -1;
        savedData = null;
        saveState();
        applyGrid();
    }

    // Grid via CSS background - doesn't interfere with drawing
    function applyGrid() {
        if (!canvas) return;
        if (showGrid) {
            canvas.style.backgroundImage = 'linear-gradient(rgba(180,200,220,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(180,200,220,0.3) 1px, transparent 1px), linear-gradient(rgba(140,160,180,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(140,160,180,0.4) 1px, transparent 1px)';
            canvas.style.backgroundSize = '25px 25px, 25px 25px, 125px 125px, 125px 125px';
        } else {
            canvas.style.backgroundImage = 'none';
        }
    }

    function toggleGrid() {
        showGrid = !showGrid;
        popup.querySelector('#p-grid').classList.toggle('active', showGrid);
        applyGrid();
    }

    function openPopup() {
        popup.style.display = 'flex';
        overlay.style.display = 'block';
        isOpen = true;
        setTimeout(() => setupCanvas(!!savedData), 50);
    }

    function closePopup() {
        // Save current state before closing
        if (canvas) savedData = canvas.toDataURL();
        popup.style.display = 'none';
        overlay.style.display = 'none';
        isOpen = false;
    }

    btn.onclick = () => { if (isOpen) closePopup(); else openPopup(); };
    overlay.onclick = closePopup;

    // Don't show on calculadora.html
    if (window.location.pathname.includes('calculadora.html')) return;

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    init();
})();
