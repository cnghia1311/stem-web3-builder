// ==================== KHỐI: MÁY TẠO MARKETPLACE (MARKETPLACE FACTORY) ====================
export default {
    id: "market-factory",
    name: "🏪 Máy Tạo Marketplace",
    desc: "Tạo Sàn Giao Dịch NFT (Marketplace) của riêng bạn",
    color: "#06b6d4",
    label: "Máy Tạo Marketplace",
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#06b6d4;">
        <div class="khoi-title" style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:24px;">🏪</span>
            <span style="background:linear-gradient(135deg,#06b6d4,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:16px;letter-spacing:1px;">MÁY TẠO MARKETPLACE</span>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Tên Marketplace của bạn</label>
            <input type="text" id="mf-market-name" placeholder="Ví dụ: Marketplace Tranh Lớp 10A1" maxlength="48" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;margin-bottom:4px;">
            <div style="font-size:10px;color:#64748b;margin-bottom:6px;">🏪 Marketplace này sẽ là nơi mua bán NFT. Bạn sẽ là Chủ Marketplace, có quyền hủy bất kỳ đơn hàng nào.</div>
        </div>

        <button id="mf-create-btn" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#06b6d4,#22d3ee);color:white;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:1px;">🚀 TẠO MARKETPLACE MỚI</button>

        <div id="mf-status" style="margin-top:10px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>

        <div id="mf-result" style="display:none;margin-top:12px;background:#0f2a1a;border:1px solid #10b981;border-radius:12px;padding:15px;">
            <div style="font-size:14px;font-weight:bold;color:#10b981;margin-bottom:8px;">🎉 Marketplace đã được khai trương thành công!</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Tên Marketplace: <span id="mf-result-name" style="color:#e2e8f0;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Địa chỉ Contract Marketplace:</div>
            <div id="mf-result-address" style="background:#1e293b;padding:10px;border-radius:8px;font-size:12px;color:#06b6d4;word-break:break-all;cursor:pointer;text-align:center;" title="Bấm để copy"></div>
            <div style="text-align:center;margin-top:8px;">
                <a id="mf-result-link" href="#" target="_blank" style="color:#06b6d4;font-size:11px;text-decoration:underline;">🔗 Xem trên Etherscan</a>
            </div>
            <div style="margin-top:10px;padding:8px;background:#1e293b;border-radius:8px;font-size:10px;color:#22d3ee;text-align:center;">
                💡 Copy địa chỉ Marketplace ở trên → Dán vào khối <strong>Ký Gửi Hàng</strong>, <strong>Cửa Hàng</strong> hoặc <strong>Hủy Bán</strong> để bắt đầu mua bán NFT!
            </div>
        </div>

        <div id="mf-history" style="margin-top:12px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
                <span>📜 Marketplace đã tạo trước đó:</span>
                <button id="mf-load-history" style="background:none;border:1px solid #334155;color:#94a3b8;padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer;">Tải lịch sử</button>
            </div>
            <div id="mf-history-list" style="font-size:11px;color:#94a3b8;"></div>
        </div>
    </div>`,

    engineCode: () => `
        const MARKET_FACTORY_ADDR = '0x63A1b1B2A2C6364512Da0A1595dD559F97899c55';
        const MARKET_FACTORY_ABI = [
            "function createMarketplace(string memory _name) external returns (address)",
            "event MarketplaceCreated(address indexed marketplaceAddress, string name, address indexed owner)"
        ];
        const MINI_MARKET_ABI = [
            "function marketplaceName() view returns (string)",
            "function getTotalListings() view returns (uint256)",
            "function owner() view returns (address)"
        ];

        const _mfBtn = document.getElementById('mf-create-btn');
        const _mfName = document.getElementById('mf-market-name');
        const _mfStatus = document.getElementById('mf-status');
        const _mfResult = document.getElementById('mf-result');
        const _mfLoadHist = document.getElementById('mf-load-history');

        if (_mfBtn) {
            // Copy address khi click
            document.getElementById('mf-result-address').addEventListener('click', function() {
                navigator.clipboard.writeText(this.innerText).then(function(){
                    toast('success', '📋 Đã copy địa chỉ Marketplace!');
                });
            });

            _mfBtn.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví (🦊) trước!'); return; }
                var marketName = _mfName.value.trim();

                if (!marketName) { toast('error', 'Nhập tên cho Marketplace của bạn!'); return; }

                try {
                    _mfBtn.disabled = true; _mfBtn.style.opacity = '0.5';
                    _mfStatus.innerHTML = '<span style="color:#22d3ee;">⏳ Đang gửi giao dịch tạo Marketplace... (Xác nhận trên MetaMask)</span>';
                    _mfResult.style.display = 'none';

                    var factory = new ethers.Contract(MARKET_FACTORY_ADDR, MARKET_FACTORY_ABI, signer);
                    var tx = await factory.createMarketplace(marketName);
                    _mfStatus.innerHTML = '<span style="color:#22d3ee;">⛏️ Đang đợi Blockchain xác nhận...</span>';

                    var receipt = await tx.wait();

                    // Lấy địa chỉ Marketplace mới từ event MarketplaceCreated
                    var marketAddr = null;
                    for (var i = 0; i < receipt.logs.length; i++) {
                        try {
                            var parsed = factory.interface.parseLog(receipt.logs[i]);
                            if (parsed.name === 'MarketplaceCreated') {
                                marketAddr = parsed.args.marketplaceAddress;
                                break;
                            }
                        } catch(e) {}
                    }

                    if (!marketAddr) {
                        throw new Error('Không tìm thấy địa chỉ Marketplace trong transaction. Kiểm tra lại trên Etherscan.');
                    }

                    // Hiển thị kết quả
                    var scanBase = 'https://sepolia.etherscan.io/address/';
                    document.getElementById('mf-result-name').innerText = marketName;
                    document.getElementById('mf-result-address').innerText = marketAddr;
                    document.getElementById('mf-result-link').href = scanBase + marketAddr;
                    _mfResult.style.display = 'block';

                    _mfStatus.innerHTML = '<span style="color:#10b981;">✅ Hoàn tất! Marketplace <strong>' + marketName + '</strong> đã khai trương!</span>';
                    toast('success', '🎉 Đã tạo thành công Marketplace ' + marketName + '!');

                    // Reset form
                    _mfName.value = '';
                } catch(e) {
                    var msg = e.reason || e.message || 'Lỗi không xác định';
                    if (msg.includes('user rejected')) msg = 'Bạn đã từ chối giao dịch trên MetaMask!';
                    _mfStatus.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0, 80) + '</span>';
                    toast('error', 'Thất bại: ' + msg.substring(0, 50));
                } finally {
                    _mfBtn.disabled = false; _mfBtn.style.opacity = '1';
                }
            });

            // Tải lịch sử Marketplace đã tạo (Quét sự kiện MarketplaceCreated)
            _mfLoadHist.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví trước!'); return; }
                var histList = document.getElementById('mf-history-list');
                histList.innerHTML = '<span style="color:#22d3ee;">⏳ Đang quét Blockchain...</span>';
                try {
                    var factory = new ethers.Contract(MARKET_FACTORY_ADDR, MARKET_FACTORY_ABI, provider);
                    // Lọc sự kiện theo owner (indexed parameter thứ 2)
                    var filter = factory.filters.MarketplaceCreated(null, null, userAddr);
                    var events = await factory.queryFilter(filter, 0, 'latest');

                    if (events.length === 0) {
                        histList.innerHTML = '<span style="color:#64748b;">Bạn chưa tạo Marketplace nào.</span>';
                        return;
                    }
                    var html = '';
                    for (var i = 0; i < events.length; i++) {
                        var ev = events[i];
                        var addr = ev.args.marketplaceAddress;
                        var name = ev.args.name || '???';
                        var totalListings = '?';
                        try {
                            var mp = new ethers.Contract(addr, MINI_MARKET_ABI, provider);
                            var total = await mp.getTotalListings();
                            totalListings = total.toString();
                        } catch(e) {}
                        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#1e293b;border-radius:6px;margin-bottom:4px;">';
                        html += '<div style="display:flex;align-items:center;gap:6px;">';
                        html += '<span style="color:#06b6d4;font-weight:bold;">🏪 ' + name + '</span>';
                        html += '<span style="color:#64748b;font-size:9px;">(' + totalListings + ' đơn)</span>';
                        html += '</div>';
                        html += '<a href="https://sepolia.etherscan.io/address/' + addr + '" target="_blank" style="color:#22d3ee;font-size:10px;word-break:break-all;">' + addr.substring(0,8) + '...' + addr.substring(36) + '</a>';
                        html += '</div>';
                    }
                    histList.innerHTML = html;
                } catch(e) {
                    histList.innerHTML = '<span style="color:#ef4444;">❌ Lỗi: ' + (e.message||'').substring(0,50) + '</span>';
                }
            });
        }
    `,
    bindings: []
}
