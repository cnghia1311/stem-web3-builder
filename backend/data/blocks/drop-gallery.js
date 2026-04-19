// ==================== KHỐI 9: DROP GALLERY (TỦ KÍNH HÀNH TRANG) ====================
export default {
    id: "drop-gallery",
    name: "🖼️ Tủ Kính Hành Trang",
    desc: "Hiển thị toàn bộ thẻ NFT/Bằng khen đang sở hữu",
    color: "#8b5cf6",
    label: "Hành Trang",
    preview: () => `
        <div style="text-align:center;padding:10px;">
            <div style="font-size:30px;margin-bottom:10px;">🎒</div>
            <div class="pv-input">Dán mã Contract (0x...)</div>
            <div class="pv-btn" style="background:#8b5cf6;">🔍 Quét Lại Tủ Đồ</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#8b5cf6;">
        <div class="khoi-title" style="color:#a78bfa;">🎒 TỦ KÍNH HÀNH TRANG</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Tự động load toàn bộ NFT bạn đang sở hữu. Bạn phải dán đúng địa chỉ Contract Gacha/Drop để tải ảnh.</p>
        <input type="text" id="gallery-contract" placeholder="🤖 Nhập Contract NFT (0x...)" style="background:#0f172a;color:#fff;border-color:#334155;margin-bottom:10px;width:100%;padding:10px;border-radius:6px;font-size:12px;">
        <button id="gallery-btn" style="background:linear-gradient(45deg, #7c3aed, #8b5cf6);width:100%;padding:10px;border-radius:8px;border:none;color:white;font-weight:bold;cursor:pointer;margin-bottom:15px;">🔍 TẢI LẠI TỦ ĐỒ</button>
        <div id="gallery-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr));gap:10px;">
            <div style="text-align:center;grid-column:1/-1;color:#64748b;font-size:12px;padding:20px;">Chưa có dữ liệu...</div>
        </div>
    </div>`,
    engineCode: (pfx) => `
    async function loadGallery() {
        if(!signer){return;}
        const ci = document.getElementById('gallery-contract');
        const grid = document.getElementById('gallery-grid');
        const btn = document.getElementById('gallery-btn');
        if(!ci || ci.value.length !== 42) { return; }
        try {
            const userAddr = await signer.getAddress();
            const c = new ethers.Contract(ci.value.trim(), [
                "function tokensOfOwner(address owner) view returns (uint256[])",
                "function tokenURI(uint256) view returns (string)",
                "function balanceOf(address) view returns (uint256)",
                "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
                "function ownerOf(uint256) view returns (address)",
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
            ], signer);
            btn.innerText = '⏳ ĐANG TÌM ĐỒ...'; btn.disabled = true;
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#a78bfa;font-size:12px;">Đang dò tìm trong Blockchain...</div>';
            let tokenIds = [];
            try { const ids = await c.tokensOfOwner(userAddr); tokenIds = ids.map(id => id.toNumber ? id.toNumber() : Number(id)); }
            catch(e) {
                try {
                    toast('info', 'Dò tìm dữ liệu lịch sử Blockchain...');
                    const filter = c.filters.Transfer(null, userAddr);
                    const events = await c.queryFilter(filter, -100000, "latest");
                    if (events.length === 0) { try { const allEvents = await c.queryFilter(filter, 0, "latest"); events.push(...allEvents); } catch(rpcErr) {} }
                    const possibleIds = [...new Set(events.map(e => e.args[2] ? e.args[2].toString() : e.args.tokenId.toString()))];
                    for(let pid of possibleIds) { try { const realOwner = await c.ownerOf(pid); if(realOwner.toLowerCase() === userAddr.toLowerCase()) { tokenIds.push(Number(pid)); } } catch(e3) {} }
                    if(tokenIds.length === 0 && events.length === 0) {
                        toast('info', 'Chuyển sang chế độ tải mù (quét thử ID 0-50)...');
                        for(let i=0; i<=50; i++) { try { const ro = await c.ownerOf(i); if(ro.toLowerCase() === userAddr.toLowerCase()) { tokenIds.push(i); } } catch(e4) {} }
                    }
                } catch(e2) { throw new Error("Contract này không hỗ trợ duyệt danh sách."); }
            }
            if(tokenIds.length === 0) { grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#94a3b8;font-size:12px;padding:20px;">Trống rỗng! Bạn chưa sở hữu thẻ nào cả.</div>'; btn.innerText = '🔍 TẢI LẠI TỦ ĐỒ'; btn.disabled = false; return; }
            grid.innerHTML = '';
            for(let i=0; i<tokenIds.length; i++) {
                const id = tokenIds[i];
                try {
                    const rawUri = await c.tokenURI(id);
                    const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    const res = await fetch(ipfsUri); const metadata = await res.json();
                    const imgUrl = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
                    const card = document.createElement('div');
                    card.style.background = '#1e293b'; card.style.borderRadius = '8px'; card.style.overflow = 'hidden'; card.style.border = '1px solid #334155';
                    card.innerHTML = \`<div style="height:100px;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden;">\${imgUrl ? \`<img src="\${imgUrl}" style="width:100%;height:100%;object-fit:cover;">\` : '<span style="font-size:20px;">🖼️</span>'}</div><div style="padding:8px;"><div style="font-size:10px;font-weight:bold;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${metadata.name || 'ID: '+id}</div><div style="font-size:8px;color:#94a3b8;margin-top:2px;">#\${id}</div></div>\`;
                    grid.appendChild(card);
                } catch(err) { console.log("Lỗi load thẻ", id, err); }
            }
            toast('success', 'Đã tải xong ' + tokenIds.length + ' vật phẩm!');
            btn.innerText = '🔍 TẢI LẠI TỦ ĐỒ'; btn.disabled = false;
        } catch(e) { btn.innerText = '🔍 TẢI LẠI TỦ ĐỒ'; btn.disabled = false; grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#ef4444;font-size:12px;padding:20px;">Lỗi: ' + (e.reason || e.message) + '</div>'; }
    }
    function refreshBalance() { const btn = document.getElementById('gallery-btn'); if(!btn.disabled) loadGallery(); }
    `,
    bindings: [
        { btn: "gallery-btn", fn: "loadGallery" },
        { btn: "gallery-contract", fn: "loadGallery", event: "change" }
    ]
}