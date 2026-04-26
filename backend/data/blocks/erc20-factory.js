import { FACTORY_ADDRESSES } from '../contracts/contractFactorys.js';

export default {
    id: "erc20-factory",
    name: "🏭 Máy In Coin",
    desc: "Tạo đồng Coin (ERC-20) của riêng bạn",
    color: "#f59e0b",
    label: "Máy In Coin",
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#f59e0b;">
        <div class="khoi-title" style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:24px;">🏭</span>
            <span style="background:linear-gradient(135deg,#f59e0b,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:16px;letter-spacing:1px;">MÁY IN COIN</span>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Tên Coin</label>
            <input type="text" id="tf-coin-name" placeholder="Ví dụ: Lớp 12A1 Coin" maxlength="32" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Ký Hiệu (Symbol)</label>
            <input type="text" id="tf-coin-symbol" placeholder="Ví dụ: HSC (3-5 chữ cái)" maxlength="8" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;text-transform:uppercase;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Số Lượng Phát Hành</label>
            <input type="number" id="tf-coin-supply" placeholder="Ví dụ: 1000000" min="1" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;margin-bottom:4px;">
            <div style="font-size:10px;color:#64748b;margin-bottom:6px;">⚡ Toàn bộ Coin sẽ được gửi thẳng vào ví của bạn</div>
        </div>

        <button id="tf-create-btn" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#f59e0b,#f97316);color:white;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:1px;">🚀 TẠO COIN</button>

        <div id="tf-status" style="margin-top:10px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>

        <div id="tf-result" style="display:none;margin-top:12px;background:#0f2a1a;border:1px solid #10b981;border-radius:12px;padding:15px;">
            <div style="font-size:14px;font-weight:bold;color:#10b981;margin-bottom:8px;">🎉 Coin đã được tạo thành công!</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Tên: <span id="tf-result-name" style="color:#e2e8f0;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Ký hiệu: <span id="tf-result-symbol" style="color:#f59e0b;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Số lượng: <span id="tf-result-supply" style="color:#e2e8f0;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Địa chỉ Contract:</div>
            <div id="tf-result-address" style="background:#1e293b;padding:10px;border-radius:8px;font-size:12px;color:#06b6d4;word-break:break-all;cursor:pointer;text-align:center;" title="Bấm để copy"></div>
            <div style="text-align:center;margin-top:8px;">
                <a id="tf-result-link" href="#" target="_blank" style="color:#06b6d4;font-size:11px;text-decoration:underline;">🔗 Xem trên Etherscan</a>
            </div>
            <div style="margin-top:10px;padding:8px;background:#1e293b;border-radius:8px;font-size:10px;color:#f59e0b;text-align:center;">
                💡 Copy địa chỉ Contract ở trên → Dán vào khối <strong>Số Dư</strong> hoặc <strong>Chuyển Tiền</strong> để sử dụng Coin!
            </div>
        </div>

        <div id="tf-history" style="margin-top:12px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
                <span>📜 Coin đã tạo trước đó:</span>
                <button id="tf-load-history" style="background:none;border:1px solid #334155;color:#94a3b8;padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer;">Tải lịch sử</button>
            </div>
            <div id="tf-history-list" style="font-size:11px;color:#94a3b8;"></div>
        </div>
    </div>`,

    engineCode: () => `
        const FACTORY_ADDR = '${FACTORY_ADDRESSES.ERC20_FACTORY}';
        const FACTORY_ABI = [
            "function createToken(string name, string symbol, uint256 initialSupply) public returns (address)",
            "function getUserTokens(address user) public view returns (address[] memory)",
            "function getTotalTokens() public view returns (uint256)",
            "event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol, uint256 supply)"
        ];
        const ERC20_MINI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)"
        ];

        const _tfBtn = document.getElementById('tf-create-btn');
        const _tfName = document.getElementById('tf-coin-name');
        const _tfSymbol = document.getElementById('tf-coin-symbol');
        const _tfSupply = document.getElementById('tf-coin-supply');
        const _tfStatus = document.getElementById('tf-status');
        const _tfResult = document.getElementById('tf-result');
        const _tfLoadHist = document.getElementById('tf-load-history');

        if (_tfBtn) {
            // Auto uppercase symbol
            _tfSymbol.addEventListener('input', function() {
                this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            });

            // Copy address khi click
            document.getElementById('tf-result-address').addEventListener('click', function() {
                navigator.clipboard.writeText(this.innerText).then(function(){
                    toast('success', '📋 Đã copy địa chỉ Contract!');
                });
            });

            _tfBtn.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví (🦊) trước!'); return; }
                var coinName = _tfName.value.trim();
                var coinSymbol = _tfSymbol.value.trim();
                var coinSupply = _tfSupply.value.trim();

                if (!coinName) { toast('error', 'Nhập tên Coin!'); return; }
                if (!coinSymbol || coinSymbol.length < 2) { toast('error', 'Nhập ký hiệu (ít nhất 2 ký tự)!'); return; }
                if (!coinSupply || parseInt(coinSupply) <= 0) { toast('error', 'Số lượng phải lớn hơn 0!'); return; }

                try {
                    _tfBtn.disabled = true; _tfBtn.style.opacity = '0.5';
                    _tfStatus.innerHTML = '<span style="color:#f59e0b;">⏳ Đang gửi giao dịch tạo Coin... (Xác nhận trên MetaMask)</span>';
                    _tfResult.style.display = 'none';

                    var factory = new ethers.Contract(FACTORY_ADDR, FACTORY_ABI, signer);
                    var tx = await factory.createToken(coinName, coinSymbol, parseInt(coinSupply));
                    _tfStatus.innerHTML = '<span style="color:#f59e0b;">⛏️ Đang đợi Blockchain xác nhận...</span>';

                    var receipt = await tx.wait();

                    // Lấy địa chỉ token mới từ event
                    var tokenAddr = null;
                    for (var i = 0; i < receipt.logs.length; i++) {
                        try {
                            var parsed = factory.interface.parseLog(receipt.logs[i]);
                            if (parsed.name === 'TokenCreated') {
                                tokenAddr = parsed.args.tokenAddress;
                                break;
                            }
                        } catch(e) {}
                    }

                    if (!tokenAddr) {
                        // Fallback: lấy từ danh sách token của user
                        var tokens = await factory.getUserTokens(userAddr);
                        tokenAddr = tokens[tokens.length - 1];
                    }

                    // Hiển thị kết quả
                    var scanBase = 'https://sepolia.etherscan.io/address/';
                    document.getElementById('tf-result-name').innerText = coinName;
                    document.getElementById('tf-result-symbol').innerText = coinSymbol;
                    document.getElementById('tf-result-supply').innerText = parseInt(coinSupply).toLocaleString();
                    document.getElementById('tf-result-address').innerText = tokenAddr;
                    document.getElementById('tf-result-link').href = scanBase + tokenAddr;
                    _tfResult.style.display = 'block';

                    _tfStatus.innerHTML = '<span style="color:#10b981;">✅ Hoàn tất! Coin <strong>' + coinSymbol + '</strong> đã sẵn sàng!</span>';
                    toast('success', '🎉 Đã tạo thành công ' + parseInt(coinSupply).toLocaleString() + ' ' + coinSymbol + '!');

                    // Reset form
                    _tfName.value = ''; _tfSymbol.value = ''; _tfSupply.value = '';
                } catch(e) {
                    var msg = e.reason || e.message || 'Lỗi không xác định';
                    _tfStatus.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0, 80) + '</span>';
                    toast('error', 'Thất bại: ' + msg.substring(0, 50));
                } finally {
                    _tfBtn.disabled = false; _tfBtn.style.opacity = '1';
                }
            });

            // Tải lịch sử token đã tạo
            _tfLoadHist.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví trước!'); return; }
                var histList = document.getElementById('tf-history-list');
                histList.innerHTML = '<span style="color:#f59e0b;">⏳ Đang tải...</span>';
                try {
                    var factory = new ethers.Contract(FACTORY_ADDR, FACTORY_ABI, signer);
                    var tokens = await factory.getUserTokens(userAddr);
                    if (tokens.length === 0) {
                        histList.innerHTML = '<span style="color:#64748b;">Bạn chưa tạo Coin nào.</span>';
                        return;
                    }
                    var html = '';
                    for (var i = 0; i < tokens.length; i++) {
                        var addr = tokens[i];
                        var sym = '???';
                        try {
                            var c = new ethers.Contract(addr, ERC20_MINI, signer);
                            sym = await c.symbol();
                        } catch(e) {}
                        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#1e293b;border-radius:6px;margin-bottom:4px;">';
                        html += '<span style="color:#f59e0b;font-weight:bold;">' + sym + '</span>';
                        html += '<a href="https://sepolia.etherscan.io/address/' + addr + '" target="_blank" style="color:#06b6d4;font-size:10px;word-break:break-all;">' + addr.substring(0,8) + '...' + addr.substring(36) + '</a>';
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
