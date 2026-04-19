// ==================== KHỐI 11: MARKET CANCEL (RÚT HÀNG) ====================
export default {
    id: "market-cancel",
    name: "🔙 Rút Hàng Về Ví",
    desc: "Hủy đơn niêm yết, rút NFT về ví an toàn",
    color: "#f43f5e",
    label: "Rút Hàng",
    preview: () => `
        <div style="text-align:center;padding:8px;">
            <div style="font-size:30px;margin-bottom:6px;">🔙</div>
            <div class="pv-input">Mã Chợ (0x...)</div>
            <div class="pv-input">Listing ID (#)</div>
            <div class="pv-btn" style="background:#f43f5e;">🗑️ HỦY ĐƠN / RÚT HÀNG</div>
        </div>`,
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#f43f5e;">
        <div class="khoi-title" style="color:#fb7185;">🔙 RÚT HÀNG VỀ VÍ</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Nhập Mã Đơn Hàng (Listing ID) mà bạn đã niêm yết để hủy bán và rút NFT về ví. Chỉ chủ đơn mới được rút!</p>
        <input type="text" id="mcancel-marketplace" placeholder="🏪 Mã Chợ Marketplace (0x...)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;width:100%;margin-bottom:8px;">
        <input type="number" id="mcancel-id" placeholder="🎫 Mã Đơn Hàng (VD: 3)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;width:100%;margin-bottom:10px;">
        <button id="mcancel-btn" style="background:linear-gradient(45deg, #e11d48, #f43f5e);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;">🗑️ HỦY ĐƠN / RÚT HÀNG VỀ</button>
    </div>`,
    engineCode: (pfx) => `
    async function cancelListing() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mcancel-marketplace').value.trim();
        const listingId = document.getElementById('mcancel-id').value.trim();
        const btn = document.getElementById('mcancel-btn');
        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Chợ Marketplace hợp lệ!'); return; }
        if(listingId === '') { toast('error','Nhập Mã Đơn Hàng (Listing ID)!'); return; }
        try {
            btn.disabled = true; btn.innerText = '⏳ ĐANG HỦY ĐƠN...';
            toast('info', 'Đang gửi lệnh Hủy Đơn #' + listingId + '...');
            const mp = new ethers.Contract(mpAddr, ["function cancelListing(uint256 listingId)"], signer);
            const tx = await mp.cancelListing(listingId); await tx.wait();
            toast('success', 'Đã hủy Đơn #' + listingId + '! NFT đã về ví bạn an toàn!');
            btn.innerText = '🗑️ HỦY ĐƠN / RÚT HÀNG VỀ'; btn.disabled = false;
        } catch(e) {
            btn.innerText = '🗑️ HỦY ĐƠN / RÚT HÀNG VỀ'; btn.disabled = false;
            const msg = (e.reason || e.message || '').toLowerCase();
            if(msg.includes('not the listing creator') || msg.includes('caller is not')) { toast('error', 'Bạn không phải chủ đơn niêm yết này!'); }
            else { toast('error', e.reason || e.message || 'Lỗi hủy đơn!'); }
        }
    }
    `,
    bindings: [{ btn: "mcancel-btn", fn: "cancelListing" }]
}