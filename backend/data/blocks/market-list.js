// ==================== KHỐI: TRẠM KÝ GỬI HÀNG (MARKET LIST) ====================
// Đã nâng cấp: Dùng MiniMarketplace (Escrow) + Rút Tiền Két Sắt (Pull Payment)
export default {
    id: "market-list",
    name: "📦 Trạm Ký Gửi NFT",
    desc: "Gửi NFT vào Marketplace để bán & Rút tiền két sắt",
    color: "#ec4899",
    label: "Ký Gửi Lên Sàn",
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">📦</div>
            <div class="pv-input">Mã Marketplace (0x...)</div>
            <div class="pv-input">Mã NFT + Token ID</div>
            <div class="pv-btn" style="background:#ec4899;">📋 NIÊM YẾT BÁN</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#ec4899;">
        <div class="khoi-title" style="color:#f472b6;">📦 TRẠM KÝ GỬI HÀNG LÊN SÀN</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Gửi NFT vào kho Marketplace để bán. NFT sẽ rời ví bạn và chui vào Marketplace cho đến khi có người mua hoặc bạn rút về.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="mlist-marketplace" placeholder="🏪 Mã Marketplace (0x...)" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-nft" placeholder="🖼️ Mã Hợp Đồng NFT (0x...)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="number" id="mlist-tokenid" placeholder="🆔 Token ID (VD: 0)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-currency" placeholder="💰 Tiền tệ (0xEee...=ETH)" value="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-price" placeholder="💲 Giá bán (VD: 0.001)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>
        <button id="mlist-btn" style="background:linear-gradient(45deg, #db2777, #ec4899);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:12px;">📋 NIÊM YẾT BÁN HÀNG</button>
        <div id="mlist-result" style="display:none;background:#0f172a;border:1px solid #10b981;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:14px;color:#10b981;font-weight:bold;margin-bottom:5px;">🎉 NIÊM YẾT THÀNH CÔNG!</div>
            <div style="font-size:12px;color:#fbbf24;">🎫 Mã Đơn của bạn: <b id="mlist-listing-id">#?</b></div>
            <div style="font-size:10px;color:#94a3b8;margin-top:5px;">NFT đã được gửi vào kho Marketplace. Ghi nhớ mã này để Rút Hàng về nếu cần!</div>
        </div>

        <div style="margin-top:16px;border-top:1px solid #334155;padding-top:12px;">
            <div class="khoi-title" style="color:#fbbf24;font-size:13px;">💰 KÉT SẮT (RÚT TIỀN BÁN HÀNG)</div>
            <p style="font-size:10px;color:#94a3b8;margin-bottom:8px;">Khi có người mua NFT của bạn, tiền sẽ được giữ trong két sắt. Bấm để rút tiền về ví.</p>
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <input type="text" id="mlist-withdraw-currency" placeholder="💰 Tiền tệ (0xEee...=ETH)" value="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" style="flex:1;background:#0f172a;color:#fff;border:1px solid #334155;padding:8px;border-radius:6px;font-size:10px;">
                <button id="mlist-check-balance" style="background:#334155;color:#fbbf24;border:none;padding:8px 12px;border-radius:6px;font-size:10px;cursor:pointer;white-space:nowrap;">🔍 Kiểm tra</button>
            </div>
            <div id="mlist-balance-display" style="font-size:12px;color:#fbbf24;text-align:center;margin-bottom:8px;min-height:18px;"></div>
            <button id="mlist-withdraw-btn" style="background:linear-gradient(45deg, #d97706, #fbbf24);width:100%;padding:12px;border-radius:10px;border:none;color:#0f172a;font-weight:bold;font-size:13px;cursor:pointer;">💰 RÚT TIỀN KÉT SẮT</button>
        </div>
    </div>`,
    engineCode: (pfx) => `
    const MINI_MP_LIST_ABI = [
        "function createListing(address _assetContract, uint256 _tokenId, address _currency, uint256 _price) external returns (uint256)",
        "function withdrawFunds(address _currency) external",
        "function balances(address seller, address currency) view returns (uint256)",
        "event ListingCreated(uint256 indexed listingId, address indexed seller, address assetContract, uint256 tokenId, address currency, uint256 price)"
    ];

    async function listNFT() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mlist-marketplace').value.trim();
        const nftAddr = document.getElementById('mlist-nft').value.trim();
        const tokenId = document.getElementById('mlist-tokenid').value.trim();
        const currency = document.getElementById('mlist-currency').value.trim();
        const price = document.getElementById('mlist-price').value.trim();
        const btn = document.getElementById('mlist-btn');
        const result = document.getElementById('mlist-result');
        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Marketplace hợp lệ!'); return; }
        if(!nftAddr || nftAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng NFT hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!price || isNaN(price)) { toast('error','Nhập Giá Bán hợp lệ!'); return; }
        try {
            btn.disabled = true; result.style.display = 'none';

            // Bước 1: Ủy quyền (Approve) cho Marketplace
            btn.innerText = '🔑 BƯỚC 1: ỦY QUYỀN...'; toast('info', 'Ủy quyền NFT cho Marketplace...');
            const nftContract = new ethers.Contract(nftAddr, ["function approve(address to, uint256 tokenId)","function getApproved(uint256 tokenId) view returns (address)"], signer);
            const approved = await nftContract.getApproved(tokenId);
            if(approved.toLowerCase() !== mpAddr.toLowerCase()) {
                const txApprove = await nftContract.approve(mpAddr, tokenId);
                await txApprove.wait();
                toast('success', 'Ủy quyền thành công!');
            } else {
                toast('info', 'Đã được ủy quyền sẵn, bỏ qua.');
            }

            // Bước 2: Ký gửi NFT vào Marketplace (Escrow)
            btn.innerText = '📦 BƯỚC 2: GỬI VÀO MARKETPLACE...'; toast('info', 'Đang gửi NFT vào kho Marketplace...');
            const mp = new ethers.Contract(mpAddr, MINI_MP_LIST_ABI, signer);
            const priceWei = ethers.utils.parseEther(price);
            const txList = await mp.createListing(nftAddr, tokenId, currency, priceWei);
            toast('info', 'Đang đợi Blockchain xác nhận...');
            const receipt = await txList.wait();

            // Lấy Listing ID từ event
            let listingId = '?';
            for(const log of receipt.logs) {
                try {
                    const parsed = mp.interface.parseLog(log);
                    if(parsed.name === 'ListingCreated') {
                        listingId = parsed.args.listingId.toString();
                        break;
                    }
                } catch(e) {}
            }

            result.style.display = 'block';
            document.getElementById('mlist-listing-id').innerText = '#' + listingId;
            toast('success', 'Niêm yết thành công! NFT đã vào kho Marketplace. Mã Đơn: #' + listingId);
            btn.innerText = '📋 NIÊM YẾT THÊM MÓN KHÁC'; btn.disabled = false;
        } catch(e) {
            btn.innerText = '📋 NIÊM YẾT BÁN HÀNG'; btn.disabled = false;
            const msg = e.reason || e.message || 'Lỗi niêm yết!';
            toast('error', msg.substring(0, 80));
        }
    }

    // Kiểm tra số dư Két Sắt
    document.getElementById('mlist-check-balance').addEventListener('click', async function() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mlist-marketplace').value.trim();
        const currency = document.getElementById('mlist-withdraw-currency').value.trim();
        const display = document.getElementById('mlist-balance-display');
        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Marketplace ở trên trước!'); return; }
        try {
            display.innerHTML = '<span style="color:#94a3b8;">⏳ Đang kiểm tra...</span>';
            const mp = new ethers.Contract(mpAddr, MINI_MP_LIST_ABI, provider);
            const bal = await mp.balances(userAddr, currency);
            const balStr = ethers.utils.formatEther(bal);
            const isNative = currency.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
            const label = isNative ? 'ETH' : 'Token';
            if(bal.gt(0)) {
                display.innerHTML = '💰 Số dư: <strong>' + balStr + ' ' + label + '</strong>';
            } else {
                display.innerHTML = '<span style="color:#64748b;">Két sắt trống (0 ' + label + ')</span>';
            }
        } catch(e) {
            display.innerHTML = '<span style="color:#ef4444;">Lỗi kiểm tra</span>';
        }
    });

    // Rút tiền từ Két Sắt
    document.getElementById('mlist-withdraw-btn').addEventListener('click', async function() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mlist-marketplace').value.trim();
        const currency = document.getElementById('mlist-withdraw-currency').value.trim();
        const btn = this;
        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Marketplace ở trên trước!'); return; }
        try {
            btn.disabled = true; btn.innerText = '⏳ Đang rút...';
            const mp = new ethers.Contract(mpAddr, MINI_MP_LIST_ABI, signer);
            const tx = await mp.withdrawFunds(currency);
            await tx.wait();
            toast('success', '💰 Đã rút tiền về ví thành công!');
            document.getElementById('mlist-balance-display').innerHTML = '<span style="color:#10b981;">✅ Đã rút hết!</span>';
            btn.innerText = '💰 RÚT TIỀN KÉT SẮT'; btn.disabled = false;
        } catch(e) {
            btn.innerText = '💰 RÚT TIỀN KÉT SẮT'; btn.disabled = false;
            const msg = e.reason || e.message || '';
            if(msg.includes('trong rong') || msg.includes('0')) toast('error', 'Két sắt đang trống!');
            else toast('error', msg.substring(0, 60));
        }
    });
    `,
    bindings: [{ btn: "mlist-btn", fn: "listNFT" }]
}
