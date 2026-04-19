// ==================== KHỐI 13: DROP AIRDROP (THẦY GIÁO CẤP BẰNG) ====================
export default {
    id: "drop-airdrop",
    name: "🏅 Thầy Giáo Cấp Bằng",
    desc: "Airdrop Bằng Khen (ERC1155) hàng loạt cho danh sách ví",
    color: "#eab308",
    label: "Phát Bằng Khen Soulbound",
    config: [
        { key: "contractAddr", label: "🏛️ Địa chỉ Hợp đồng Bằng Khen (Edition Drop)", type: "text" },
        { key: "tokenId", label: "🆔 Token ID của Bằng Khen (VD: 0)", type: "text" },
        { key: "wallets", label: "📋 Danh sách Ví Học Sinh (Mỗi dòng 1 ví)", type: "textarea" }
    ],
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">🏅</div>
            <div class="pv-input">Mã Bằng Khen (0x...)</div>
            <div class="pv-btn" style="background:#eab308;">🏅 ĐÓNG MỘC PHÁT BẰNG</div>
        </div>`,
    exportHtml: (tk, cfg) => {
        const addr = (cfg && cfg.contractAddr) || '';
        const tid = (cfg && cfg.tokenId) || '0';
        const wallets = (cfg && cfg.wallets) || '';
        return `
    <div class="khoi" style="border-left-color:#eab308;">
        <div class="khoi-title" style="color:#facc15;">🏅 THẦY GIÁO CẤP BẰNG (AIRDROP SOULBOUND)</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Phát Bằng Khen (ERC1155 Edition Drop) hàng loạt cho học sinh. Chỉ Admin (chủ Contract) mới được phép phát!</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="airdrop-contract" placeholder="🏛️ Mã Hợp Đồng Bằng Khen (0x...)" value="${addr}" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="airdrop-tokenid" placeholder="🆔 Token ID (VD: 0)" value="${tid}" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="number" id="airdrop-amount" placeholder="📦 Số lượng/ví (VD: 1)" value="1" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>
        <label style="font-size:10px;color:#94a3b8;font-weight:bold;">📋 DANH SÁCH VÍ HỌC SINH (mỗi dòng 1 ví):</label>
        <textarea id="airdrop-wallets" rows="6" placeholder="0xAbc123...&#10;0xDef456..." style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;font-family:monospace;resize:vertical;margin-bottom:12px;">${wallets}</textarea>
        <button id="airdrop-btn" style="background:linear-gradient(45deg, #ca8a04, #eab308);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:10px;">🏅 ĐÓNG MỘC PHÁT BẰNG CHO CẢ LỚP</button>
        <div id="airdrop-log" style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;max-height:200px;overflow-y:auto;font-size:10px;font-family:monospace;color:#94a3b8;display:none;"></div>
    </div>`;
    },
    engineCode: (pfx) => `
    async function doAirdrop() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const contractAddr = document.getElementById('airdrop-contract').value.trim();
        const tokenId = document.getElementById('airdrop-tokenid').value.trim();
        const amountPer = document.getElementById('airdrop-amount').value.trim() || '1';
        const walletsText = document.getElementById('airdrop-wallets').value.trim();
        const btn = document.getElementById('airdrop-btn');
        const log = document.getElementById('airdrop-log');
        if(!contractAddr || contractAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!walletsText) { toast('error','Dán danh sách Ví học sinh vào!'); return; }
        const wallets = walletsText.split(/[\\n,]+/).map(w => w.trim()).filter(w => w.length === 42 && w.startsWith('0x'));
        if(wallets.length === 0) { toast('error','Không tìm thấy ví hợp lệ nào!'); return; }
        log.style.display = 'block';
        log.innerHTML = '🚀 Chuẩn bị phát bằng cho ' + wallets.length + ' học sinh...\\n';
        try {
            btn.disabled = true; btn.innerText = '⏳ ĐANG GOM LỆNH...';
            const claimIface = new ethers.utils.Interface(["function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data)"]);
            const multicallContract = new ethers.Contract(contractAddr, ["function multicall(bytes[] data) returns (bytes[] results)","function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data) payable"], signer);
            const proof = [[], 0, 0, '0x0000000000000000000000000000000000000000'];
            const nativeCurrency = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
            const calls = [];
            for(const w of wallets) { const shortW = w.substring(0,6) + '...' + w.slice(-4); log.innerHTML += '\\n📋 Gom lệnh cho ' + shortW; const encoded = claimIface.encodeFunctionData('claim', [w, tokenId, amountPer, nativeCurrency, 0, proof, '0x']); calls.push(encoded); }
            log.innerHTML += '\\n\\n🔫 Bắn 1 phát ' + calls.length + ' viên đạn... Ký MetaMask!';
            log.scrollTop = log.scrollHeight; btn.innerText = '⏳ KÝ METAMASK...';
            try {
                const tx = await multicallContract.multicall(calls);
                log.innerHTML += '\\n⏳ Đang xử lý trên Blockchain...'; log.scrollTop = log.scrollHeight; await tx.wait();
                log.innerHTML += '\\n\\n🏁 HOÀN TẤT! ✅ ' + wallets.length + '/' + wallets.length + ' bằng khen đã phát xong!';
                log.innerHTML += '\\n🧾 TX: ' + tx.hash;
                toast('success', 'Phát bằng hàng loạt thành công! ' + wallets.length + ' học sinh!');
            } catch(eMulti) {
                log.innerHTML += '\\n⚠️ Multicall lỗi, chuyển sang phát từng em...'; log.scrollTop = log.scrollHeight;
                let success = 0, failed = 0;
                for(let i = 0; i < wallets.length; i++) {
                    const w = wallets[i]; const shortW = w.substring(0,6) + '...' + w.slice(-4);
                    log.innerHTML += '\\n📤 [' + (i+1) + '/' + wallets.length + '] ' + shortW + '...';
                    try { const tx = await multicallContract.claim(w, tokenId, amountPer, nativeCurrency, 0, proof, '0x'); await tx.wait(); log.innerHTML += ' ✅'; success++; }
                    catch(e2) { log.innerHTML += ' ❌ ' + (e2.reason || 'Lỗi'); failed++; }
                    log.scrollTop = log.scrollHeight;
                }
                log.innerHTML += '\\n\\n🏁 HOÀN TẤT! ✅ ' + success + ', ❌ ' + failed;
                toast(failed === 0 ? 'success' : 'error', success + '/' + wallets.length + ' thành công!');
            }
            btn.innerText = '🏅 PHÁT BẰNG TIẾP'; btn.disabled = false;
        } catch(e) { log.innerHTML += '\\n❌ LỖI: ' + (e.reason || e.message); btn.innerText = '🏅 ĐÓNG MỘC PHÁT BẰNG CHO CẢ LỚP'; btn.disabled = false; toast('error', e.reason || e.message || 'Lỗi phát bằng!'); }
    }
    `,
    bindings: [{ btn: "airdrop-btn", fn: "doAirdrop" }]
}