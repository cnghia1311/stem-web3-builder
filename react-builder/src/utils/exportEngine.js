import { BLOCKS } from '../data/blocks';
import { TEMPLATES } from '../data/templates';

export function generateWeb3Code(tabs, config, contracts) {
    contracts = contracts || {};
    const title = config.title || 'App Của Em';
    const sub = config.sub || '';
    const tk = config.tokenName || 'TOKEN';
    const theme = config.theme || 'dark';
    const layout = config.layout || 'desktop';

    let bg, cardBg, textColor;
    if (theme === 'dark')  { bg = '#0f172a'; cardBg = '#1e293b'; textColor = '#e2e8f0'; }
    if (theme === 'light') { bg = '#f8fafc'; cardBg = '#ffffff'; textColor = '#1e293b'; }
    if (theme === 'neon')  { bg = '#0a0015'; cardBg = '#1a0030'; textColor = '#e0d0ff'; }

    let tabNavHtml = '';
    if (tabs.length > 1) {
        tabNavHtml = `
    <div class="tabs-nav">
${tabs.map((t, i) => `        <button class="tab-btn ${i===0?'active':''}" onclick="window.switchTab('${t.id}')" id="btn-${t.id}">${t.name}</button>`).join('\n')}
    </div>`;
    }

    let allTabsHtml = '';
    let allEngineCode = [];
    let allBindCode = [];
    let refreshBalanceFns = [];

    tabs.forEach((tab, tabIdx) => {
        const tpl = TEMPLATES.find(t => t.id === tab.templateId) || TEMPLATES[0];
        
        // Sinh grid items cho từng slot
        let slotsHtml = '';

        tpl.slots.forEach(slot => {
            const blockId = tab.slots[slot.id];
            const block = blockId ? BLOCKS.find(b => b.id === blockId) : null;

            if (block) {
                // pfx cho instance cụ thể: t0s1 (tab 0, slot 1)
                const pfx = `t${tabIdx}s${slot.id.replace(/[^a-zA-Z0-9]/g, '')}`;
                const slotKey = `${tab.id}-${slot.id}`;
                const contractData = contracts[slotKey] || '';

                // 1. Prefix HTML IDs
                let html = block.multiToken
                    ? block.exportHtml(tk, contractData)
                    : block.exportHtml(tk, contractData);
                html = html.replace(/id="([^"]+)"/g, `id="${pfx}-$1"`);

                slotsHtml += `
            <div class="grid-cell" style="grid-column:span ${slot.span}">
${html}
            </div>`;

                // 2. Wrap Engine Code in IIFE
                let code = block.engineCode();
                // Prefix getElementById
                code = code.replace(/getElementById\('([^']+)'\)/g, `getElementById('${pfx}-$1')`);
                
                let localFuncs = [];
                const funcMatches = code.match(/^\s+(?:async\s+)?function\s+(\w+)/gm);
                if (funcMatches) {
                    localFuncs = funcMatches.map(fn => fn.replace(/^\s+(?:async\s+)?function\s+/, ''));
                }

                code = `
const ${pfx}_funcs = (function() {
${code}
    return { ${localFuncs.join(', ')} };
})();`;
                allEngineCode.push(code);

                if (localFuncs.includes('refreshBalance')) {
                    refreshBalanceFns.push(`${pfx}_funcs.refreshBalance`);
                }

                // 3. Bindings
                block.bindings.forEach(b => {
                    const ev = b.event || 'click';
                    allBindCode.push(`b('${pfx}-${b.btn}', ${pfx}_funcs.${b.fn}, '${ev}');`);
                });
            } else {
                slotsHtml += `
            <div class="grid-cell empty" style="grid-column:span ${slot.span}"></div>`;
            }
        });

        allTabsHtml += `
    <div class="tab-content" id="${tab.id}" style="display:${tabIdx === 0 ? 'block' : 'none'}">
        <div class="grid-layout" style="grid-template-columns:${tpl.gridColumns}">
${slotsHtml}
        </div>
    </div>`;
    });

    // Hàm gọi tất cả refreshBalance nếu có
    let masterRefresh = '';
    if (refreshBalanceFns.length > 0) {
        masterRefresh = `
    window.refreshAllBalances = function(){${refreshBalanceFns.map(n => `${n}();`).join('')}};`;
    }

    // Cập nhật connectWallet để gọi masterRefresh
    let engineCodeStr = allEngineCode.join('\n');
    engineCodeStr = engineCodeStr.replace(/if\(typeof\s+refreshBalance\s*===\s*'function'\)\s*refreshBalance\(\);?/g, 
        `if(typeof window.refreshAllBalances==='function') window.refreshAllBalances();`);

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"><\/script>
    <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Segoe UI',sans-serif;background:${bg};color:${textColor};display:flex;justify-content:center;padding:40px 20px;min-height:100vh;}
        .app{background:${cardBg};padding:${layout==='desktop'?'40px':'30px'};border-radius:${layout==='desktop'?'12px':'20px'};width:100%;max-width:${layout==='desktop'?'900px':'420px'};box-shadow:0 20px 50px rgba(0,0,0,0.3);}
        h1{text-align:center;font-size:24px;margin-bottom:5px;}
        .subtitle{text-align:center;color:#64748b;font-size:14px;margin-bottom:25px;}

        .tabs-nav{display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;padding-bottom:5px}
        .tab-btn{padding:8px 12px;border-radius:8px;border:none;background:#334155;color:#94a3b8;font-size:13px;font-weight:bold;cursor:pointer;flex:1 0 auto;}
        .tab-btn.active{background:#3b82f6;color:white;}

        .grid-layout{display:grid;gap:16px;}
        .grid-cell{min-height:40px;}
        .grid-cell.empty{min-height:0;}

        .khoi{background:${bg};padding:18px;border-radius:12px;border-left:4px solid #38bdf8;}
        .khoi-title{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:10px;}
        button:not(.tab-btn){width:100%;padding:12px;border:none;border-radius:10px;font-size:14px;font-weight:bold;cursor:pointer;color:white;transition:all 0.2s;}
        button:not(.tab-btn):hover{opacity:0.85;transform:translateY(-1px);}
        input:not([type="hidden"]){width:100%;padding:12px;border-radius:10px;border:1px solid #334155;background:${cardBg};color:${textColor};margin-bottom:12px;font-size:14px;}
        input::placeholder{color:#475569;}
        input:focus{outline:none;border-color:#38bdf8;}

        @media (max-width: 600px) {
            .grid-layout { grid-template-columns: 1fr !important; }
            .grid-cell { grid-column: span 1 !important; }
        }
    </style>
</head>
<body>
<div class="app">
    <h1>${title}</h1>
    <p class="subtitle">${sub}</p>
${tabNavHtml}
${allTabsHtml}
</div>
<script>
(function(){
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).style.display = 'block';
        document.getElementById('btn-' + tabId).classList.add('active');
    };

    let provider,signer,userAddr;
    function toast(t,m){let c='#3b82f6';if(t==='success')c='#10b981';if(t==='error')c='#ef4444';const d=document.createElement('div');d.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:'+c+';color:white;padding:12px 24px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:90%;text-align:center;';d.innerText=(t==='success'?'✅ ':t==='error'?'❌ ':'ℹ️ ')+m;document.body.appendChild(d);setTimeout(()=>d.remove(),4000);}

${allGlobalCode.join('\n\n')}

${engineCodeStr}
${masterRefresh}

    function bind(){const b=(id,fn,ev='click')=>{const el=document.getElementById(id);if(el)el.addEventListener(ev,fn);};${allBindCode.join('')}}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
<\/script>
</body>
</html>`;
}
