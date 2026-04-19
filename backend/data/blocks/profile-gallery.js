// ==================== KHỐI 14: PROFILE GALLERY (BẢNG VINH DANH) ====================
export default {
    id: "profile-gallery",
    name: "🏆 Bảng Vinh Danh Lớp",
    desc: "Kiểm tra ai đã nhận Bằng Khen (ERC1155 balanceOf)",
    color: "#a855f7",
    label: "Bảng Phong Thần",
    config: [
        { key: "contractAddr", label: "🏛️ Địa chỉ Hợp đồng Bằng Khen", type: "text" },
        { key: "tokenId", label: "🆔 Token ID cần kiểm tra", type: "text" },
        { key: "wallets", label: "📋 Danh sách Ví Lớp (Mỗi dòng 1 ví)", type: "textarea" }
    ],
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">🏆</div>
            <div class="pv-input">Mã Bằng Khen</div>
            <div class="pv-btn" style="background:#a855f7;">🔍 KIỂM TRA</div>
            <div style="display:flex;gap:4px;margin-top:4px;">
                <div style="flex:1;padding:4px;background:#10b981;border-radius:4px;font-size:7px;color:white;">🎓 0xA...</div>
                <div style="flex:1;padding:4px;background:#64748b;border-radius:4px;font-size:7px;color:white;">❌ 0xB...</div>
            </div>
        </div>`,
    exportHtml: (tk, cfg) => {
        const addr = (cfg && cfg.contractAddr) || '';
        const tid = (cfg && cfg.tokenId) || '0';
        const wallets = (cfg && cfg.wallets) || '';
        return `
    <div class="khoi" style="border-left-color:#a855f7;">
        <div class="khoi-title" style="color:#c084fc;">🏆 BẢNG VINH DANH LỚP HỌC</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Kiểm tra Blockchain xem ai trong lớp đã sở hữu Bằng Khen (Soulbound Token) này chưa.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="honor-contract" placeholder="🏛️ Mã Hợp Đồng Bằng Khen (0x...)" value="${addr}" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="honor-tokenid" placeholder="🆔 Token ID (VD: 0)" value="${tid}" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>
        <label style="font-size:10px;color:#94a3b8;font-weight:bold;">📋 DANH SÁCH VÍ CẦN KIỂM TRA:</label>
        <textarea id="honor-wallets" rows="5" placeholder="0xAbc123...&#10;0xDef456..." style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;font-family:monospace;resize:vertical;margin-bottom:12px;">${wallets}</textarea>
        <button id="honor-btn" style="background:linear-gradient(45deg, #7c3aed, #a855f7);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:12px;">🔍 KIỂM TRA BẢN PHONG THẦN</button>
        <div id="honor-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:8px;">
            <div style="text-align:center;grid-column:1/-1;color:#64748b;font-size:12px;padding:15px;">Dán danh sách ví rồi bấm "Kiểm Tra" để xem ai đã có Bằng...</div>
        </div>
    </div>`;
    },
    engineCode: (pfx) => `
    async function checkHonorRoll() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const contractAddr = document.getElementById('honor-contract').value.trim();
        const tokenId = document.getElementById('honor-tokenid').value.trim();
        const walletsText = document.getElementById('honor-wallets').value.trim();
        const btn = document.getElementById('honor-btn');
        const grid = document.getElementById('honor-grid');
        if(!contractAddr || contractAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!walletsText) { toast('error','Dán danh sách Ví cần kiểm tra!'); return; }
        const wallets = walletsText.split(/[\\n,]+/).map(w => w.trim()).filter(w => w.length === 42 && w.startsWith('0x'));
        if(wallets.length === 0) { toast('error','Không tìm thấy ví hợp lệ nào!'); return; }
        try {
            btn.disabled = true; btn.innerText = '⏳ ĐANG QUÉT BLOCKCHAIN...';
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#c084fc;font-size:12px;">Đang kiểm tra ' + wallets.length + ' địa chỉ...</div>';
            const contract = new ethers.Contract(contractAddr, ["function balanceOf(address account, uint256 id) view returns (uint256)","function uri(uint256) view returns (string)"], signer);
            let certImg = ''; let certName = 'Bằng Khen #' + tokenId;
            try { const rawUri = await contract.uri(tokenId); const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/').replace('{id}', tokenId); const res = await fetch(ipfsUri); const metadata = await res.json(); certImg = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : ''; certName = metadata.name || certName; } catch(e) {}
            grid.innerHTML = ''; let holders = 0;
            for(const w of wallets) {
                const shortW = w.substring(0,6) + '...' + w.slice(-4);
                let hasToken = false;
                try { const bal = await contract.balanceOf(w, tokenId); hasToken = bal.gt(0); }
                catch(e) { try { const c721 = new ethers.Contract(contractAddr, ["function balanceOf(address) view returns (uint256)"], signer); const bal721 = await c721.balanceOf(w); hasToken = bal721.gt(0); } catch(e2) {} }
                if(hasToken) holders++;
                const card = document.createElement('div');
                card.style.cssText = hasToken ? 'background:linear-gradient(135deg, #065f46, #047857);border:2px solid #10b981;border-radius:10px;padding:10px;text-align:center;' : 'background:#1e293b;border:1px solid #334155;border-radius:10px;padding:10px;text-align:center;opacity:0.6;';
                const imgHtml = (hasToken && certImg) ? \`<img src="\${certImg}" style="width:100%;max-height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px;border:1px solid #34d399;" alt="\${certName}">\` : \`<div style="font-size:24px;margin-bottom:4px;">\${hasToken ? '🎓' : '❌'}</div>\`;
                card.innerHTML = \`\${imgHtml}<div style="font-size:10px;font-weight:bold;color:\${hasToken ? '#34d399' : '#94a3b8'};">\${hasToken ? 'ĐÃ TỐT NGHIỆP' : 'CHƯA CÓ'}</div><div style="font-size:9px;color:#64748b;margin-top:4px;font-family:monospace;">\${shortW}</div>\`;
                grid.appendChild(card);
            }
            toast('success', 'Kiểm tra xong! ' + holders + '/' + wallets.length + ' đã sở hữu Bằng Khen!');
            btn.innerText = '🔍 KIỂM TRA LẠI'; btn.disabled = false;
        } catch(e) { btn.innerText = '🔍 KIỂM TRA BẢN PHONG THẦN'; btn.disabled = false; grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#ef4444;font-size:12px;padding:20px;">Lỗi: ' + (e.reason || e.message) + '</div>'; }
    }
    `,
    bindings: [{ btn: "honor-btn", fn: "checkHonorRoll" }]
}