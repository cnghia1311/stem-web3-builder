// ==================== KHỐI 10: MARKET LIST (KÝ GỬI HÀNG) ====================
export default {
    id: "market-list",
    name: "📦 Trạm Ký Gửi NFT",
    desc: "Niêm yết (List) NFT lên Marketplace Thirdweb để bán",
    color: "#ec4899",
    label: "Ký Gửi Lên Sàn",
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">📦</div>
            <div class="pv-input">Mã Chợ (0x...)</div>
            <div class="pv-input">Mã NFT + Token ID</div>
            <div class="pv-btn" style="background:#ec4899;">📋 NIÊM YẾT BÁN</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#ec4899;">
        <div class="khoi-title" style="color:#f472b6;">📦 TRẠM KÝ GỬI HÀNG LÊN SÀN</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Đăng bán NFT của bạn lên Chợ. Hệ thống sẽ tự động Ủy quyền (Approve) rồi Niêm yết (Create Listing).</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="mlist-marketplace" placeholder="🏪 Mã Chợ Marketplace (0x...)" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-nft" placeholder="🖼️ Mã Hợp Đồng NFT (0x...)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="number" id="mlist-tokenid" placeholder="🆔 Token ID (VD: 0)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-currency" placeholder="💰 Tiền tệ (0xEee...=ETH)" value="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-price" placeholder="💲 Giá bán (VD: 0.01)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>
        <button id="mlist-btn" style="background:linear-gradient(45deg, #db2777, #ec4899);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:12px;">📋 NIÊM YẾT BÁN HÀNG</button>
        <div id="mlist-result" style="display:none;background:#0f172a;border:1px solid #10b981;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:14px;color:#10b981;font-weight:bold;margin-bottom:5px;">🎉 NIÊM YẾT THÀNH CÔNG!</div>
            <div style="font-size:12px;color:#fbbf24;">🎫 Mã Đơn của bạn: <b id="mlist-listing-id">#?</b></div>
            <div style="font-size:10px;color:#94a3b8;margin-top:5px;">(Ghi nhớ mã này để Rút Hàng về nếu cần!)</div>
        </div>
    </div>`,
    engineCode: (pfx) => `
    async function listNFT() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mlist-marketplace').value.trim();
        const nftAddr = document.getElementById('mlist-nft').value.trim();
        const tokenId = document.getElementById('mlist-tokenid').value.trim();
        const currency = document.getElementById('mlist-currency').value.trim();
        const price = document.getElementById('mlist-price').value.trim();
        const btn = document.getElementById('mlist-btn');
        const result = document.getElementById('mlist-result');
        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Chợ Marketplace hợp lệ!'); return; }
        if(!nftAddr || nftAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng NFT hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!price || isNaN(price)) { toast('error','Nhập Giá Bán hợp lệ!'); return; }
        try {
            btn.disabled = true; result.style.display = 'none';
            btn.innerText = '🔑 BƯỚC 1: ỦY QUYỀN (APPROVE)...'; toast('info', 'Ủy quyền NFT cho Chợ...');
            const nftContract = new ethers.Contract(nftAddr, ["function approve(address to, uint256 tokenId)","function getApproved(uint256 tokenId) view returns (address)"], signer);
            const approved = await nftContract.getApproved(tokenId);
            if(approved.toLowerCase() !== mpAddr.toLowerCase()) { const txApprove = await nftContract.approve(mpAddr, tokenId); await txApprove.wait(); toast('success', 'Ủy quyền thành công!'); }
            else { toast('info', 'Đã được ủy quyền sẵn, bỏ qua bước này.'); }
            btn.innerText = '📋 BƯỚC 2: ĐĂNG BÁN...'; toast('info', 'Đang tạo đơn niêm yết...');
            const mp = new ethers.Contract(mpAddr, [
                "function createListing(tuple(address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) params) returns (uint256 listingId)",
                "event NewListing(address indexed listingCreator, uint256 indexed listingId, address indexed assetContract, tuple(uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)"
            ], signer);
            const now = Math.floor(Date.now() / 1000); const oneYear = now + 365 * 24 * 60 * 60;
            const listing = { assetContract: nftAddr, tokenId: tokenId, quantity: 1, currency: currency, pricePerToken: ethers.utils.parseEther(price), startTimestamp: now, endTimestamp: oneYear, reserved: false };
            const txList = await mp.createListing(listing); toast('info', 'Đang đợi Blockchain xác nhận...'); const receipt = await txList.wait();
            let listingId = '?';
            if(receipt.events) { for(const ev of receipt.events) { if(ev.event === 'NewListing' && ev.args) { listingId = ev.args.listingId.toString(); break; } } }
            if(listingId === '?') { try { const iface = new ethers.utils.Interface(["event NewListing(address indexed listingCreator, uint256 indexed listingId, address indexed assetContract, tuple(uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)"]); for(const log of receipt.logs) { try { const parsed = iface.parseLog(log); listingId = parsed.args.listingId.toString(); break; } catch(e){} } } catch(e){} }
            result.style.display = 'block'; document.getElementById('mlist-listing-id').innerText = '#' + listingId;
            toast('success', 'Niêm yết thành công! Mã Đơn: #' + listingId);
            btn.innerText = '📋 NIÊM YẾT THÊM MÓN KHÁC'; btn.disabled = false;
        } catch(e) { btn.innerText = '📋 NIÊM YẾT BÁN HÀNG'; btn.disabled = false; toast('error', e.reason || e.message || 'Lỗi niêm yết!'); }
    }
    `,
    bindings: [{ btn: "mlist-btn", fn: "listNFT" }]
}