// ==================== KHỐI 4: TRANSFER (MULTI-TOKEN) ====================
export default {
    id: "transfer",
    name: "🚀 Chuyển Tiền",
    desc: "Gửi Token cho bạn",
    color: "#8b5cf6",
    label: "Chuyển tiền cho bạn",
    multiToken: true,
    preview: (tk) => `
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
            <select style="flex:1;padding:4px 6px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:11px;">
                <option>🪙 ${tk}</option><option>🪙 ETH</option>
            </select>
        </div>
        <div class="pv-input">Địa chỉ ví nhận (0x...)</div>
        <div class="pv-input">Số lượng Token...</div>
        <div class="pv-btn" style="background:#8b5cf6;">🚀 Chuyển Ngay</div>`,
    exportHtml: (tk, tokenList) => {
        const tokens = Array.isArray(tokenList) ? tokenList : [];
        const options = tokens.length > 0
            ? tokens.map(t => `<option value="${t}" data-name="${t.substring(0, 6)}...">${t.substring(0, 6)}...</option>`).join('')
            : `<option value="">-- Chưa thêm coin --</option>`;
        return `
    <div class="khoi" style="border-left-color:#8b5cf6;">
        <div class="khoi-title">Chuyển tiền cho bạn</div>
        <select id="tf-select" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:rgba(0,0,0,0.3);color:inherit;font-size:13px;margin-bottom:10px;cursor:pointer;">
            ${options}
        </select>
        <input id="tf-address" type="text" placeholder="Địa chỉ ví bạn nhận (0x...)">
        <input id="tf-amount" type="number" placeholder="Số lượng Token...">
        <button id="tf-btn" style="background:#8b5cf6;">🚀 Chuyển Ngay</button>
    </div>`;
    },
    globalCode: () => `
    async function __GlobalTf_transfer(prefix) {
        if(!signer){toast('error','Hãy kết nối ví trước!');return;}
        const ci=document.getElementById(prefix+'tf-select');
        const ai=document.getElementById(prefix+'tf-address');
        const mi=document.getElementById(prefix+'tf-amount');
        if(!ci||!ci.value||ci.value.length!==42){toast('error','Hãy chọn coin hợp lệ!');return;}
        const addr=ai.value.trim(),amt=mi.value.trim();
        if(!addr||!addr.startsWith('0x')||addr.length!==42){toast('error','Địa chỉ ví nhận không hợp lệ!');return;}
        if(!amt||isNaN(amt)||Number(amt)<=0){toast('error','Số lượng phải lớn hơn 0!');return;}
        try{
            const c=new ethers.Contract(ci.value,["function transfer(address,uint256) returns (bool)","function symbol() view returns (string)", "function decimals() view returns (uint8)"],signer);
            
            let name = ci.options[ci.selectedIndex].getAttribute('data-name');
            if(name.includes('...')) {
                try { name = await c.symbol(); ci.options[ci.selectedIndex].text = name; ci.options[ci.selectedIndex].setAttribute('data-name', name); } 
                catch(e) { name = 'Token'; }
            }
            
            toast('info','Đang chuyển '+amt+' '+name+'...');
            let dec = 18; try{dec = await c.decimals();}catch(e){}
            const tx=await c.transfer(addr,ethers.utils.parseUnits(amt, dec));await tx.wait();
            toast('success','Chuyển tiền thành công!');ai.value='';mi.value='';
        }catch(e){toast('error',e.reason||e.message);}
    }
    
    async function __GlobalTf_change(prefix) {
        if(!signer){return;}
        const ci=document.getElementById(prefix+'tf-select');
        if(!ci||!ci.value||ci.value.length!==42){return;}
        let name = ci.options[ci.selectedIndex].getAttribute('data-name');
        if(name.includes('...')) {
            try { 
                const c=new ethers.Contract(ci.value,["function symbol() view returns (string)"],signer);
                name = await c.symbol(); 
                ci.options[ci.selectedIndex].text = name; 
                ci.options[ci.selectedIndex].setAttribute('data-name', name); 
            } catch(e) {}
        }
    }`,
    engineCode: (pfx) => `
    function transferToken() { return __GlobalTf_transfer('${pfx}'); }
    function onTokenChange() { return __GlobalTf_change('${pfx}'); }
    `,
    bindings: [{ btn: "tf-btn", fn: "transferToken" }, { btn: "tf-select", fn: "onTokenChange", event: "change" }]
}
