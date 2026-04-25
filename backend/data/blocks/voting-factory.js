// ==================== KHỐI: MÁY TẠO PHÒNG BẦU CỬ (VOTING FACTORY) ====================
export default {
    id: "voting-factory",
    name: "🗳️ Máy Tạo Phòng Bầu Cử",
    desc: "Tạo cuộc Bầu cử DAO mới với Token của bạn",
    color: "#eab308",
    label: "Máy Tạo Bầu Cử",
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#eab308;">
        <div class="khoi-title" style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:24px;">🗳️</span>
            <span style="background:linear-gradient(135deg,#eab308,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:16px;letter-spacing:1px;">MÁY TẠO PHÒNG BẦU CỬ</span>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Địa chỉ Token ERC-20 Votes</label>
            <input type="text" id="vf-token-addr" placeholder="0x... (Token có tính năng Votes/Delegate)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:8px;">
            <div style="font-size:10px;color:#64748b;margin-bottom:12px;">⚠️ Token phải hỗ trợ ERC20Votes (có hàm delegate & getPastVotes). Ví dụ: StemCoin.</div>

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Danh sách Ứng viên</label>
            <div id="vf-candidates-list" style="margin-bottom:8px;">
                <div style="display:flex;gap:6px;margin-bottom:6px;">
                    <input type="text" class="vf-candidate-input" placeholder="Tên ứng viên 1" maxlength="50" style="flex:1;padding:8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px;outline:none;">
                </div>
                <div style="display:flex;gap:6px;margin-bottom:6px;">
                    <input type="text" class="vf-candidate-input" placeholder="Tên ứng viên 2" maxlength="50" style="flex:1;padding:8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px;outline:none;">
                </div>
            </div>
            <button id="vf-add-candidate" style="background:none;border:1px dashed #334155;color:#94a3b8;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;width:100%;margin-bottom:4px;">➕ Thêm ứng viên</button>
        </div>

        <button id="vf-create-btn" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#eab308,#f59e0b);color:#0f172a;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:1px;">🚀 TẠO PHÒNG BẦU CỬ</button>

        <div id="vf-status" style="margin-top:10px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>

        <div id="vf-result" style="display:none;margin-top:12px;background:#0f2a1a;border:1px solid #10b981;border-radius:12px;padding:15px;">
            <div style="font-size:14px;font-weight:bold;color:#10b981;margin-bottom:8px;">🎉 Phòng Bầu Cử đã được tạo thành công!</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Địa chỉ Contract Phòng Bầu Cử:</div>
            <div id="vf-result-address" style="background:#1e293b;padding:10px;border-radius:8px;font-size:12px;color:#eab308;word-break:break-all;cursor:pointer;text-align:center;" title="Bấm để copy"></div>
            <div style="text-align:center;margin-top:8px;">
                <a id="vf-result-link" href="#" target="_blank" style="color:#06b6d4;font-size:11px;text-decoration:underline;">🔗 Xem trên Etherscan</a>
            </div>
            <div style="margin-top:10px;padding:8px;background:#1e293b;border-radius:8px;font-size:10px;color:#f59e0b;text-align:center;">
                💡 Copy địa chỉ này → Dán vào khối <strong>Bầu Cử DAO</strong> để bắt đầu bỏ phiếu!<br>
                ⚠️ Nhớ bấm <strong>"Bắt Đầu Bầu Cử"</strong> trong khối DAO sau khi phát Token cho mọi người xong!
            </div>
        </div>

        <div id="vf-history" style="margin-top:12px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
                <span>📜 Phòng Bầu Cử đã tạo:</span>
                <button id="vf-load-history" style="background:none;border:1px solid #334155;color:#94a3b8;padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer;">Tải lịch sử</button>
            </div>
            <div id="vf-history-list" style="font-size:11px;color:#94a3b8;"></div>
        </div>
    </div>`,

    engineCode: () => `
        const VOTING_FACTORY_ADDR = '0x8B2452f23A5207F1758Ab1D0b435002D05B3FC13';
        const VOTING_FACTORY_ABI = [
            "function createVoting(address _tokenAddress, string[] memory _candidateNames) external returns (address)",
            "function getUserVotings(address user) external view returns (address[] memory)",
            "function getTotalVotings() external view returns (uint256)",
            "event VotingCreated(address indexed creator, address votingAddress, address tokenAddress)"
        ];
        const MINI_VOTING_ABI = [
            "function candidatesCount() view returns (uint)",
            "function snapshotSet() view returns (bool)",
            "function admin() view returns (address)",
            "function votingToken() view returns (address)"
        ];

        const _vfBtn = document.getElementById('vf-create-btn');
        const _vfTokenAddr = document.getElementById('vf-token-addr');
        const _vfStatus = document.getElementById('vf-status');
        const _vfResult = document.getElementById('vf-result');
        const _vfAddCandidate = document.getElementById('vf-add-candidate');
        const _vfLoadHist = document.getElementById('vf-load-history');

        if (_vfBtn) {
            // Thêm ứng viên mới
            _vfAddCandidate.addEventListener('click', function() {
                var list = document.getElementById('vf-candidates-list');
                var count = list.querySelectorAll('.vf-candidate-input').length + 1;
                var div = document.createElement('div');
                div.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;';
                div.innerHTML = '<input type="text" class="vf-candidate-input" placeholder="Tên ứng viên ' + count + '" maxlength="50" style="flex:1;padding:8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px;outline:none;"><button onclick="this.parentElement.remove()" style="background:#ef4444;color:white;border:none;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;">✕</button>';
                list.appendChild(div);
            });

            // Copy address khi click
            document.getElementById('vf-result-address').addEventListener('click', function() {
                navigator.clipboard.writeText(this.innerText).then(function(){
                    toast('success', '📋 Đã copy địa chỉ Phòng Bầu Cử!');
                });
            });

            _vfBtn.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví (🦊) trước!'); return; }
                var tokenAddr = _vfTokenAddr.value.trim();
                if (!tokenAddr || tokenAddr.length !== 42) { toast('error', 'Nhập địa chỉ Token ERC-20 hợp lệ!'); return; }

                // Thu thập danh sách ứng viên
                var inputs = document.querySelectorAll('.vf-candidate-input');
                var candidateNames = [];
                for (var i = 0; i < inputs.length; i++) {
                    var name = inputs[i].value.trim();
                    if (name) candidateNames.push(name);
                }
                if (candidateNames.length < 2) { toast('error', 'Cần ít nhất 2 ứng viên!'); return; }

                try {
                    _vfBtn.disabled = true; _vfBtn.style.opacity = '0.5';
                    _vfStatus.innerHTML = '<span style="color:#f59e0b;">⏳ Đang gửi giao dịch tạo Phòng Bầu Cử... (Xác nhận trên MetaMask)</span>';
                    _vfResult.style.display = 'none';

                    var factory = new ethers.Contract(VOTING_FACTORY_ADDR, VOTING_FACTORY_ABI, signer);
                    var tx = await factory.createVoting(tokenAddr, candidateNames);
                    _vfStatus.innerHTML = '<span style="color:#f59e0b;">⛏️ Đang đợi Blockchain xác nhận...</span>';

                    var receipt = await tx.wait();

                    // Lấy địa chỉ Phòng Bầu Cử mới từ event
                    var votingAddr = null;
                    for (var j = 0; j < receipt.logs.length; j++) {
                        try {
                            var parsed = factory.interface.parseLog(receipt.logs[j]);
                            if (parsed.name === 'VotingCreated') {
                                votingAddr = parsed.args.votingAddress;
                                break;
                            }
                        } catch(e) {}
                    }

                    if (!votingAddr) {
                        // Fallback: Lấy từ danh sách user
                        var userVotings = await factory.getUserVotings(userAddr);
                        votingAddr = userVotings[userVotings.length - 1];
                    }

                    // Hiển thị kết quả
                    var scanBase = 'https://sepolia.etherscan.io/address/';
                    document.getElementById('vf-result-address').innerText = votingAddr;
                    document.getElementById('vf-result-link').href = scanBase + votingAddr;
                    _vfResult.style.display = 'block';

                    _vfStatus.innerHTML = '<span style="color:#10b981;">✅ Hoàn tất! Phòng Bầu Cử đã sẵn sàng với ' + candidateNames.length + ' ứng viên!</span>';
                    toast('success', '🎉 Đã tạo Phòng Bầu Cử thành công!');
                } catch(e) {
                    var msg = e.reason || e.message || 'Lỗi không xác định';
                    if (msg.includes('user rejected')) msg = 'Bạn đã từ chối giao dịch trên MetaMask!';
                    _vfStatus.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0, 80) + '</span>';
                    toast('error', 'Thất bại: ' + msg.substring(0, 50));
                } finally {
                    _vfBtn.disabled = false; _vfBtn.style.opacity = '1';
                }
            });

            // Tải lịch sử phòng bầu cử đã tạo
            _vfLoadHist.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví trước!'); return; }
                var histList = document.getElementById('vf-history-list');
                histList.innerHTML = '<span style="color:#f59e0b;">⏳ Đang tải...</span>';
                try {
                    var factory = new ethers.Contract(VOTING_FACTORY_ADDR, VOTING_FACTORY_ABI, provider);
                    var votings = await factory.getUserVotings(userAddr);

                    if (votings.length === 0) {
                        histList.innerHTML = '<span style="color:#64748b;">Bạn chưa tạo Phòng Bầu Cử nào.</span>';
                        return;
                    }
                    var html = '';
                    for (var i = 0; i < votings.length; i++) {
                        var addr = votings[i];
                        var candidateCount = '?';
                        var status = '❓';
                        try {
                            var v = new ethers.Contract(addr, MINI_VOTING_ABI, provider);
                            var count = await v.candidatesCount();
                            candidateCount = count.toString();
                            var started = await v.snapshotSet();
                            status = started ? '🟢 Đang diễn ra' : '⏸️ Chưa bắt đầu';
                        } catch(e) {}
                        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#1e293b;border-radius:6px;margin-bottom:4px;">';
                        html += '<div style="display:flex;align-items:center;gap:6px;">';
                        html += '<span style="color:#eab308;font-weight:bold;">🗳️ Phòng #' + (i+1) + '</span>';
                        html += '<span style="color:#64748b;font-size:9px;">(' + candidateCount + ' ứng viên)</span>';
                        html += '<span style="font-size:9px;">' + status + '</span>';
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
