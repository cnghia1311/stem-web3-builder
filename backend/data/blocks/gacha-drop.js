// ==================== KHỐI 8: GACHA DROP ====================
export default {
    id: "gacha-drop",
    name: "🎰 Máy Gacha NFT",
    desc: "Đập hộp NFT Random từ Thirdweb Drop, tự động rút và bắn pháo hoa",
    color: "#f59e0b",
    label: "Máy Gacha Cực Phẩm",
    preview: () => `
        <div style="text-align:center;padding:10px;">
            <div style="font-size:40px;margin-bottom:10px;">🎁</div>
            <div class="pv-input">Dán mã Contract Gacha (0x...)</div>
            <div class="pv-btn" style="background:#f59e0b;">🎰 MỞ HỘP NGAY</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#f59e0b;text-align:center;">
        <div class="khoi-title" style="color:#fbbf24;text-align:left;">🎰 MÁY GACHA ĐẬP HỘP</div>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"><\/script>
        <input type="text" id="gacha-contract" placeholder="🤖 Yêu cầu người chơi nhập Contract Gacha (0x...)" style="background:#1e293b;color:#fff;border-color:#334155;margin-bottom:15px;width:100%;padding:10px;border-radius:6px;font-size:12px;">
        <div id="gacha-display" style="background:#1e293b;border-radius:10px;padding:20px;margin-bottom:15px;border:2px dashed #475569;position:relative;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div id="gacha-image" style="font-size:80px;animation: pulse 2s infinite;">🎁</div>
            <img id="gacha-result-img" src="" style="display:none;width:100%;max-width:200px;border-radius:10px;box-shadow:0 10px 25px rgba(245,158,11,0.5);margin:10px 0;">
            <div id="gacha-name" style="color:#fbbf24;font-weight:bold;font-size:16px;margin-top:10px;display:none;"></div>
            <div id="gacha-desc" style="color:#94a3b8;font-size:11px;margin-top:5px;display:none;"></div>
        </div>
        <div id="gacha-stats" style="font-size:11px;color:#94a3b8;margin-bottom:10px;">Đợi dán Contract để quét số lượng...</div>
        <button id="gacha-btn" style="background:linear-gradient(45deg, #d97706, #f59e0b);width:100%;padding:15px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(245, 158, 11, 0.4);cursor:pointer;text-transform:uppercase;letter-spacing:1px;">🎰 MỞ HỘP NGAY (0 ETH)</button>
        <style>
            @keyframes pulse { 0% {transform: scale(1);} 50% {transform: scale(1.05);} 100% {transform: scale(1);} }
            .shake-anim { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite; }
            @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        </style>
    </div>`,
    engineCode: (pfx) => `
    async function loadGachaStats() {
        if(!signer) return;
        const ci = document.getElementById('gacha-contract');
        const stats = document.getElementById('gacha-stats');
        if(!ci || ci.value.length !== 42) return;
        try {
            const c = new ethers.Contract(ci.value.trim(), ["function nextTokenIdToClaim() view returns (uint256)"], signer);
            const total = await c.nextTokenIdToClaim();
            stats.innerHTML = '🔥 Đã có <b>' + total.toString() + '</b> hộp được mở trên thế giới!';
        } catch(e) {
            stats.innerText = 'Chưa quét được thông số máy (Lỗi hoặc Contract sai)...';
        }
    }

    async function openGacha() {
        if(!signer){toast('error','Vui lòng Kết nối Ví trước!');return;}
        const ci = document.getElementById('gacha-contract');
        const btn = document.getElementById('gacha-btn');
        const imgIcon = document.getElementById('gacha-image');
        const resImg = document.getElementById('gacha-result-img');
        const resName = document.getElementById('gacha-name');
        const resDesc = document.getElementById('gacha-desc');
        if(!ci || ci.value.length !== 42) { toast('error', 'Vui lòng nhập Địa chỉ Contract Gacha hợp lệ!'); return; }
        try {
            const c = new ethers.Contract(ci.value.trim(), [
                "function claim(address receiver, uint256 quantity, address currency, uint256 pricePerToken, tuple(bytes32[] proof, uint256 maxQuantityInAllowlist, uint256 pricePerToken, address currency) allowlistProof, bytes memory data) payable",
                "function tokenURI(uint256) view returns (string)",
                "event TokensClaimed(uint256 indexed claimConditionIndex, address indexed claimer, address indexed receiver, uint256 startTokenId, uint256 quantityClaimed)"
            ], signer);
            btn.disabled = true; btn.innerText = '⏳ ĐANG RÚT... CẦU NGUYỆN ĐI!!!';
            imgIcon.style.display = 'block'; imgIcon.classList.add('shake-anim');
            resImg.style.display = 'none'; resName.style.display = 'none'; resDesc.style.display = 'none';
            const userAddr = await signer.getAddress();
            const currency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
            const proof = [[], 0, 0, "0x0000000000000000000000000000000000000000"];
            toast('info', 'Xác nhận giao dịch mở hộp trong MetaMask...');
            const tx = await c.claim(userAddr, 1, currency, 0, proof, "0x", { value: 0 });
            btn.innerText = '🔥 ĐANG MỞ NẮP...'; toast('info', 'Đang đợi Blockchain xác nhận...');
            const receipt = await tx.wait();
            let mintedId = null;
            if (receipt.events) { for(const event of receipt.events) { if(event.event === 'TokensClaimed' && event.args) { mintedId = event.args.startTokenId; break; } } }
            if(mintedId === null) { toast('info', 'Nhận diện thủ công TokenID...'); const currentTotal = await c.nextTokenIdToClaim().catch(()=>1); mintedId = currentTotal > 0 ? currentTotal - 1 : 0; }
            const rawUri = await c.tokenURI(mintedId);
            const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            btn.innerText = '📦 ĐANG KIỂM TRA ĐỒ RỚT RA...';
            const res = await fetch(ipfsUri); const metadata = await res.json();
            imgIcon.classList.remove('shake-anim'); imgIcon.style.display = 'none';
            resImg.src = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
            resImg.style.display = 'block';
            resName.innerText = metadata.name || 'Vật phẩm bí ẩn #' + mintedId; resName.style.display = 'block';
            resDesc.innerText = metadata.description || 'Chúc mừng bạn trúng vật phẩm này!'; resDesc.style.display = 'block';
            if(typeof window.confetti === 'function') { window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#fff'] }); }
            toast('success', 'Bạn vừa mở thành công: ' + resName.innerText);
            btn.innerText = '🎰 MỞ TIẾP HỘP NỮA'; btn.disabled = false;
            loadGachaStats();
            if(window.refreshAllBalances) window.refreshAllBalances();
        } catch(e) {
            imgIcon.classList.remove('shake-anim'); btn.disabled = false;
            btn.innerText = '🎰 MỞ HỘP NGAY (0 ETH)'; toast('error', e.reason || e.message || 'Có lỗi xảy ra!');
        }
    }
    `,
    bindings: [
        { btn: "gacha-btn", fn: "openGacha" },
        { btn: "gacha-contract", fn: "loadGachaStats", event: "change" }
    ]
}