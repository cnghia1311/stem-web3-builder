export const BLOCKS = [
    // ==================== KHỐI 1: VÍ ====================
    {
        id: "wallet",
        name: "🦊 Kết Nối Ví",
        desc: "Nút MetaMask + Hiện địa chỉ",
        required: true,
        color: "#f59e0b",
        label: "Ví của tôi",
        preview: () => `
            <p style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Địa chỉ: <strong style="color:#f59e0b;">0x1a2b...9z</strong></p>
            <div class="pv-btn" style="background:#f59e0b;">🦊 Kết Nối MetaMask</div>`,
        exportHtml: () => `
    <div class="khoi" style="border-left-color:#f59e0b;">
        <div class="khoi-title">Ví của tôi</div>
        <p style="font-size:13px;color:#94a3b8;margin-bottom:10px;">Địa chỉ: <strong id="web3-wallet">Chưa kết nối</strong></p>
        <button id="web3-connect" style="background:#f59e0b;">🦊 Kết Nối MetaMask</button>
    </div>`,
        engineCode: () => `
    async function connectWallet(){
        if(!window.ethereum){toast('error','Chưa cài MetaMask! Vào metamask.io để tải.');return;}
        try{
            provider=new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts',[]);
            signer=provider.getSigner();userAddr=await signer.getAddress();
            const w=document.getElementById('web3-wallet');if(w)w.innerText=userAddr.substring(0,6)+'...'+userAddr.slice(-4);
            const btn=document.getElementById('web3-connect');if(btn){btn.innerText='✅ Đã kết nối';btn.style.opacity='0.7';}
            toast('success','Kết nối ví thành công!');
            if(typeof refreshBalance==='function') refreshBalance();
        }catch(e){toast('error','Kết nối thất bại: '+e.message);}
    }`,
        bindings: [{btn:"web3-connect",fn:"connectWallet"}]
    },

    // ==================== KHỐI 2: SỐ DƯ (MULTI-TOKEN DROPDOWN) ====================
    {
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
    function refreshBalance(){ return __GlobalBal_refresh('${pfx}-'); }
    function checkBalance(){ return __GlobalBal_check('${pfx}-'); }
    function onTokenChange(){ return __GlobalBal_change('${pfx}-'); }
    `,
        bindings: [{btn:"bal-check",fn:"checkBalance"}]
    },

    // ==================== KHỐI 3: CLAIM (ĐỘC LẬP) ====================
    {
        id: "claim",
        name: "🎁 Nhận Lương (Claim)",
        desc: "Nhận Token miễn phí",
        color: "#3b82f6",
        label: "Nhận lương",
        contractKey: "claim-contract",
        contractPlaceholder: "Contract Claim (0x...)",
        preview: (tk) => `
            <div class="pv-btn" style="background:#3b82f6;">🎁 Nhận 100 ${tk}</div>`,
        exportHtml: (tk, contractAddr) => `
    <div class="khoi" style="border-left-color:#3b82f6;">
        <div class="khoi-title">Nhận lương</div>
        <input id="claim-contract" type="hidden" value="${contractAddr || ''}">
        <button id="claim-btn" style="background:#3b82f6;">🎁 Nhận 100 ${tk}</button>
    </div>`,
        engineCode: () => `
    async function claimToken(){
        if(!signer){toast('error','Hãy kết nối ví trước!');return;}
        const inp=document.getElementById('claim-contract');
        if(!inp||!inp.value.trim()||inp.value.trim().length!==42){toast('error','Hãy nhập đúng địa chỉ Contract!');return;}
        try{
            const c=new ethers.Contract(inp.value.trim(),["function claim() public"],signer);
            toast('info','Đang gửi lệnh Claim...');const tx=await c.claim();await tx.wait();
            toast('success','Nhận lương thành công!');
        }catch(e){toast('error',e.reason||e.message);}
    }`,
        bindings: [{btn:"claim-btn",fn:"claimToken"}]
    },

    // ==================== KHỐI 4: TRANSFER (MULTI-TOKEN) ====================
    {
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
    function transferToken() { return __GlobalTf_transfer('${pfx}-'); }
    function onTokenChange() { return __GlobalTf_change('${pfx}-'); }
    `,
        bindings: [{btn:"tf-btn",fn:"transferToken"}, {btn:"tf-select",fn:"onTokenChange",event:"change"}]
    },

    // ==================== KHỐI 5: MINT NFT (ĐỘC LẬP) ====================
    {
        id: "mint-nft",
        name: "🖼️ Mint NFT",
        desc: "Tạo NFT mới",
        color: "#ec4899",
        label: "Tạo NFT",
        contractKey: "nft-contract",
        contractPlaceholder: "Contract NFT (0x...)",
        preview: () => `
            <div class="pv-input">Link ảnh NFT (https://...)</div>
            <div class="pv-btn" style="background:#ec4899;">🖼️ Mint NFT</div>`,
        exportHtml: (tk, contractAddr) => `
    <div class="khoi" style="border-left-color:#ec4899;">
        <div class="khoi-title">Tạo NFT</div>
        <input id="nft-contract" type="hidden" value="${contractAddr || ''}">
        <input id="nft-uri" type="text" placeholder="Dán link ảnh NFT (https://...)">
        <button id="nft-btn" style="background:#ec4899;">🖼️ Mint NFT</button>
    </div>`,
        engineCode: () => `
    async function mintNFT(){
        if(!signer){toast('error','Hãy kết nối ví trước!');return;}
        const ci=document.getElementById('nft-contract'),ui=document.getElementById('nft-uri');
        if(!ci||!ci.value.trim()||ci.value.trim().length!==42){toast('error','Hãy nhập đúng địa chỉ Contract NFT!');return;}
        if(!ui||!ui.value.trim()){toast('error','Hãy dán link ảnh NFT!');return;}
        try{
            const c=new ethers.Contract(ci.value.trim(),["function mint(string) public"],signer);
            toast('info','Đang mint NFT...');const tx=await c.mint(ui.value.trim());await tx.wait();
            toast('success','Mint NFT thành công!');ui.value='';
        }catch(e){toast('error',e.reason||e.message);}
    }`,
        bindings: [{btn:"nft-btn",fn:"mintNFT"}]
    },

    // ==================== KHỐI 6: VOTING (ĐỘC LẬP) ====================
    {
        id: "vote",
        name: "🗳️ Bình Chọn",
        desc: "Bầu ứng viên",
        color: "#06b6d4",
        label: "Bình chọn",
        contractKey: "vote-contract",
        contractPlaceholder: "Contract Vote (0x...)",
        preview: () => `
            <div class="pv-input">Số ứng viên (0, 1, 2...)</div>
            <div class="pv-btn" style="background:#06b6d4;">🗳️ Bỏ Phiếu</div>`,
        exportHtml: (tk, contractAddr) => `
    <div class="khoi" style="border-left-color:#06b6d4;">
        <div class="khoi-title">Bình chọn</div>
        <input id="vote-contract" type="hidden" value="${contractAddr || ''}">
        <input id="vote-id" type="number" placeholder="Số ứng viên (0, 1, 2...)">
        <button id="vote-btn" style="background:#06b6d4;">🗳️ Bỏ Phiếu</button>
    </div>`,
        engineCode: () => `
    async function voteCandidate(){
        if(!signer){toast('error','Hãy kết nối ví trước!');return;}
        const ci=document.getElementById('vote-contract'),vi=document.getElementById('vote-id');
        if(!ci||!ci.value.trim()||ci.value.trim().length!==42){toast('error','Hãy nhập đúng địa chỉ Contract Vote!');return;}
        if(!vi||vi.value===''){toast('error','Hãy nhập số ứng viên!');return;}
        try{
            const c=new ethers.Contract(ci.value.trim(),["function vote(uint256) public"],signer);
            toast('info','Đang bỏ phiếu...');const tx=await c.vote(parseInt(vi.value));await tx.wait();
            toast('success','Bỏ phiếu thành công!');
        }catch(e){toast('error',e.reason||e.message);}
    }`,
        bindings: [{btn:"vote-btn",fn:"voteCandidate"}]
    },

    // ==================== KHỐI 7: DONATE ETH (ĐỘC LẬP) ====================
    {
        id: "donate",
        name: "💝 Quyên Góp ETH",
        desc: "Gửi ETH trực tiếp đến địa chỉ",
        color: "#f43f5e",
        label: "Quyên góp",
        preview: () => `
            <div class="pv-input" style="font-size:11px;color:#64748b;">Địa chỉ ví nhận: 0xabc...xyz</div>
            <div class="pv-input">Số ETH muốn góp...</div>
            <div class="pv-btn" style="background:#f43f5e;">💝 Gửi Quyên Góp</div>`,
        exportHtml: () => `
    <div class="khoi" style="border-left-color:#f43f5e;">
        <div class="khoi-title">Quyên góp</div>
        <input id="donate-to" type="text" placeholder="Địa chỉ ví nhận quyên góp (0x...)">
        <input id="donate-amount" type="number" step="0.001" placeholder="Số ETH muốn góp...">
        <button id="donate-btn" style="background:#f43f5e;">💝 Gửi Quyên Góp</button>
    </div>`,
        engineCode: () => `
    async function donateETH(){
        if(!signer){toast('error','Hãy kết nối ví trước!');return;}
        const ti=document.getElementById('donate-to'),ai=document.getElementById('donate-amount');
        if(!ti||!ti.value.trim()||ti.value.trim().length!==42){toast('error','Hãy nhập đúng địa chỉ ví nhận!');return;}
        if(!ai||!ai.value||Number(ai.value)<=0){toast('error','Nhập số ETH hợp lệ!');return;}
        try{
            toast('info','Đang gửi '+ai.value+' ETH...');
            const tx=await signer.sendTransaction({to:ti.value.trim(),value:ethers.utils.parseEther(ai.value)});
            await tx.wait();toast('success','Quyên góp thành công!');ai.value='';
        }catch(e){toast('error',e.reason||e.message);}
    }`,
        bindings: [{btn:"donate-btn",fn:"donateETH"}]
    }
];
