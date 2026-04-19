// ==================== KHỐI 2: SỐ DƯ (MULTI-TOKEN DROPDOWN) ====================
export default {
    id: "balance",
    name: "💰 Hiện Số Dư Token",
    desc: "Chọn coin từ danh sách sổ xuống",
    color: "#10b981",
    label: "Số dư tài khoản (Live)",
    multiToken: true,
    preview: (tk) => `
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
            <select style="flex:1;padding:4px 6px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:11px;">
                <option>🪙 ${tk}</option><option>🪙 ETH</option>
            </select>
        </div>
        <p style="font-size:28px;font-weight:800;margin:4px 0;">2,500 <span style="font-size:14px;color:#64748b;">${tk}</span></p>
        <div style="font-size:10px;color:#10b981;margin-bottom:6px;">🟢 Tự cập nhật mỗi 15 giây</div>
        <div class="pv-btn" style="background:#10b981;font-size:12px;">🔄 Làm Mới</div>`,
    exportHtml: (tk, tokenList) => {
        const tokens = Array.isArray(tokenList) ? tokenList : [];
        const options = tokens.length > 0
            ? tokens.map(t => `<option value="${t}" data-name="${t.substring(0, 6)}...">${t.substring(0, 6)}...</option>`).join('')
            : `<option value="">-- Chưa thêm coin --</option>`;
        return `
    <div class="khoi" style="border-left-color:#10b981;">
        <div class="khoi-title">Số dư tài khoản <span style="color:#10b981;font-size:9px;">● LIVE</span></div>
        <select id="bal-select" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:rgba(0,0,0,0.3);color:inherit;font-size:13px;margin-bottom:10px;cursor:pointer;">
            ${options}
        </select>
        <p style="font-size:32px;font-weight:800;margin:5px 0;"><span id="bal-value">0</span> <span id="bal-token-name" style="font-size:16px;color:#64748b;">${tk}</span></p>
        <p id="bal-status" style="font-size:11px;color:#64748b;margin-bottom:8px;">⏳ Chưa kết nối</p>
        <button id="bal-check" style="background:#10b981;">🔄 Làm Mới</button>
    </div>`;
    },
    globalCode: () => `
    window._balInstances = window._balInstances || {};
    if(!window._globalPollerStarted) {
        window._globalPollerStarted = true;
        window._globalPollerTasks = window._globalPollerTasks || {};
        setInterval(() => {
            Object.values(window._globalPollerTasks).forEach(fn => { try{fn();}catch(e){} });
        }, 15000);
    }
    
    async function __GlobalBal_refresh(prefix) {
        if(!signer){return;}
        const sel=document.getElementById(prefix+'bal-select');
        if(!sel||!sel.value||sel.value.length!==42){return;}
        try{
            const addr=sel.value;
            const c=new ethers.Contract(addr,["function balanceOf(address) view returns (uint256)","function symbol() view returns (string)","event Transfer(address indexed from, address indexed to, uint256 value)"],signer);
            const b=await c.balanceOf(userAddr);
            document.getElementById(prefix+'bal-value').innerText=ethers.utils.formatEther(b);
            
            let name = sel.options[sel.selectedIndex].getAttribute('data-name');
            if(name.includes('...')) {
                try {
                    name = await c.symbol();
                    sel.options[sel.selectedIndex].text = name;
                    sel.options[sel.selectedIndex].setAttribute('data-name', name);
                } catch(e) { name = 'Token'; }
            }
            document.getElementById(prefix+'bal-token-name').innerText=name;
            
            document.getElementById(prefix+'bal-status').innerText='🟢 Đang tự theo dõi';
            
            if(!window._balInstances[prefix]) window._balInstances[prefix] = {};
            
            if(window._balInstances[prefix].contract !== addr){
                window._balInstances[prefix].contract = addr;
                c.on('Transfer',(from,to,val)=>{
                    if(from.toLowerCase()===userAddr.toLowerCase()||to.toLowerCase()===userAddr.toLowerCase()){
                        __GlobalBal_refresh(prefix);
                    }
                });
            }
            
            if(!window._balInstances[prefix].isPolling) {
                window._balInstances[prefix].isPolling = true;
                window._globalPollerTasks[prefix] = () => __GlobalBal_refresh(prefix);
            }
        }catch(e){document.getElementById(prefix+'bal-value').innerText='?';document.getElementById(prefix+'bal-status').innerText='❌ '+e.message;}
    }
    
    async function __GlobalBal_check(prefix) {
        if(!signer){toast('error','Hãy kết nối ví trước!');return;}
        const sel=document.getElementById(prefix+'bal-select');
        if(!sel||!sel.value||sel.value.length!==42){toast('error','Hãy chọn coin hợp lệ!');return;}
        await __GlobalBal_refresh(prefix);
        toast('success','Đã cập nhật số dư!');
    }
    
    function __GlobalBal_change(prefix) {
        document.getElementById(prefix+'bal-status').innerText='⏳ Đang tải dữ liệu...';
        document.getElementById(prefix+'bal-value').innerText='...';
        if(window._balInstances[prefix]) window._balInstances[prefix].contract = null; 
        __GlobalBal_refresh(prefix);
    }`,
    engineCode: (pfx) => `
    function refreshBalance(){ return __GlobalBal_refresh('${pfx}'); }
    function checkBalance(){ return __GlobalBal_check('${pfx}'); }
    function onTokenChange(){ return __GlobalBal_change('${pfx}'); }
    `,
    bindings: [{ btn: "bal-check", fn: "checkBalance" }]
}
