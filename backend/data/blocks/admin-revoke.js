// ==================== KHỐI: ADMIN THU HỒI CHỨNG CHỈ ====================
export default {
    id: "admin-revoke",
    name: "🔥 Thu Hồi Chứng Chỉ",
    desc: "Admin thu hồi và đốt chứng chỉ đã cấp phát nhầm",
    color: "#ef4444",
    label: "Thu Hồi Bằng Cấp",
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">🔥</div>
            <div class="pv-input">Mã Bộ Sưu Tập (0x...)</div>
            <div class="pv-input">Token ID Cần Thu Hồi</div>
            <div class="pv-btn" style="background:#ef4444;">THU HỒI CHỨNG CHỈ</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#ef4444;">
        <div class="khoi-title" style="color:#ef4444;">🔥 ADMIN: THU HỒI CHỨNG CHỈ</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Dành riêng cho Admin. Thu hồi vĩnh viễn chứng chỉ (Soulbound) đã cấp phát nhầm. Hành động này sẽ đốt bỏ NFT khỏi ví của học sinh.</p>
        
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#ef4444;margin-bottom:6px;font-weight:bold;">Địa chỉ Bộ Sưu Tập (Contract)</label>
            <input type="text" id="revoke-collection-addr" placeholder="Dán địa chỉ Bộ Sưu Tập (0x...)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#ef4444;margin-bottom:6px;font-weight:bold;">Token ID Cần Thu Hồi</label>
            <input type="number" id="revoke-token-id" placeholder="Ví dụ: 0" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:4px;">
            <div style="font-size:10px;color:#64748b;margin-bottom:6px;">⚠️ Cảnh báo: Chỉ có Owner (người tạo ra Bộ Sưu Tập) mới có quyền thực hiện.</div>
        </div>

        <button id="revoke-btn" style="background:linear-gradient(135deg, #ef4444, #dc2626);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:12px;box-shadow:0 4px 15px rgba(239,68,68,0.4);">🔥 THU HỒI NGAY</button>
        
        <div id="revoke-status" style="margin-top:10px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>
    </div>`,
    engineCode: (pfx) => `
        const STEM_NFT_REVOKE_ABI = [
            "function revokeCertificate(uint256 tokenId) public",
            "function owner() view returns (address)"
        ];

        async function executeRevoke() {
            if (!signer) { toast('error', 'Cần kết nối ví (🦊) trước!'); return; }
            
            const addrInput = document.getElementById('revoke-collection-addr');
            const idInput = document.getElementById('revoke-token-id');
            const btn = document.getElementById('revoke-btn');
            const statusEl = document.getElementById('revoke-status');

            const colAddr = addrInput.value.trim();
            const tokenId = idInput.value.trim();

            if (!colAddr || colAddr.length !== 42) { toast('error', 'Nhập địa chỉ Bộ Sưu Tập hợp lệ!'); return; }
            if (tokenId === '') { toast('error', 'Nhập Token ID cần thu hồi!'); return; }

            try {
                btn.disabled = true; btn.style.opacity = '0.5';
                statusEl.innerHTML = '<span style="color:#fbbf24;">⏳ Đang kiểm tra quyền Admin...</span>';

                const contract = new ethers.Contract(colAddr, STEM_NFT_REVOKE_ABI, signer);
                
                // Kiểm tra quyền Owner
                try {
                    const contractOwner = await contract.owner();
                    if (contractOwner.toLowerCase() !== userAddr.toLowerCase()) {
                        throw new Error('Bạn không phải Owner của bộ sưu tập này!');
                    }
                } catch(ownerErr) {
                    if (ownerErr.message.includes('Owner')) throw ownerErr;
                }

                statusEl.innerHTML = '<span style="color:#ef4444;">🔥 Đang gửi lệnh thu hồi... (Xác nhận trên MetaMask)</span>';
                
                const tx = await contract.revokeCertificate(tokenId);
                statusEl.innerHTML = '<span style="color:#ef4444;">⛏️ Đang đợi Blockchain xác nhận...</span>';
                
                await tx.wait();
                
                statusEl.innerHTML = '<span style="color:#10b981;">✅ Đã thu hồi và đốt chứng chỉ thành công!</span>';
                toast('success', '🔥 Thu hồi thành công Token ID #' + tokenId);
                
                idInput.value = ''; // Xóa ID sau khi thu hồi xong

            } catch (e) {
                var msg = e.reason || e.message || 'Lỗi không xác định';
                if (msg.includes('user rejected')) msg = 'Bạn đã từ chối giao dịch!';
                if (msg.includes('nonexistent')) msg = 'Chứng chỉ này không tồn tại hoặc đã bị đốt!';
                statusEl.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0, 80) + '</span>';
                toast('error', 'Thu hồi thất bại: ' + msg.substring(0, 60));
            } finally {
                btn.disabled = false; btn.style.opacity = '1';
            }
        }
    `,
    bindings: [
        { btn: "revoke-btn", fn: "executeRevoke" }
    ]
}
