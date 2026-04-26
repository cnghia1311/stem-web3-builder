import { FACTORY_ADDRESSES } from '../contracts/contractFactorys.js';

// ==================== KHỐI: MÁY TẠO BỘ SƯU TẬP NFT (ERC-721 FACTORY) ====================
export default {
    id: "erc721-factory",
    name: "🎨 Máy Tạo Bộ Sưu Tập NFT",
    desc: "Tạo Bộ sưu tập NFT (ERC-721) của riêng bạn",
    color: "#8b5cf6",
    label: "Máy Tạo BST NFT",
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#8b5cf6;">
        <div class="khoi-title" style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:24px;">🎨</span>
            <span style="background:linear-gradient(135deg,#8b5cf6,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:16px;letter-spacing:1px;">MÁY TẠO BỘ SƯU TẬP NFT</span>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Tên Bộ Sưu Tập</label>
            <input type="text" id="nf-collection-name" placeholder="Ví dụ: Tranh Của Tôi" maxlength="32" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Ký Hiệu (Symbol)</label>
            <input type="text" id="nf-collection-symbol" placeholder="Ví dụ: ART (3-5 chữ cái)" maxlength="8" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;text-transform:uppercase;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Loại NFT</label>
            <select id="nf-is-soulbound" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:4px;">
                <option value="false">🎨 Tranh nghệ thuật (Được phép mua bán)</option>
                <option value="true">🎓 Bằng cấp / Chứng chỉ (Khóa vĩnh viễn vào ví)</option>
            </select>
            <div style="font-size:10px;color:#64748b;margin-bottom:6px;">🎨 Bạn sẽ là Owner duy nhất có quyền Mint NFT trong bộ sưu tập này</div>
        </div>

        <button id="nf-create-btn" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#8b5cf6,#a855f7);color:white;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:1px;">🚀 TẠO BỘ SƯU TẬP</button>

        <div id="nf-status" style="margin-top:10px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>

        <div id="nf-result" style="display:none;margin-top:12px;background:#0f2a1a;border:1px solid #10b981;border-radius:12px;padding:15px;">
            <div style="font-size:14px;font-weight:bold;color:#10b981;margin-bottom:8px;">🎉 Bộ Sưu Tập đã được tạo thành công!</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Tên: <span id="nf-result-name" style="color:#e2e8f0;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Ký hiệu: <span id="nf-result-symbol" style="color:#8b5cf6;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Địa chỉ Contract Collection:</div>
            <div id="nf-result-address" style="background:#1e293b;padding:10px;border-radius:8px;font-size:12px;color:#06b6d4;word-break:break-all;cursor:pointer;text-align:center;" title="Bấm để copy"></div>
            <div style="text-align:center;margin-top:8px;">
                <a id="nf-result-link" href="#" target="_blank" style="color:#06b6d4;font-size:11px;text-decoration:underline;">🔗 Xem trên Etherscan</a>
            </div>
            <div style="margin-top:10px;padding:8px;background:#1e293b;border-radius:8px;font-size:10px;color:#a855f7;text-align:center;">
                💡 Copy địa chỉ Contract ở trên → Dán vào khối <strong>Mint NFT</strong> để bắt đầu đúc NFT vào bộ sưu tập!
            </div>
        </div>

        <div id="nf-history" style="margin-top:12px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
                <span>📜 Bộ sưu tập đã tạo trước đó:</span>
                <button id="nf-load-history" style="background:none;border:1px solid #334155;color:#94a3b8;padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer;">Tải lịch sử</button>
            </div>
            <div id="nf-history-list" style="font-size:11px;color:#94a3b8;"></div>
        </div>
    </div>`,

    engineCode: () => `
        const NFT_FACTORY_ADDR = '${FACTORY_ADDRESSES.ERC721_FACTORY}';
        const NFT_FACTORY_ABI = [
            "function createCollection(string name, string symbol, bool isSoulbound) public returns (address)",
            "function getUserCollections(address user) public view returns (address[] memory)",
            "function getTotalCollections() public view returns (uint256)",
            "event CollectionCreated(address indexed creator, address collectionAddress, string name, string symbol)"
        ];
        const ERC721_MINI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)"
        ];

        const _nfBtn = document.getElementById('nf-create-btn');
        const _nfName = document.getElementById('nf-collection-name');
        const _nfSymbol = document.getElementById('nf-collection-symbol');
        const _nfSoulbound = document.getElementById('nf-is-soulbound');
        const _nfStatus = document.getElementById('nf-status');
        const _nfResult = document.getElementById('nf-result');
        const _nfLoadHist = document.getElementById('nf-load-history');

        if (_nfBtn) {
            // Auto uppercase symbol
            _nfSymbol.addEventListener('input', function() {
                this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            });

            // Copy address khi click
            document.getElementById('nf-result-address').addEventListener('click', function() {
                navigator.clipboard.writeText(this.innerText).then(function(){
                    toast('success', '📋 Đã copy địa chỉ Contract Collection!');
                });
            });

            _nfBtn.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví (🦊) trước!'); return; }
                var colName = _nfName.value.trim();
                var colSymbol = _nfSymbol.value.trim();
                var isSoulbound = _nfSoulbound ? (_nfSoulbound.value === 'true') : false;

                if (!colName) { toast('error', 'Nhập tên Bộ Sưu Tập!'); return; }
                if (!colSymbol || colSymbol.length < 2) { toast('error', 'Nhập ký hiệu (ít nhất 2 ký tự)!'); return; }

                try {
                    _nfBtn.disabled = true; _nfBtn.style.opacity = '0.5';
                    _nfStatus.innerHTML = '<span style="color:#a855f7;">⏳ Đang gửi giao dịch tạo Bộ Sưu Tập... (Xác nhận trên MetaMask)</span>';
                    _nfResult.style.display = 'none';

                    var factory = new ethers.Contract(NFT_FACTORY_ADDR, NFT_FACTORY_ABI, signer);
                    var tx = await factory.createCollection(colName, colSymbol, isSoulbound);
                    _nfStatus.innerHTML = '<span style="color:#a855f7;">⛏️ Đang đợi Blockchain xác nhận...</span>';

                    var receipt = await tx.wait();

                    // Lấy địa chỉ collection mới từ event
                    var collectionAddr = null;
                    for (var i = 0; i < receipt.logs.length; i++) {
                        try {
                            var parsed = factory.interface.parseLog(receipt.logs[i]);
                            if (parsed.name === 'CollectionCreated') {
                                collectionAddr = parsed.args.collectionAddress;
                                break;
                            }
                        } catch(e) {}
                    }

                    if (!collectionAddr) {
                        // Fallback: lấy từ danh sách collection của user
                        var collections = await factory.getUserCollections(userAddr);
                        collectionAddr = collections[collections.length - 1];
                    }

                    // Hiển thị kết quả
                    var scanBase = 'https://sepolia.etherscan.io/address/';
                    document.getElementById('nf-result-name').innerText = colName;
                    document.getElementById('nf-result-symbol').innerText = colSymbol;
                    document.getElementById('nf-result-address').innerText = collectionAddr;
                    document.getElementById('nf-result-link').href = scanBase + collectionAddr;
                    _nfResult.style.display = 'block';

                    _nfStatus.innerHTML = '<span style="color:#10b981;">✅ Hoàn tất! Bộ sưu tập <strong>' + colSymbol + '</strong> đã sẵn sàng!</span>';
                    toast('success', '🎉 Đã tạo thành công bộ sưu tập ' + colSymbol + '!');

                    // Reset form
                    _nfName.value = ''; _nfSymbol.value = '';
                } catch(e) {
                    var msg = e.reason || e.message || 'Lỗi không xác định';
                    _nfStatus.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0, 80) + '</span>';
                    toast('error', 'Thất bại: ' + msg.substring(0, 50));
                } finally {
                    _nfBtn.disabled = false; _nfBtn.style.opacity = '1';
                }
            });

            // Tải lịch sử collection đã tạo
            _nfLoadHist.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví trước!'); return; }
                var histList = document.getElementById('nf-history-list');
                histList.innerHTML = '<span style="color:#a855f7;">⏳ Đang tải...</span>';
                try {
                    var factory = new ethers.Contract(NFT_FACTORY_ADDR, NFT_FACTORY_ABI, signer);
                    var collections = await factory.getUserCollections(userAddr);
                    if (collections.length === 0) {
                        histList.innerHTML = '<span style="color:#64748b;">Bạn chưa tạo Bộ Sưu Tập nào.</span>';
                        return;
                    }
                    var html = '';
                    for (var i = 0; i < collections.length; i++) {
                        var addr = collections[i];
                        var sym = '???';
                        var minted = '?';
                        try {
                            var c = new ethers.Contract(addr, ERC721_MINI, signer);
                            sym = await c.symbol();
                            var total = await c.totalSupply();
                            minted = total.toString();
                        } catch(e) {}
                        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#1e293b;border-radius:6px;margin-bottom:4px;">';
                        html += '<div style="display:flex;align-items:center;gap:6px;">';
                        html += '<span style="color:#8b5cf6;font-weight:bold;">' + sym + '</span>';
                        html += '<span style="color:#64748b;font-size:9px;">(' + minted + ' NFT)</span>';
                        html += '</div>';
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
