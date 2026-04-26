// ==================== KHỐI: BẦU CỬ BẰNG TOKEN (DAO VOTING) ====================
export default {
    id: "dao-token-voting",
    name: "🗳️ Bầu Cử Bằng Token",
    desc: "Bỏ phiếu DAO (1 Token = 1 Điểm)",
    color: "#eab308",
    label: "Bầu cử DAO",
    contractKey: "voting-contract",
    contractPlaceholder: "Contract Voting (0x...)",
    preview: () => `
        <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">📊 Kết quả bầu cử</div>
        <div style="margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
                <span>🏆 Ứng viên A</span><span style="color:#eab308;">65%</span>
            </div>
            <div style="height:8px;background:#1e293b;border-radius:99px;overflow:hidden;">
                <div style="width:65%;height:100%;background:linear-gradient(90deg,#eab308,#f59e0b);border-radius:99px;"></div>
            </div>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
                <span>Ứng viên B</span><span style="color:#94a3b8;">35%</span>
            </div>
            <div style="height:8px;background:#1e293b;border-radius:99px;overflow:hidden;">
                <div style="width:35%;height:100%;background:linear-gradient(90deg,#64748b,#94a3b8);border-radius:99px;"></div>
            </div>
        </div>
        <div class="pv-btn" style="background:#eab308;color:#000;">🗳️ Bình Chọn</div>`,
    exportHtml: (tk, contractData) => {
        const addr = (typeof contractData === 'object' && !Array.isArray(contractData))
            ? (contractData?.votingContract || '')
            : '';
        return `
    <div class="khoi" style="border-left-color:#eab308;">
        <div class="khoi-title">🗳️ Bầu cử DAO</div>

        <!-- Ô nhập địa chỉ Phòng Bầu Cử -->
        <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input id="vote-contract" type="text" value="${addr}" placeholder="🗳️ Dán Mã Phòng Bầu Cử (0x...)" style="flex:1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <button id="vote-load-btn" style="background:#eab308;color:#000;border:none;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;white-space:nowrap;">🔄 TẢI</button>
        </div>

        <!-- Nút kích hoạt quyền bầu cử (Delegate) -->
        <div id="vote-delegate-box" style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:10px;padding:12px;margin-bottom:12px;text-align:center;">
            <p style="font-size:12px;color:#eab308;margin-bottom:8px;">⚠️ Bạn chưa kích hoạt quyền bầu cử. Hãy bấm nút bên dưới trước khi vote.</p>
            <button id="vote-delegate-btn" style="background:#eab308;color:#000;font-size:12px;padding:8px 16px;">🔑 Kích Hoạt Quyền Bầu Cử</button>
        </div>

        <!-- Trạng thái -->
        <p id="vote-status" style="font-size:12px;color:#94a3b8;margin-bottom:10px;">📋 Dán Mã Phòng Bầu Cử rồi bấm "Tải" để xem ứng viên...</p>

        <!-- Danh sách ứng viên + thanh tiến độ -->
        <div id="vote-candidates" style="margin-bottom:12px;"></div>

        <!-- Dropdown chọn + nút vote -->
        <select id="vote-select" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:rgba(0,0,0,0.3);color:inherit;font-size:13px;margin-bottom:10px;cursor:pointer;">
            <option value="">-- Chọn ứng viên --</option>
        </select>
        <button id="vote-btn" style="background:#eab308;color:#000;">🗳️ Bình Chọn</button>

        <!-- Nút bắt đầu bầu cử (chỉ admin thấy) -->
        <div id="vote-admin-box" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid #334155;">
            <button id="vote-start-btn" style="background:#22c55e;font-size:12px;padding:8px 16px;">🚀 Bắt Đầu Bầu Cử (Admin)</button>
        </div>
    </div>`;
    },
    globalCode: () => `
    // ═══ DAO TOKEN VOTING - GLOBAL ═══
    const VOTING_ABI = [
        "function candidatesCount() view returns (uint)",
        "function candidates(uint) view returns (uint id, string name, uint voteCount)",
        "function voters(address) view returns (bool)",
        "function votingToken() view returns (address)",
        "function snapshotSet() view returns (bool)",
        "function snapshotBlock() view returns (uint256)",
        "function admin() view returns (address)",
        "function vote(uint _candidateId)",
        "function startVoting()"
    ];
    const TOKEN_DELEGATE_ABI = [
        "function delegates(address) view returns (address)",
        "function delegate(address delegatee)",
        "function getVotes(address) view returns (uint256)"
    ];

    async function __GlobalVote_loadCandidates(prefix) {
        const inp = document.getElementById(prefix + 'vote-contract');
        const statusEl = document.getElementById(prefix + 'vote-status');
        const listEl = document.getElementById(prefix + 'vote-candidates');
        const selectEl = document.getElementById(prefix + 'vote-select');
        const delegateBox = document.getElementById(prefix + 'vote-delegate-box');
        const adminBox = document.getElementById(prefix + 'vote-admin-box');
        
        if (!inp || !inp.value.trim() || inp.value.trim().length !== 42) {
            if (statusEl) statusEl.innerText = '❌ Chưa cấu hình Contract Voting';
            return;
        }

        try {
            let prov;
            if (provider) {
                prov = provider;
            } else if (window.ethereum) {
                prov = new ethers.providers.Web3Provider(window.ethereum);
            } else {
                if (statusEl) statusEl.innerText = '🔗 Cần cài MetaMask để xem dữ liệu bầu cử.';
                return;
            }
            const contract = new ethers.Contract(inp.value.trim(), VOTING_ABI, prov);

            // Kiểm tra bầu cử đã bắt đầu chưa
            const isStarted = await contract.snapshotSet();

            // Lấy danh sách ứng viên
            const count = await contract.candidatesCount();
            const total = count.toNumber();
            let candidates = [];
            let totalVotes = ethers.BigNumber.from(0);

            for (let i = 1; i <= total; i++) {
                const c = await contract.candidates(i);
                candidates.push({ id: c.id.toNumber(), name: c.name, votes: c.voteCount });
                totalVotes = totalVotes.add(c.voteCount);
            }

            // Render thanh tiến độ
            let html = '';
            for (const c of candidates) {
                const pct = totalVotes.gt(0)
                    ? (parseFloat(ethers.utils.formatEther(c.votes)) / parseFloat(ethers.utils.formatEther(totalVotes)) * 100).toFixed(1)
                    : '0.0';
                const votesFormatted = parseFloat(ethers.utils.formatEther(c.votes)).toLocaleString('vi-VN', {maximumFractionDigits: 2});
                const isLeader = parseFloat(pct) > 0 && c.votes.eq(candidates.reduce((max, x) => x.votes.gt(max) ? x.votes : max, ethers.BigNumber.from(0)));

                html += '<div style="margin-bottom:10px;">';
                html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">';
                html += '<span>' + (isLeader ? '🏆 ' : '') + c.name + '</span>';
                html += '<span style="color:' + (isLeader ? '#eab308' : '#94a3b8') + ';">' + pct + '% (' + votesFormatted + ')</span>';
                html += '</div>';
                html += '<div style="height:10px;background:#1e293b;border-radius:99px;overflow:hidden;">';
                html += '<div style="width:' + pct + '%;height:100%;background:' + (isLeader ? 'linear-gradient(90deg,#eab308,#f59e0b)' : 'linear-gradient(90deg,#475569,#64748b)') + ';border-radius:99px;transition:width 0.5s ease;"></div>';
                html += '</div>';
                html += '</div>';
            }
            if (listEl) listEl.innerHTML = html;

            // Render dropdown
            if (selectEl) {
                selectEl.innerHTML = '<option value="">-- Chọn ứng viên --</option>';
                for (const c of candidates) {
                    selectEl.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
                }
            }

            // Tự động kiểm tra trạng thái Kích Hoạt (Delegate) trên Blockchain
            if (signer) {
                try {
                    const tokenAddr = await contract.votingToken();
                    const tokenContract = new ethers.Contract(tokenAddr, TOKEN_DELEGATE_ABI, prov);
                    const currentDelegatee = await tokenContract.delegates(userAddr);
                    
                    if (currentDelegatee === ethers.constants.AddressZero) {
                        // Chưa kích hoạt -> Hiện hộp thông báo
                        if (delegateBox) delegateBox.style.display = 'block';
                    } else {
                        // Đã kích hoạt -> Ẩn hộp thông báo
                        if (delegateBox) delegateBox.style.display = 'none';
                    }
                } catch(e) {
                    if (delegateBox) delegateBox.style.display = 'block'; // Lỗi thì cứ hiện cho chắc
                }
            } else {
                if (delegateBox) delegateBox.style.display = 'none';
            }

            // Kiểm tra trạng thái bầu cử
            if (!isStarted) {
                if (statusEl) statusEl.innerHTML = '⏸️ Cuộc bầu cử <strong>chưa bắt đầu</strong>. Đang chờ Admin khởi động.';
            } else {
                if (signer) {
                    const hasVoted = await contract.voters(userAddr);
                    if (hasVoted) {
                        if (statusEl) statusEl.innerHTML = '✅ Bạn đã bình chọn rồi! Kết quả đang cập nhật.';
                    } else {
                        if (statusEl) statusEl.innerHTML = '🟢 Bầu cử đang diễn ra — Hãy chọn ứng viên và bấm Bình Chọn!';
                    }
                } else {
                    if (statusEl) statusEl.innerHTML = '🔗 Hãy kết nối ví để tham gia bầu cử.';
                }
            }

            // Hiện nút admin nếu user là admin
            if (signer && !isStarted) {
                const adminAddr = await contract.admin();
                if (adminAddr.toLowerCase() === userAddr.toLowerCase()) {
                    if (adminBox) adminBox.style.display = 'block';
                }
            }

        } catch(e) {
            if (statusEl) statusEl.innerText = '❌ Lỗi: ' + (e.reason || e.message);
        }
    }

    async function __GlobalVote_delegate(prefix) {
        if (!signer) { toast('error', 'Hãy kết nối ví trước!'); return; }
        const inp = document.getElementById(prefix + 'vote-contract');
        if (!inp || !inp.value.trim()) { toast('error', 'Chưa cấu hình Contract!'); return; }
        try {
            const contract = new ethers.Contract(inp.value.trim(), VOTING_ABI, signer);
            const tokenAddr = await contract.votingToken();
            const tokenContract = new ethers.Contract(tokenAddr, TOKEN_DELEGATE_ABI, signer);
            toast('info', '🔑 Đang kích hoạt quyền bầu cử...');
            const tx = await tokenContract.delegate(userAddr);
            await tx.wait();
            toast('success', '✅ Kích hoạt thành công! Bạn đã có quyền bầu cử.');
            document.getElementById(prefix + 'vote-delegate-box').style.display = 'none';
            __GlobalVote_loadCandidates(prefix);
        } catch(e) { toast('error', e.reason || e.message); }
    }

    async function __GlobalVote_startVoting(prefix) {
        if (!signer) { toast('error', 'Hãy kết nối ví trước!'); return; }
        const inp = document.getElementById(prefix + 'vote-contract');
        if (!inp || !inp.value.trim()) return;
        try {
            const contract = new ethers.Contract(inp.value.trim(), VOTING_ABI, signer);
            toast('info', '🚀 Đang bắt đầu cuộc bầu cử...');
            const tx = await contract.startVoting();
            await tx.wait();
            toast('success', '✅ Bầu cử đã bắt đầu! Mọi người có thể vote ngay.');
            __GlobalVote_loadCandidates(prefix);
        } catch(e) { toast('error', e.reason || e.message); }
    }

    async function __GlobalVote_vote(prefix) {
        if (!signer) { toast('error', 'Hãy kết nối ví trước!'); return; }
        const inp = document.getElementById(prefix + 'vote-contract');
        const sel = document.getElementById(prefix + 'vote-select');
        if (!inp || !inp.value.trim()) { toast('error', 'Chưa cấu hình Contract!'); return; }
        if (!sel || !sel.value) { toast('error', 'Hãy chọn một ứng viên!'); return; }
        try {
            const contract = new ethers.Contract(inp.value.trim(), VOTING_ABI, signer);
            const candidateId = parseInt(sel.value);
            const candidate = await contract.candidates(candidateId);
            toast('info', '🗳️ Đang gửi phiếu bầu cho ' + candidate.name + '...');
            const tx = await contract.vote(candidateId);
            await tx.wait();
            toast('success', '✅ Bình chọn thành công cho ' + candidate.name + '!');
            __GlobalVote_loadCandidates(prefix);
        } catch(e) { toast('error', e.reason || e.message); }
    }`,
    engineCode: (pfx) => `
    function loadVotingData() { return __GlobalVote_loadCandidates('${pfx}'); }
    function delegateVotingPower() { return __GlobalVote_delegate('${pfx}'); }
    function startVotingElection() { return __GlobalVote_startVoting('${pfx}'); }
    function castVote() { return __GlobalVote_vote('${pfx}'); }
    // Chỉ auto-load nếu đã có sẵn địa chỉ từ config
    var _voteInput = document.getElementById('${pfx}vote-contract');
    if (_voteInput && _voteInput.value.trim().length === 42) {
        setTimeout(loadVotingData, 1000);
    }
    // Lắng nghe sự kiện thay đổi tài khoản MetaMask để reload
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function() { setTimeout(loadVotingData, 500); });
    }
    // Theo dõi khi signer được set (sau khi kết nối ví)
    setInterval(function() {
        if (signer && !window.__votingLoaded) {
            var inp = document.getElementById('${pfx}vote-contract');
            if (inp && inp.value.trim().length === 42) {
                window.__votingLoaded = true;
                loadVotingData();
            }
        }
    }, 1000);
    `,
    bindings: [
        { btn: "vote-btn", fn: "castVote" },
        { btn: "vote-delegate-btn", fn: "delegateVotingPower" },
        { btn: "vote-start-btn", fn: "startVotingElection" },
        { btn: "vote-load-btn", fn: "loadVotingData" }
    ]
}
