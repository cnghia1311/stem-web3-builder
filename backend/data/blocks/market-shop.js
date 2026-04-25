// ==================== KHỐI: CỬA HÀNG MUA SẮM (MARKET SHOP) ====================
// Đã nâng cấp: Dùng MiniMarketplace (Escrow) - Quét listing từ 1 đến totalListings
export default {
    id: "market-shop",
    name: "🛒 Cửa Hàng Mua Sắm",
    desc: "Xem tất cả hàng đang bán trên Marketplace và Mua ngay",
    color: "#06b6d4",
    label: "Cửa Hàng NFT",
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">🛒</div>
            <div class="pv-input">Mã Marketplace (0x...)</div>
            <div class="pv-btn" style="background:#06b6d4;">🔄 MỞ CỬA HÀNG</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#06b6d4;">
        <div class="khoi-title" style="color:#22d3ee;">🛒 CỬA HÀNG MUA SẮM</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Tải danh sách tất cả hàng đang bán trên Marketplace. Bấm "Mua Ngay" là sở hữu!</p>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="mshop-marketplace" placeholder="🏪 Mã Marketplace (0x...)" style="flex:1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;margin-bottom:0;">
            <button id="mshop-load-btn" style="background:#06b6d4;color:white;border:none;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;white-space:nowrap;width:auto;">🔄 TẢI HÀNG</button>
        </div>
        <div id="mshop-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(140px, 1fr));gap:10px;">
            <div style="text-align:center;grid-column:1/-1;color:#64748b;font-size:12px;padding:20px;">Dán Mã Marketplace rồi bấm "Tải Hàng" để xem mặt hàng...</div>
        </div>
    </div>`,
    engineCode: (pfx) => `
    const NATIVE_TOKEN_SHOP = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    const MINI_MP_SHOP_ABI = [
        "function listings(uint256) view returns (uint256 listingId, address seller, address assetContract, uint256 tokenId, address currency, uint256 price, bool isActive)",
        "function getTotalListings() view returns (uint256)",
        "function buyListing(uint256 _listingId) payable"
    ];

    async function loadShop() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mshop-marketplace').value.trim();
        const grid = document.getElementById('mshop-grid');
        const loadBtn = document.getElementById('mshop-load-btn');
        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Marketplace hợp lệ!'); return; }
        try {
            loadBtn.disabled = true; loadBtn.innerText = '⏳ Đang tải...';
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#22d3ee;font-size:12px;">Đang lội vào Blockchain moi hàng...</div>';
            const mp = new ethers.Contract(mpAddr, MINI_MP_SHOP_ABI, signer);
            const total = await mp.getTotalListings();
            const totalNum = total.toNumber();

            if(totalNum === 0) {
                grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#94a3b8;font-size:12px;padding:20px;">Marketplace trống!</div>';
                loadBtn.innerText = '🔄 TẢI HÀNG'; loadBtn.disabled = false; return;
            }

            // Quét từ listing 1 đến totalNum, chỉ lấy những listing đang active
            let activeItems = [];
            for(let i = 1; i <= totalNum; i++) {
                try {
                    const item = await mp.listings(i);
                    if(item.isActive) {
                        activeItems.push({
                            listingId: item.listingId.toString(),
                            seller: item.seller,
                            assetContract: item.assetContract,
                            tokenId: item.tokenId.toString(),
                            currency: item.currency,
                            price: item.price,
                            isActive: item.isActive
                        });
                    }
                } catch(e) {}
            }

            if(activeItems.length === 0) {
                grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#94a3b8;font-size:12px;padding:20px;">Không có đơn hàng nào đang bán.</div>';
                loadBtn.innerText = '🔄 TẢI HÀNG'; loadBtn.disabled = false; return;
            }

            grid.innerHTML = '';
            for(const item of activeItems) {
                const priceStr = ethers.utils.formatEther(item.price);
                const isNative = item.currency.toLowerCase() === NATIVE_TOKEN_SHOP;
                const currLabel = isNative ? 'ETH' : item.currency.slice(0,6) + '...' + item.currency.slice(-4);

                // Lấy metadata NFT (ảnh + tên)
                let imgUrl = ''; let name = 'NFT #' + item.tokenId;
                try {
                    const nft = new ethers.Contract(item.assetContract, ["function tokenURI(uint256) view returns (string)"], signer);
                    const rawUri = await nft.tokenURI(item.tokenId);
                    const ipfsUri = rawUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
                    const res = await fetch(ipfsUri);
                    const metadata = await res.json();
                    imgUrl = metadata.image ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : '';
                    name = metadata.name || name;
                } catch(e) {}

                const card = document.createElement('div');
                card.style.cssText = 'background:#1e293b;border-radius:10px;overflow:hidden;border:1px solid #334155;';
                card.innerHTML = '<div style="height:120px;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">' + (imgUrl ? '<img src="' + imgUrl + '" style="width:100%;height:100%;object-fit:cover;">' : '<span style="font-size:30px;">🖼️</span>') + '<span style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.7);color:#94a3b8;font-size:8px;padding:2px 5px;border-radius:4px;">Thẻ #' + item.tokenId + '</span><span style="position:absolute;top:4px;right:4px;background:rgba(251,191,36,0.9);color:#000;font-size:8px;font-weight:bold;padding:2px 5px;border-radius:4px;">Đơn #' + item.listingId + '</span></div><div style="padding:10px;"><div style="font-size:11px;font-weight:bold;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + name + '</div><div style="font-size:12px;color:#fbbf24;font-weight:bold;margin-top:4px;">' + priceStr + ' ' + currLabel + '</div><div style="font-size:9px;color:#64748b;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + item.seller + '">Người bán: ' + item.seller.substring(0,6) + '...' + item.seller.substring(38) + '</div><button onclick="buyItemMini(\\''+mpAddr+'\\',\\''+item.listingId+'\\',\\''+item.currency+'\\',\\''+item.price.toString()+'\\','+isNative+',this)" style="background:#06b6d4;width:100%;padding:8px;border:none;border-radius:6px;color:white;font-weight:bold;font-size:11px;cursor:pointer;margin-top:8px;">🛒 MUA NGAY</button></div>';
                grid.appendChild(card);
            }
            toast('success', 'Đã tải ' + activeItems.length + ' mặt hàng!');
            loadBtn.innerText = '🔄 TẢI HÀNG'; loadBtn.disabled = false;
        } catch(e) {
            loadBtn.innerText = '🔄 TẢI HÀNG'; loadBtn.disabled = false;
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#ef4444;font-size:12px;padding:20px;">Lỗi: ' + (e.reason || e.message || 'Không rõ') + '</div>';
        }
    }

    async function buyItemMini(mpAddr, listingId, currency, totalPrice, isNative, btn) {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const origText = btn.innerText;
        try {
            btn.disabled = true;
            const mp = new ethers.Contract(mpAddr, MINI_MP_SHOP_ABI, signer);

            if(!isNative) {
                // Thanh toán bằng Token ERC-20 → cần Approve trước
                btn.innerText = '🔑 Approve...'; toast('info', 'Bước 1: Ủy quyền Token cho Marketplace...');
                const token = new ethers.Contract(currency, ["function approve(address spender, uint256 amount)","function allowance(address owner, address spender) view returns (uint256)"], signer);
                const buyer = await signer.getAddress();
                const allowed = await token.allowance(buyer, mpAddr);
                if(allowed.lt(totalPrice)) {
                    const txA = await token.approve(mpAddr, totalPrice);
                    await txA.wait();
                    toast('success', 'Ủy quyền token thành công!');
                }
            }

            btn.innerText = '⏳ Đang mua...'; toast('info', 'Đang gửi giao dịch Mua Hàng...');
            const txBuy = await mp.buyListing(listingId, isNative ? { value: totalPrice } : {});
            await txBuy.wait();

            toast('success', 'MUA THÀNH CÔNG! NFT đã về ví bạn!');
            btn.innerText = '✅ ĐÃ MUA'; btn.style.background = '#10b981';
            setTimeout(() => loadShop(), 2000);
        } catch(e) {
            btn.disabled = false; btn.innerText = origText;
            toast('error', e.reason || e.message || 'Lỗi mua hàng!');
        }
    }
    window.buyItemMini = buyItemMini;
    `,
    bindings: [{ btn: "mshop-load-btn", fn: "loadShop" }]
}
