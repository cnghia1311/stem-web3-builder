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
        bindings: [{ btn: "web3-connect", fn: "connectWallet" }]
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
        bindings: [{ btn: "bal-check", fn: "checkBalance" }]
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
        bindings: [{ btn: "claim-btn", fn: "claimToken" }]
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
        bindings: [{ btn: "tf-btn", fn: "transferToken" }, { btn: "tf-select", fn: "onTokenChange", event: "change" }]
    },


    // ==================== KHỐI 4: GIAO DỊCH UNISWAP V3 ====================
    {
        id: "uniswap-v3-sell",
        name: "🦄 Trạm Hoán Đổi (Swap V3)",
        desc: "Giao diện Swap đa mạng với Uniswap V3. Hỗ trợ hoán đổi Native Token và ERC-20.",
        color: "#1e293b",
        label: "DeFi - Thanh Khoản",
        preview: (tk) => {
            return `
            <div style="padding:15px;background:#0f172a;border-radius:10px;border-left:4px solid #ec4899;box-shadow:0 4px 15px rgba(236,72,153,0.2);">
                <div style="color:#f472b6;font-size:12px;font-weight:bold;margin-bottom:10px;display:flex;align-items:center;">
                    <span style="font-size:16px;margin-right:5px;">🦄</span> TRẠM HOÁN ĐỔI UNISWAP V3
                </div>
                <div style="display:flex;gap:5px;margin-bottom:10px;">
                    <select class="pv-input" disabled style="width:100px;font-size:9px;padding:3px;"><option>Sepolia</option></select>
                    <select class="pv-input" disabled style="width:70px;font-size:9px;padding:3px;"><option>0.3% Fee</option></select>
                </div>
                <div style="background:#1e293b;padding:8px;border-radius:8px;margin-bottom:5px;">
                    <div style="font-size:9px;color:#cbd5e1;margin-bottom:3px;">Đồng bán (Token IN)</div>
                    <div style="display:flex;gap:5px;">
                        <span style="font-size:10px;color:#38bdf8;">Native (ETH)</span>
                    </div>
                </div>
                <div style="background:#1e293b;padding:8px;border-radius:8px;margin-bottom:10px;">
                    <div style="font-size:9px;color:#cbd5e1;margin-bottom:3px;">Đồng mua (Token OUT)</div>
                    <div style="display:flex;gap:5px;">
                        <span style="font-size:10px;color:#fca5a5;">ERC-20: 0x...</span>
                    </div>
                </div>
                <button class="pv-btn" disabled style="background:#ec4899;padding:6px;width:100%;font-size:10px;">🚀 SWAP</button>
            </div>`;
        },
        exportHtml: (tk) => {
            return `
    <div class="khoi" style="border-left-color:#ec4899;background:rgba(236,72,153,0.05);padding:20px;max-width:450px;margin:0 auto;">
        <div class="khoi-title" style="color:#f472b6;font-size:14px;display:flex;align-items:center;margin-bottom:15px;justify-content:center;">
            <span style="font-size:22px;margin-right:8px;">🦄</span> TRẠM HOÁN ĐỔI V3
        </div>

        <div style="display:flex;gap:10px;margin-bottom:15px;">
            <select id="swap-network-sel" style="flex:1;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;">
                <option value="sepolia">Sepolia Testnet (ETH)</option>
                <option value="ethereum">Ethereum Mainnet (ETH)</option>
                <option value="base">Base (ETH)</option>
                <option value="bsc">BNB Smart Chain (BNB)</option>
                <option value="polygon">Polygon POS (MATIC)</option>
                <option value="arbitrum">Arbitrum (ETH)</option>
            </select>
            <select id="swap-fee-sel" style="width:110px;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;">
                <option value="500">0.05%</option>
                <option value="3000" selected>0.3%</option>
                <option value="10000">1%</option>
            </select>
        </div>

        <!-- Token IN -->
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:10px;position:relative;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:8px;font-weight:bold;">Đồng bạn bán (Token IN)</label>
            <div style="display:flex;gap:15px;margin-bottom:10px;">
                <label style="font-size:13px;color:#e2e8f0;display:flex;align-items:center;cursor:pointer;">
                    <input type="radio" name="token_in_type" value="native" checked style="margin-right:5px;accent-color:#ec4899;"> Native Token
                </label>
                <label style="font-size:13px;color:#e2e8f0;display:flex;align-items:center;cursor:pointer;">
                    <input type="radio" name="token_in_type" value="erc20" style="margin-right:5px;accent-color:#ec4899;"> ERC-20
                </label>
            </div>
            <input type="text" id="swap-in-addr" disabled placeholder="Native Token (Tự động)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:10px;opacity:0.6;">
            <input type="number" id="swap-amount" placeholder="0.0" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ec4899;background:#1e293b;color:white;font-size:18px;font-weight:bold;outline:none;">
        </div>

        <div style="text-align:center;margin:-15px 0;position:relative;z-index:10;">
            <div style="display:inline-flex;background:#1e293b;border:4px solid #0f172a;border-radius:50%;padding:8px;color:#94a3b8;cursor:pointer;">
                ⬇️
            </div>
        </div>

        <!-- Token OUT -->
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:20px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:8px;font-weight:bold;">Đồng bạn mua (Token OUT)</label>
            <div style="display:flex;gap:15px;margin-bottom:10px;">
                <label style="font-size:13px;color:#e2e8f0;display:flex;align-items:center;cursor:pointer;">
                    <input type="radio" name="token_out_type" value="native" style="margin-right:5px;accent-color:#ec4899;"> Native Token
                </label>
                <label style="font-size:13px;color:#e2e8f0;display:flex;align-items:center;cursor:pointer;">
                    <input type="radio" name="token_out_type" value="erc20" checked style="margin-right:5px;accent-color:#ec4899;"> ERC-20
                </label>
            </div>
            <input type="text" id="swap-out-addr" placeholder="Địa chỉ Token ERC-20 (0x...)" value="0x6AECC697301E8867052C2D8fB03F68ef809a1A40" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;">
        </div>

        <button id="swap-execute-btn" style="background:linear-gradient(45deg, #ec4899, #f43f5e);width:100%;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;color:white;transition:all 0.2s;box-shadow:0 4px 15px rgba(236,72,153,0.3);">🚀 THỰC HIỆN SWAP</button>
        <div id="swap-status" style="margin-top:15px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>
    </div>`;
        },
        engineCode: (pfx) => {
            return `
    {
        const NETWORKS = {
            "sepolia":  { r: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E", w: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" },
            "ethereum": { r: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", w: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
            "base":     { r: "0x2626664c2603336E57B271c5C0b26F421741e481", w: "0x4200000000000000000000000000000000000006" },
            "bsc":      { r: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2", w: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
            "polygon":  { r: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", w: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" },
            "arbitrum": { r: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", w: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" }
        };

        const inRadios = document.querySelectorAll('${pfx}-\\[name="token_in_type"\\]');
        // Wait, exportEngine replaces id="...", but not name="..."! So they stay as name="token_in_type".
        // To be safe and isolated, we look within the block container.
        const btnId = '${pfx}-swap-execute-btn';
        const execBtn = document.getElementById(btnId);
        
        if (execBtn) {
            const container = execBtn.closest('.khoi');
            const inRadios = container.querySelectorAll('input[name="token_in_type"]');
            const outRadios = container.querySelectorAll('input[name="token_out_type"]');
            const inAddr = container.querySelector('#${pfx}-swap-in-addr');
            const outAddr = container.querySelector('#${pfx}-swap-out-addr');
            const amtInp = container.querySelector('#${pfx}-swap-amount');
            const netSel = container.querySelector('#${pfx}-swap-network-sel');
            const feeSel = container.querySelector('#${pfx}-swap-fee-sel');
            const stt = container.querySelector('#${pfx}-swap-status');

            function updateInputs() {
                const isEqIn = [...inRadios].find(r=>r.checked).value;
                const isEqOut = [...outRadios].find(r=>r.checked).value;
                
                if (isEqIn === 'native') {
                    inAddr.disabled = true;
                    inAddr.placeholder = "Native Token (Tự động Wrap)";
                    inAddr.style.opacity = '0.6';
                } else {
                    inAddr.disabled = false;
                    inAddr.placeholder = "Địa chỉ Token ERC-20 (0x...)";
                    inAddr.style.opacity = '1';
                }

                if (isEqOut === 'native') {
                    outAddr.disabled = true;
                    outAddr.placeholder = "Native Token (Tự động Unwrap)";
                    outAddr.style.opacity = '0.6';
                } else {
                    outAddr.disabled = false;
                    outAddr.placeholder = "Địa chỉ Token ERC-20 (0x...)";
                    outAddr.style.opacity = '1';
                }
            }

            inRadios.forEach(r => r.addEventListener('change', updateInputs));
            outRadios.forEach(r => r.addEventListener('change', updateInputs));
            updateInputs();

            execBtn.addEventListener('click', async () => {
                if(typeof window.signer === 'undefined' || !window.signer){
                    toast('error', 'Cần Kết Nối Ví (🦊) trước!'); return;
                }

                try {
                    execBtn.disabled = true;
                    execBtn.style.opacity = "0.5";
                    stt.innerText = "Chuẩn bị giao dịch...";

                    const amtVal = amtInp.value.trim();
                    if(!amtVal || isNaN(amtVal) || Number(amtVal) <= 0) {
                        throw new Error('Nhập số lượng hợp lệ!');
                    }

                    const isEqIn = [...inRadios].find(r=>r.checked).value;
                    const isEqOut = [...outRadios].find(r=>r.checked).value;

                    if (isEqIn === 'native' && isEqOut === 'native') {
                        throw new Error('Không thể Swap Native sang Native!');
                    }

                    const net = netSel.value;
                    if (!NETWORKS[net]) throw new Error('Mạng không được hỗ trợ!');
                    const V3_ROUTER = NETWORKS[net].r;
                    const WETH = NETWORKS[net].w;
                    const FEE = parseInt(feeSel.value);

                    let tokenIn = isEqIn === 'native' ? WETH : inAddr.value.trim();
                    let tokenOut = isEqOut === 'native' ? WETH : outAddr.value.trim();

                    if (!tokenIn || !tokenIn.startsWith('0x') || tokenIn.length !== 42) throw new Error('Địa chỉ Token IN không hợp lệ');
                    if (!tokenOut || !tokenOut.startsWith('0x') || tokenOut.length !== 42) throw new Error('Địa chỉ Token OUT không hợp lệ');

                    const routerAbi = [
                        "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
                        "function unwrapWETH9(uint256 amountMinimum, address recipient) payable",
                        "function multicall(uint256 deadline, bytes[] data) payable returns (bytes[] results)"
                    ];
                    const router = new ethers.Contract(V3_ROUTER, routerAbi, window.signer);
                    const iface = new ethers.utils.Interface(routerAbi);
                    const userAddr = await window.signer.getAddress();

                    if (isEqIn === 'native') {
                        // NATIVE -> ERC20: Send native ETH, exactInputSingle handles Wrap internally if WETH is tokenIn and msg.value is sent
                        stt.innerText = "Kiểm tra số dư Native Token...";
                        const ethAmount = ethers.utils.parseEther(amtVal);
                        const ethBal = await window.provider.getBalance(userAddr);
                        if(ethBal.lt(ethAmount)) throw new Error('Không đủ số dư Native Token!');

                        stt.innerHTML = '<span style="color:#3b82f6;">Chờ ký xác nhận Swap trên MetaMask...</span>';
                        const tx = await router.exactInputSingle({
                            tokenIn: WETH,
                            tokenOut: tokenOut,
                            fee: FEE,
                            recipient: userAddr,
                            amountIn: ethAmount,
                            amountOutMinimum: 0,
                            sqrtPriceLimitX96: 0
                        }, { value: ethAmount });

                        stt.innerText = 'Đợi Blockchain xác nhận...';
                        await tx.wait();
                        stt.innerHTML = '<span style="color:#10b981;">🎉 SWAP THÀNH CÔNG!</span>';
                        toast('success', 'Swap Native Token thành công!');

                    } else if (isEqOut === 'native') {
                        // ERC20 -> NATIVE: Approve, Multicall(Swap ERC20->WETH, UnwrapWETH9)
                        const erc20Abi = ["function approve(address,uint256) returns(bool)", "function decimals() view returns(uint8)"];
                        const tIn = new ethers.Contract(tokenIn, erc20Abi, window.signer);
                        let dec = 18; try { dec = await tIn.decimals(); }catch(e){}
                        const amtTIn = ethers.utils.parseUnits(amtVal, dec);

                        stt.innerText = "Đang xin quyền chuyển Token (Approve)... (1/2)";
                        const txA = await tIn.approve(V3_ROUTER, ethers.constants.MaxUint256);
                        await txA.wait();

                        stt.innerHTML = '<span style="color:#3b82f6;">Chờ ký giao dịch Swap + Unwrap... (2/2)</span>';
                        const callSwap = iface.encodeFunctionData('exactInputSingle', [{
                            tokenIn: tokenIn,
                            tokenOut: WETH,
                            fee: FEE,
                            recipient: V3_ROUTER, // Router holds WETH temporarily
                            amountIn: amtTIn,
                            amountOutMinimum: 0,
                            sqrtPriceLimitX96: 0
                        }]);
                        const callUnwrap = iface.encodeFunctionData('unwrapWETH9', [0, userAddr]);
                        const deadline = Math.floor(Date.now()/1000) + 600;

                        const txS = await router.multicall(deadline, [callSwap, callUnwrap]);
                        stt.innerText = 'Đợi Blockchain xác nhận...';
                        await txS.wait();
                        stt.innerHTML = '<span style="color:#10b981;">🎉 SWAP THÀNH CÔNG! Đã nhận Native Token.</span>';
                        toast('success', 'Swap nhận Native Token thành công!');

                    } else {
                        // ERC20 -> ERC20: Approve, exactInputSingle
                        const erc20Abi = ["function approve(address,uint256) returns(bool)", "function decimals() view returns(uint8)"];
                        const tIn = new ethers.Contract(tokenIn, erc20Abi, window.signer);
                        let dec = 18; try { dec = await tIn.decimals(); }catch(e){}
                        const amtTIn = ethers.utils.parseUnits(amtVal, dec);

                        stt.innerText = "Đang xin quyền chuyển Token (Approve)... (1/2)";
                        const txA = await tIn.approve(V3_ROUTER, ethers.constants.MaxUint256);
                        await txA.wait();

                        stt.innerHTML = '<span style="color:#3b82f6;">Chờ ký giao dịch Swap... (2/2)</span>';
                        const tx = await router.exactInputSingle({
                            tokenIn: tokenIn,
                            tokenOut: tokenOut,
                            fee: FEE,
                            recipient: userAddr,
                            amountIn: amtTIn,
                            amountOutMinimum: 0,
                            sqrtPriceLimitX96: 0
                        });
                        stt.innerText = 'Đợi Blockchain xác nhận...';
                        await tx.wait();
                        stt.innerHTML = '<span style="color:#10b981;">🎉 SWAP THÀNH CÔNG!</span>';
                        toast('success', 'Swap Token ERC-20 thành công!');
                    }

                    if(window.stemEvents) window.stemEvents.dispatchEvent(new Event('GIAO_DICH_THANH_CONG'));

                } catch (e) {
                    console.error(e);
                    let msg = e.reason || e.message;
                    if(msg.includes('user rejected')) msg = "Bạn đã từ chối ký giao dịch!";
                    if(msg.includes('TF')) msg = "Pool không tồn tại hoặc hết thanh khoản!";
                    stt.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0,80) + '</span>';
                    toast('error', msg);
                } finally {
                    execBtn.disabled = false;
                    execBtn.style.opacity = "1";
                }
            });
        }
    }
            `;
        }
    },
    // ==================== KHỐI 5: BIỂU ĐỒ GECKOTERMINAL ====================
    {
        id: "gecko-chart",
        name: "📈 Biểu Đồ Giá (GeckoTerminal)",
        desc: "Nhúng biểu đồ nến Nhật từ GeckoTerminal để phân tích giá Token.",
        color: "#1e293b",
        label: "Trạm Phân Tích Dữ Liệu",
        preview: (tk) => {
            return `
            <div style="padding:15px;background:#0f172a;border-radius:10px;border-left:4px solid #3b82f6;box-shadow:0 4px 15px rgba(59,130,246,0.2);">
                <div style="color:#60a5fa;font-size:12px;font-weight:bold;margin-bottom:10px;display:flex;align-items:center;">
                    <span style="font-size:16px;margin-right:5px;">📈</span> BIỂU ĐỒ GIÁ (NẾN NHẬT)
                </div>
                <div style="display:flex;gap:5px;margin-bottom:10px;">
                    <select class="pv-input" disabled style="width:100px;font-size:9px;padding:3px;"><option>Sepolia</option></select>
                    <input class="pv-input" disabled placeholder="Pool 0x..." style="flex:1;font-size:9px;padding:3px;" />
                    <button class="pv-btn" disabled style="background:#3b82f6;padding:3px 6px;font-size:9px;">Tải</button>
                </div>
                <div style="height:50px;background:#1e293b;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:10px;border:1px dashed #334155;">
                    <span style="font-size:20px;">📊</span>
                </div>
            </div>`;
        },
        exportHtml: (tk) => {
            return `
    <div class="khoi" style="border-left-color:#3b82f6;background:rgba(59,130,246,0.05);padding:15px;">
        <div class="khoi-title" style="color:#60a5fa;font-size:13px;display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:18px;margin-right:5px;">📈</span> BIỂU ĐỒ GIÁ TRỰC TIẾP
        </div>
        <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
             <select class="gecko-net-sel" style="width:160px;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;margin-bottom:0;">
                 <option value="sepolia-testnet">Sepolia Testnet</option>
                 <option value="eth">Ethereum Mainnet</option>
                 <option value="bsc">BNB Smart Chain</option>
                 <option value="polygon_pos">Polygon POS</option>
                 <option value="base">Base</option>
                 <option value="arbitrum">Arbitrum</option>
             </select>
             <input type="text" class="gecko-pool-inp" placeholder="Địa chỉ Pool (0x...)" value="0xB09f73508e137B772F5ed0464badF99b6e3290A4" style="flex:1;min-width:200px;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;margin-bottom:0;">
             <button onclick="var c=this.closest('.khoi');var net=c.querySelector('.gecko-net-sel').value;var pool=c.querySelector('.gecko-pool-inp').value.trim();var iframe=c.querySelector('iframe');if(pool&amp;&amp;pool.length===42&amp;&amp;pool.startsWith('0x')){iframe.src='https://www.geckoterminal.com/'+net+'/pools/'+pool+'?embed=1&amp;info=0&amp;swaps=0';}else{alert('Pool không hợp lệ (42 ký tự, bắt đầu 0x)');}" style="background:#3b82f6;color:white;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:bold;cursor:pointer;width:auto;margin-top:0;">Tải</button>
        </div>
        <div style="width:100%;height:500px;border-radius:10px;overflow:hidden;border:1px solid #334155;background:#0f172a;">
            <iframe 
                height="100%" 
                width="100%" 
                title="GeckoTerminal Chart" 
                src="https://www.geckoterminal.com/sepolia-testnet/pools/0xB09f73508e137B772F5ed0464badF99b6e3290A4?embed=1&info=0&swaps=0" 
                frameborder="0" 
                allow="clipboard-write" 
                allowfullscreen>
            </iframe>
        </div>
        <p style="font-size:10px;color:#64748b;text-align:center;margin-top:8px;">Dữ liệu cung cấp bởi GeckoTerminal</p>
    </div>`;
        },
        engineCode: () => ''
    },

    // ==================== KHỐI 6: LỊCH SỬ GIAO DỊCH GECKOTERMINAL ====================
    {
        id: "gecko-txns",
        name: "📊 Lịch Sử Giao Dịch (GeckoTerminal)",
        desc: "Xem lịch sử giao dịch mua/bán realtime từ GeckoTerminal.",
        color: "#0f766e",
        label: "Trạm Phân Tích Dữ Liệu",
        preview: (tk) => {
            return `
            <div style="padding:15px;background:#042f2e;border-radius:10px;border-left:4px solid #14b8a6;box-shadow:0 4px 15px rgba(20,184,166,0.2);">
                <div style="color:#2dd4bf;font-size:12px;font-weight:bold;margin-bottom:10px;display:flex;align-items:center;">
                    <span style="font-size:16px;margin-right:5px;">📊</span> LỊCH SỬ GIAO DỊCH
                </div>
                <div style="display:flex;gap:5px;margin-bottom:10px;">
                    <select class="pv-input" disabled style="width:100px;font-size:9px;padding:3px;"><option>Sepolia</option></select>
                    <input class="pv-input" disabled placeholder="Pool 0x..." style="flex:1;font-size:9px;padding:3px;" />
                    <button class="pv-btn" disabled style="background:#14b8a6;padding:3px 6px;font-size:9px;">Tải</button>
                </div>
                <div style="font-size:8px;color:#5eead4;margin-top:6px;">
                    <div style="display:flex;justify-content:space-between;padding:3px 5px;background:rgba(16,185,129,0.1);border-radius:3px;margin-bottom:2px;">
                        <span>🟢 BUY</span><span>0.05 ETH</span><span style="color:#10b981;">$128</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:3px 5px;background:rgba(239,68,68,0.1);border-radius:3px;margin-bottom:2px;">
                        <span>🔴 SELL</span><span>1.2 ETH</span><span style="color:#ef4444;">$2,457</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:3px 5px;background:rgba(16,185,129,0.1);border-radius:3px;">
                        <span>🟢 BUY</span><span>0.03 ETH</span><span style="color:#10b981;">$60</span>
                    </div>
                </div>
            </div>`;
        },
        exportHtml: (tk) => {
            return `
    <div class="khoi" style="border-left-color:#14b8a6;background:rgba(20,184,166,0.05);padding:15px;">
        <div class="khoi-title" style="color:#2dd4bf;font-size:13px;display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:18px;margin-right:5px;">📊</span> LỊCH SỬ GIAO DỊCH TRỰC TIẾP
        </div>
        <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
             <select class="gecko-net-sel" style="width:160px;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;margin-bottom:0;">
                 <option value="sepolia-testnet">Sepolia Testnet</option>
                 <option value="eth">Ethereum Mainnet</option>
                 <option value="bsc">BNB Smart Chain</option>
                 <option value="polygon_pos">Polygon POS</option>
                 <option value="base">Base</option>
                 <option value="arbitrum">Arbitrum</option>
             </select>
             <input type="text" class="gecko-pool-inp" placeholder="Địa chỉ Pool (0x...)" value="0xB09f73508e137B772F5ed0464badF99b6e3290A4" style="flex:1;min-width:200px;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;margin-bottom:0;">
             <button onclick="var c=this.closest('.khoi');var net=c.querySelector('.gecko-net-sel').value;var pool=c.querySelector('.gecko-pool-inp').value.trim();var iframe=c.querySelector('iframe');if(pool&amp;&amp;pool.length===42&amp;&amp;pool.startsWith('0x')){iframe.src='https://www.geckoterminal.com/'+net+'/pools/'+pool+'?embed=1&amp;info=1&amp;swaps=1';}else{alert('Pool không hợp lệ (42 ký tự, bắt đầu 0x)');}" style="background:#14b8a6;color:white;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:bold;cursor:pointer;width:auto;margin-top:0;">Tải</button>
        </div>
        <div style="width:100%;height:500px;border-radius:10px;overflow:hidden;border:1px solid #334155;background:#0f172a;position:relative;">
            <iframe 
                height="1200px" 
                width="100%" 
                title="GeckoTerminal Transactions"
                style="position:absolute;top:-580px;left:0;" 
                src="https://www.geckoterminal.com/sepolia-testnet/pools/0xB09f73508e137B772F5ed0464badF99b6e3290A4?embed=1&info=1&swaps=1" 
                frameborder="0" 
                allow="clipboard-write" 
                allowfullscreen>
            </iframe>
        </div>
        <p style="font-size:10px;color:#64748b;text-align:center;margin-top:8px;">Dữ liệu cung cấp bởi GeckoTerminal</p>
    </div>`;
        },
        engineCode: () => ''
    },

    // ==================== KHỐI 8: GACHA DROP ====================
    {
        id: "gacha-drop",
        name: "🎰 Máy Gacha NFT",
        desc: "Đập hộp NFT Random từ Thirdweb Drop, tự động rút và bắn pháo hoa",
        color: "#f59e0b",
        label: "Máy Gacha Cực Phẩm",
        preview: () => `
            <div style="text-align:center;padding:10px;">
                <div style="font-size:40px;margin-bottom:10px;">🎁</div>
                <div class="pv-input">Dán mã Contract Gacha (0x...)</div>
                <div class="pv-btn" style="background:#f59e0b;">🎰 MỞ HỘP NGAY</div>
            </div>`,
        exportHtml: () => `
    <div class="khoi" style="border-left-color:#f59e0b;text-align:center;">
        <div class="khoi-title" style="color:#fbbf24;text-align:left;">🎰 MÁY GACHA ĐẬP HỘP</div>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
        
        <input type="text" id="gacha-contract" placeholder="🤖 Yêu cầu người chơi nhập Contract Gacha (0x...)" style="background:#1e293b;color:#fff;border-color:#334155;margin-bottom:15px;width:100%;padding:10px;border-radius:6px;font-size:12px;">
        
        <div id="gacha-display" style="background:#1e293b;border-radius:10px;padding:20px;margin-bottom:15px;border:2px dashed #475569;position:relative;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div id="gacha-image" style="font-size:80px;animation: pulse 2s infinite;">🎁</div>
            <img id="gacha-result-img" src="" style="display:none;width:100%;max-width:200px;border-radius:10px;box-shadow:0 10px 25px rgba(245,158,11,0.5);margin:10px 0;">
            <div id="gacha-name" style="color:#fbbf24;font-weight:bold;font-size:16px;margin-top:10px;display:none;"></div>
            <div id="gacha-desc" style="color:#94a3b8;font-size:11px;margin-top:5px;display:none;"></div>
        </div>
        
        <div id="gacha-stats" style="font-size:11px;color:#94a3b8;margin-bottom:10px;">Đợi dán Contract để quét số lượng...</div>
        
        <button id="gacha-btn" style="background:linear-gradient(45deg, #d97706, #f59e0b);width:100%;padding:15px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(245, 158, 11, 0.4);cursor:pointer;text-transform:uppercase;letter-spacing:1px;">🎰 MỞ HỘP NGAY (0 ETH)</button>
        
        <style>
            @keyframes pulse { 0% {transform: scale(1);} 50% {transform: scale(1.05);} 100% {transform: scale(1);} }
            .shake-anim { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite; }
            @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        </style>
    </div>`,
        engineCode: (pfx) => `
    async function loadGachaStats() {
        if(!signer) return;
        const ci = document.getElementById('gacha-contract');
        const stats = document.getElementById('gacha-stats');
        if(!ci || ci.value.length !== 42) return;
        try {
            const c = new ethers.Contract(ci.value.trim(), ["function nextTokenIdToClaim() view returns (uint256)"], signer);
            const total = await c.nextTokenIdToClaim();
            stats.innerHTML = '🔥 Đã có <b>' + total.toString() + '</b> hộp được mở trên thế giới!';
        } catch(e) {
            stats.innerText = 'Chưa quét được thông số máy (Lỗi hoặc Contract sai)...';
        }
    }

    async function openGacha() {
        if(!signer){toast('error','Vui lòng Kết nối Ví trước!');return;}
        const ci = document.getElementById('gacha-contract');
        const btn = document.getElementById('gacha-btn');
        const imgIcon = document.getElementById('gacha-image');
        const resImg = document.getElementById('gacha-result-img');
        const resName = document.getElementById('gacha-name');
        const resDesc = document.getElementById('gacha-desc');
        
        if(!ci || ci.value.length !== 42) {
            toast('error', 'Vui lòng nhập Địa chỉ Contract Gacha hợp lệ!');
            return;
        }

        try {
            // Chuẩn bị Hợp đồng Thridweb Drop
            const c = new ethers.Contract(ci.value.trim(), [
                "function claim(address receiver, uint256 quantity, address currency, uint256 pricePerToken, tuple(bytes32[] proof, uint256 maxQuantityInAllowlist, uint256 pricePerToken, address currency) allowlistProof, bytes memory data) payable",
                "function tokenURI(uint256) view returns (string)",
                "event TokensClaimed(uint256 indexed claimConditionIndex, address indexed claimer, address indexed receiver, uint256 startTokenId, uint256 quantityClaimed)"
            ], signer);

            btn.disabled = true;
            btn.innerText = '⏳ ĐANG RÚT... CẦU NGUYỆN ĐI!!!';
            imgIcon.style.display = 'block';
            imgIcon.classList.add('shake-anim');
            resImg.style.display = 'none';
            resName.style.display = 'none';
            resDesc.style.display = 'none';

            // Tham số mặc định cho Public Free Mint
            const userAddr = await signer.getAddress();
            const currency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
            const proof = [[], 0, 0, "0x0000000000000000000000000000000000000000"];
            
            toast('info', 'Xác nhận giao dịch mở hộp trong MetaMask...');
            const tx = await c.claim(userAddr, 1, currency, 0, proof, "0x", { value: 0 });
            
            btn.innerText = '🔥 ĐANG MỞ NẮP...';
            toast('info', 'Đang đợi Blockchain xác nhận...');
            const receipt = await tx.wait();
            
            // Tìm sự kiện TokensClaimed để lấy Token ID
            let mintedId = null;
            if (receipt.events) {
                for(const event of receipt.events) {
                    if(event.event === 'TokensClaimed' && event.args) {
                        mintedId = event.args.startTokenId;
                        break;
                    }
                }
            }
            if(mintedId === null) {
                // Fallback nếu không parse được sự kiện (hoặc thirdweb lồng sự kiện)
                toast('info', 'Nhận diện thủ công TokenID...');
                const currentTotal = await c.nextTokenIdToClaim().catch(()=>1);
                mintedId = currentTotal > 0 ? currentTotal - 1 : 0;
            }

            // Lấy Metadata
            const rawUri = await c.tokenURI(mintedId);
            const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            
            btn.innerText = '📦 ĐANG KIỂM TRA ĐỒ RỚT RA...';
            const res = await fetch(ipfsUri);
            const metadata = await res.json();
            
            // Xóa hiệu ứng lắc
            imgIcon.classList.remove('shake-anim');
            imgIcon.style.display = 'none';
            
            // Hiển thị ảnh
            resImg.src = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
            resImg.style.display = 'block';
            resName.innerText = metadata.name || 'Vật phẩm bí ẩn #' + mintedId;
            resName.style.display = 'block';
            resDesc.innerText = metadata.description || 'Chúc mừng bạn trúng vật phẩm này!';
            resDesc.style.display = 'block';

            // Bắn pháo hoa 🎉
            if(typeof window.confetti === 'function') {
                window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#fff'] });
            }
            
            toast('success', 'Bạn vừa mở thành công: ' + resName.innerText);
            btn.innerText = '🎰 MỞ TIẾP HỘP NỮA';
            btn.disabled = false;
            
            loadGachaStats();
            
            // Nếu trên trang có khối gallery tự kích hoạt lại
            if(window.refreshAllBalances) window.refreshAllBalances();
            
        } catch(e) {
            imgIcon.classList.remove('shake-anim');
            btn.disabled = false;
            btn.innerText = '🎰 MỞ HỘP NGAY (0 ETH)';
            toast('error', e.reason || e.message || 'Có lỗi xảy ra!');
        }
    }
    `,
        bindings: [
            { btn: "gacha-btn", fn: "openGacha" },
            { btn: "gacha-contract", fn: "loadGachaStats", event: "change" }
        ]
    },

    // ==================== KHỐI 9: DROP GALLERY (TỦ KÍNH HÀNH TRANG) ====================
    {
        id: "drop-gallery",
        name: "🖼️ Tủ Kính Hành Trang",
        desc: "Hiển thị toàn bộ thẻ NFT/Bằng khen đang sở hữu",
        color: "#8b5cf6",
        label: "Hành Trang",
        preview: () => `
            <div style="text-align:center;padding:10px;">
                <div style="font-size:30px;margin-bottom:10px;">🎒</div>
                <div class="pv-input">Dán mã Contract (0x...)</div>
                <div class="pv-btn" style="background:#8b5cf6;">🔍 Quét Lại Tủ Đồ</div>
            </div>`,
        exportHtml: () => `
    <div class="khoi" style="border-left-color:#8b5cf6;">
        <div class="khoi-title" style="color:#a78bfa;">🎒 TỦ KÍNH HÀNH TRANG</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Tự động load toàn bộ NFT bạn đang sở hữu. Bạn phải dán đúng địa chỉ Contract Gacha/Drop để tải ảnh.</p>
        
        <input type="text" id="gallery-contract" placeholder="🤖 Nhập Contract NFT (0x...)" style="background:#0f172a;color:#fff;border-color:#334155;margin-bottom:10px;width:100%;padding:10px;border-radius:6px;font-size:12px;">
        
        <button id="gallery-btn" style="background:linear-gradient(45deg, #7c3aed, #8b5cf6);width:100%;padding:10px;border-radius:8px;border:none;color:white;font-weight:bold;cursor:pointer;margin-bottom:15px;">🔍 TẢI LẠI TỦ ĐỒ</button>
        
        <div id="gallery-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr));gap:10px;">
            <div style="text-align:center;grid-column:1/-1;color:#64748b;font-size:12px;padding:20px;">
                Chưa có dữ liệu...
            </div>
        </div>
    </div>`,
        engineCode: (pfx) => `
    async function loadGallery() {
        // Tủ đồ cũng có thể coi như một hành động Refresh
        if(!signer){return;} // im lặng nếu chưa có ví
        const ci = document.getElementById('gallery-contract');
        const grid = document.getElementById('gallery-grid');
        const btn = document.getElementById('gallery-btn');
        
        if(!ci || ci.value.length !== 42) {
            return; // Đợi nhập
        }

        try {
            const userAddr = await signer.getAddress();
            const c = new ethers.Contract(ci.value.trim(), [
                "function tokensOfOwner(address owner) view returns (uint256[])",
                "function tokenURI(uint256) view returns (string)",
                "function balanceOf(address) view returns (uint256)",
                "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
                "function ownerOf(uint256) view returns (address)",
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
            ], signer);

            btn.innerText = '⏳ ĐANG TÌM ĐỒ...';
            btn.disabled = true;
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#a78bfa;font-size:12px;">Đang dò tìm trong Blockchain...</div>';

            let tokenIds = [];
            try {
                // Thử hàm tokensOfOwner của Thirdweb
                const ids = await c.tokensOfOwner(userAddr);
                tokenIds = ids.map(id => id.toNumber ? id.toNumber() : Number(id)); // parse BigNumber
            } catch(e) {
                try {
                    // Cố gắng dùng queryFilter để tìm Transfer event (Giải pháp tối ưu cho contract không có Enumerable)
                    toast('info', 'Dò tìm dữ liệu lịch sử Blockchain...');
                    const filter = c.filters.Transfer(null, userAddr);
                    const events = await c.queryFilter(filter, -100000, "latest"); // quét 100k block gần nhất để tránh limit
                    
                    if (events.length === 0) {
                        // Thử quét xa hơn nếu RPC cho phép
                        try {
                            const allEvents = await c.queryFilter(filter, 0, "latest");
                            events.push(...allEvents);
                        } catch(rpcErr) {
                            console.log("RPC limit", rpcErr);
                        }
                    }
                    
                    const possibleIds = [...new Set(events.map(e => e.args[2] ? e.args[2].toString() : e.args.tokenId.toString()))];
                    
                    // Lọc lại xem user còn thực sự đang giữ không (chưa gửi cho người khác)
                    for(let pid of possibleIds) {
                        try {
                            const realOwner = await c.ownerOf(pid);
                            if(realOwner.toLowerCase() === userAddr.toLowerCase()) {
                                tokenIds.push(Number(pid));
                            }
                        } catch(e3) { } // token có thể bị burn
                    }
                    
                    if(tokenIds.length === 0 && events.length === 0) {
                        // Cú chót: Dò theo index thủ công (mò mẫm 0 -> 100)
                        toast('info', 'Chuyển sang chế độ tải mù (quét thử ID 0-50)...');
                        let hits = 0;
                        for(let i=0; i<=50; i++) {
                            try {
                                const ro = await c.ownerOf(i);
                                if(ro.toLowerCase() === userAddr.toLowerCase()) {
                                    tokenIds.push(i);
                                    hits++;
                                }
                            } catch(e4) {}
                        }
                    }
                } catch(e2) {
                    throw new Error("Contract này không hỗ trợ duyệt danh sách (Vui lòng đúc thẻ để kích hoạt dữ liệu).");
                }
            }

            if(tokenIds.length === 0) {
                grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#94a3b8;font-size:12px;padding:20px;">Trống rỗng! Bạn chưa sở hữu thẻ nào cả. Thử mở Gacha đi!</div>';
                btn.innerText = '🔍 TẢI LẠI TỦ ĐỒ';
                btn.disabled = false;
                return;
            }

            grid.innerHTML = '';
            for(let i=0; i<tokenIds.length; i++) {
                const id = tokenIds[i];
                try {
                    const rawUri = await c.tokenURI(id);
                    const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    const res = await fetch(ipfsUri);
                    const metadata = await res.json();
                    
                    const imgUrl = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
                    
                    const card = document.createElement('div');
                    card.style.background = '#1e293b';
                    card.style.borderRadius = '8px';
                    card.style.overflow = 'hidden';
                    card.style.border = '1px solid #334155';
                    card.innerHTML = \`
                        <div style="height:100px;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                            \${imgUrl ? \`<img src="\${imgUrl}" style="width:100%;height:100%;object-fit:cover;">\` : '<span style="font-size:20px;">🖼️</span>'}
                        </div>
                        <div style="padding:8px;">
                            <div style="font-size:10px;font-weight:bold;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${metadata.name || 'ID: '+id}</div>
                            <div style="font-size:8px;color:#94a3b8;margin-top:2px;">#\${id}</div>
                        </div>
                    \`;
                    grid.appendChild(card);
                } catch(err) {
                    console.log("Lỗi load thẻ", id, err);
                }
            }
            
            toast('success', 'Đã tải xong ' + tokenIds.length + ' vật phẩm!');
            btn.innerText = '🔍 TẢI LẠI TỦ ĐỒ';
            btn.disabled = false;

        } catch(e) {
            btn.innerText = '🔍 TẢI LẠI TỦ ĐỒ';
            btn.disabled = false;
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#ef4444;font-size:12px;padding:20px;">Lỗi: ' + (e.reason || e.message) + '</div>';
        }
    }
    
    // Auto load khi kết nối ví
    function refreshBalance() {
        const btn = document.getElementById('gallery-btn');
        if(!btn.disabled) loadGallery();
    }
    `,
        bindings: [
            { btn: "gallery-btn", fn: "loadGallery" },
            { btn: "gallery-contract", fn: "loadGallery", event: "change" }
        ]
    },

    // ==================== KHỐI 10: MARKET LIST (KÝ GỬI HÀNG) ====================
    {
        id: "market-list",
        name: "📦 Trạm Ký Gửi NFT",
        desc: "Niêm yết (List) NFT lên Marketplace Thirdweb để bán",
        color: "#ec4899",
        label: "Ký Gửi Lên Sàn",
        preview: () => `
            <div style="text-align:center;padding:8px;">
                <div style="font-size:30px;margin-bottom:6px;">📦</div>
                <div class="pv-input">Mã Chợ (0x...)</div>
                <div class="pv-input">Mã NFT + Token ID</div>
                <div class="pv-btn" style="background:#ec4899;">📋 NIÊM YẾT BÁN</div>
            </div>`,
        exportHtml: () => `
    <div class="khoi" style="border-left-color:#ec4899;">
        <div class="khoi-title" style="color:#f472b6;">📦 TRẠM KÝ GỬI HÀNG LÊN SÀN</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Đăng bán NFT của bạn lên Chợ. Hệ thống sẽ tự động Ủy quyền (Approve) rồi Niêm yết (Create Listing).</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="mlist-marketplace" placeholder="🏪 Mã Chợ Marketplace (0x...)" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-nft" placeholder="🖼️ Mã Hợp Đồng NFT (0x...)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="number" id="mlist-tokenid" placeholder="🆔 Token ID (VD: 0)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-currency" placeholder="💰 Tiền tệ (0xEee...=ETH)" value="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="mlist-price" placeholder="💲 Giá bán (VD: 0.01)" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>

        <button id="mlist-btn" style="background:linear-gradient(45deg, #db2777, #ec4899);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:12px;">📋 NIÊM YẾT BÁN HÀNG</button>

        <div id="mlist-result" style="display:none;background:#0f172a;border:1px solid #10b981;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:14px;color:#10b981;font-weight:bold;margin-bottom:5px;">🎉 NIÊM YẾT THÀNH CÔNG!</div>
            <div style="font-size:12px;color:#fbbf24;">🎫 Mã Đơn của bạn: <b id="mlist-listing-id">#?</b></div>
            <div style="font-size:10px;color:#94a3b8;margin-top:5px;">(Ghi nhớ mã này để Rút Hàng về nếu cần!)</div>
        </div>
    </div>`,
        engineCode: (pfx) => `
    async function listNFT() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mlist-marketplace').value.trim();
        const nftAddr = document.getElementById('mlist-nft').value.trim();
        const tokenId = document.getElementById('mlist-tokenid').value.trim();
        const currency = document.getElementById('mlist-currency').value.trim();
        const price = document.getElementById('mlist-price').value.trim();
        const btn = document.getElementById('mlist-btn');
        const result = document.getElementById('mlist-result');

        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Chợ Marketplace hợp lệ!'); return; }
        if(!nftAddr || nftAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng NFT hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!price || isNaN(price)) { toast('error','Nhập Giá Bán hợp lệ!'); return; }

        try {
            btn.disabled = true;
            result.style.display = 'none';

            // Bước 1: Approve NFT cho Marketplace
            btn.innerText = '🔑 BƯỚC 1: ỦY QUYỀN (APPROVE)...';
            toast('info', 'Ủy quyền NFT cho Chợ...');
            const nftContract = new ethers.Contract(nftAddr, [
                "function approve(address to, uint256 tokenId)",
                "function getApproved(uint256 tokenId) view returns (address)"
            ], signer);

            const approved = await nftContract.getApproved(tokenId);
            if(approved.toLowerCase() !== mpAddr.toLowerCase()) {
                const txApprove = await nftContract.approve(mpAddr, tokenId);
                await txApprove.wait();
                toast('success', 'Ủy quyền thành công!');
            } else {
                toast('info', 'Đã được ủy quyền sẵn, bỏ qua bước này.');
            }

            // Bước 2: Create Listing
            btn.innerText = '📋 BƯỚC 2: ĐĂNG BÁN...';
            toast('info', 'Đang tạo đơn niêm yết...');
            const mp = new ethers.Contract(mpAddr, [
                "function createListing(tuple(address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) params) returns (uint256 listingId)",
                "event NewListing(address indexed listingCreator, uint256 indexed listingId, address indexed assetContract, tuple(uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)"
            ], signer);

            const now = Math.floor(Date.now() / 1000);
            const oneYear = now + 365 * 24 * 60 * 60;
            const listing = {
                assetContract: nftAddr,
                tokenId: tokenId,
                quantity: 1,
                currency: currency,
                pricePerToken: ethers.utils.parseEther(price),
                startTimestamp: now,
                endTimestamp: oneYear,
                reserved: false
            };

            const txList = await mp.createListing(listing);
            toast('info', 'Đang đợi Blockchain xác nhận...');
            const receipt = await txList.wait();

            // Tìm Listing ID từ Event
            let listingId = '?';
            if(receipt.events) {
                for(const ev of receipt.events) {
                    if(ev.event === 'NewListing' && ev.args) {
                        listingId = ev.args.listingId.toString();
                        break;
                    }
                }
            }
            if(listingId === '?') {
                // Fallback: parse từ logs
                try {
                    const iface = new ethers.utils.Interface(["event NewListing(address indexed listingCreator, uint256 indexed listingId, address indexed assetContract, tuple(uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)"]);
                    for(const log of receipt.logs) {
                        try { const parsed = iface.parseLog(log); listingId = parsed.args.listingId.toString(); break; } catch(e){}
                    }
                } catch(e){}
            }

            result.style.display = 'block';
            document.getElementById('mlist-listing-id').innerText = '#' + listingId;
            toast('success', 'Niêm yết thành công! Mã Đơn: #' + listingId);
            btn.innerText = '📋 NIÊM YẾT THÊM MÓN KHÁC';
            btn.disabled = false;

        } catch(e) {
            btn.innerText = '📋 NIÊM YẾT BÁN HÀNG';
            btn.disabled = false;
            toast('error', e.reason || e.message || 'Lỗi niêm yết!');
        }
    }
    `,
        bindings: [
            { btn: "mlist-btn", fn: "listNFT" }
        ]
    },

    // ==================== KHỐI 11: MARKET CANCEL (RÚT HÀNG) ====================
    {
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
            btn.disabled = true;
            btn.innerText = '⏳ ĐANG HỦY ĐƠN...';
            toast('info', 'Đang gửi lệnh Hủy Đơn #' + listingId + '...');

            const mp = new ethers.Contract(mpAddr, [
                "function cancelListing(uint256 listingId)"
            ], signer);

            const tx = await mp.cancelListing(listingId);
            await tx.wait();

            toast('success', 'Đã hủy Đơn #' + listingId + '! NFT đã về ví bạn an toàn!');
            btn.innerText = '🗑️ HỦY ĐƠN / RÚT HÀNG VỀ';
            btn.disabled = false;
        } catch(e) {
            btn.innerText = '🗑️ HỦY ĐƠN / RÚT HÀNG VỀ';
            btn.disabled = false;
            const msg = (e.reason || e.message || '').toLowerCase();
            if(msg.includes('not the listing creator') || msg.includes('caller is not')) {
                toast('error', 'Bạn không phải chủ đơn niêm yết này!');
            } else {
                toast('error', e.reason || e.message || 'Lỗi hủy đơn!');
            }
        }
    }
    `,
        bindings: [
            { btn: "mcancel-btn", fn: "cancelListing" }
        ]
    },

    // ==================== KHỐI 12: MARKET SHOP (CỬA HÀNG) ====================
    {
        id: "market-shop",
        name: "🛒 Cửa Hàng Mua Sắm",
        desc: "Xem tất cả hàng đang bán trên Marketplace và Mua ngay",
        color: "#06b6d4",
        label: "Cửa Hàng NFT",
        preview: () => `
            <div style="text-align:center;padding:8px;">
                <div style="font-size:30px;margin-bottom:6px;">🛒</div>
                <div class="pv-input">Mã Chợ (0x...)</div>
                <div class="pv-btn" style="background:#06b6d4;">🔄 MỞ CỬA HÀNG</div>
            </div>`,
        exportHtml: () => `
    <div class="khoi" style="border-left-color:#06b6d4;">
        <div class="khoi-title" style="color:#22d3ee;">🛒 CỬA HÀNG MUA SẮM</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Tải danh sách tất cả hàng đang bán trên Chợ. Bấm "Mua Ngay" là sở hữu!</p>

        <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="mshop-marketplace" placeholder="🏪 Mã Chợ Marketplace (0x...)" style="flex:1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;margin-bottom:0;">
            <button id="mshop-load-btn" style="background:#06b6d4;color:white;border:none;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;white-space:nowrap;width:auto;">🔄 TẢI HÀNG</button>
        </div>

        <div id="mshop-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(140px, 1fr));gap:10px;">
            <div style="text-align:center;grid-column:1/-1;color:#64748b;font-size:12px;padding:20px;">
                Dán Mã Chợ rồi bấm "Tải Hàng" để xem mặt hàng...
            </div>
        </div>
    </div>`,
        engineCode: (pfx) => `
    const NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    async function loadShop() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const mpAddr = document.getElementById('mshop-marketplace').value.trim();
        const grid = document.getElementById('mshop-grid');
        const loadBtn = document.getElementById('mshop-load-btn');

        if(!mpAddr || mpAddr.length !== 42) { toast('error','Nhập Mã Chợ Marketplace hợp lệ!'); return; }

        try {
            loadBtn.disabled = true;
            loadBtn.innerText = '⏳ Đang tải...';
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#22d3ee;font-size:12px;">Đang lội vào Blockchain moi hàng...</div>';

            const mp = new ethers.Contract(mpAddr, [
                "function getAllValidListings(uint256 start, uint256 end) view returns (tuple(uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved)[] listings)",
                "function totalListings() view returns (uint256)",
                "function buyFromListing(uint256 listingId, address buyFor, uint256 quantity, address currency, uint256 expectedTotalPrice) payable"
            ], signer);

            const total = await mp.totalListings();
            if(total == 0) {
                grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#94a3b8;font-size:12px;padding:20px;">Chợ trống! Chưa có ai niêm yết hàng cả.</div>';
                loadBtn.innerText = '🔄 TẢI HÀNG';
                loadBtn.disabled = false;
                return;
            }

            let listings = [];
            try {
                listings = await mp.getAllValidListings(0, total - 1);
            } catch(e) {
                // Một số marketplace cần đúng range
                try { listings = await mp.getAllValidListings(0, 100); } catch(e2) {}
            }

            if(listings.length === 0) {
                grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#94a3b8;font-size:12px;padding:20px;">Không có đơn hàng hợp lệ nào đang bán.</div>';
                loadBtn.innerText = '🔄 TẢI HÀNG';
                loadBtn.disabled = false;
                return;
            }

            grid.innerHTML = '';
            for(const item of listings) {
                const listingId = item.listingId.toString();
                const tokenId = item.tokenId.toString();
                const priceRaw = item.pricePerToken;
                const priceStr = ethers.utils.formatEther(priceRaw);
                const isNative = item.currency.toLowerCase() === NATIVE_TOKEN;
                const currLabel = isNative ? 'ETH' : item.currency.slice(0,6) + '...' + item.currency.slice(-4);

                // Thử tải metadata
                let imgUrl = '';
                let name = 'NFT #' + tokenId;
                try {
                    const nft = new ethers.Contract(item.assetContract, ["function tokenURI(uint256) view returns (string)"], signer);
                    const rawUri = await nft.tokenURI(tokenId);
                    const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    const res = await fetch(ipfsUri);
                    const metadata = await res.json();
                    imgUrl = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
                    name = metadata.name || name;
                } catch(e) {}

                const card = document.createElement('div');
                card.style.cssText = 'background:#1e293b;border-radius:10px;overflow:hidden;border:1px solid #334155;';
                card.innerHTML = \`
                    <div style="height:120px;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
                        \${imgUrl ? \`<img src="\${imgUrl}" style="width:100%;height:100%;object-fit:cover;">\` : '<span style="font-size:30px;">🖼️</span>'}
                        <span style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.7);color:#94a3b8;font-size:8px;padding:2px 5px;border-radius:4px;">Thẻ #\${tokenId}</span>
                        <span style="position:absolute;top:4px;right:4px;background:rgba(251,191,36,0.9);color:#000;font-size:8px;font-weight:bold;padding:2px 5px;border-radius:4px;">Đơn #\${listingId}</span>
                    </div>
                    <div style="padding:10px;">
                        <div style="font-size:11px;font-weight:bold;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${name}</div>
                        <div style="font-size:12px;color:#fbbf24;font-weight:bold;margin-top:4px;">\${priceStr} \${currLabel}</div>
                        <button onclick="buyItem('\${mpAddr}','\${listingId}','\${item.currency}','\${priceRaw.toString()}',\${isNative},this)" style="background:#06b6d4;width:100%;padding:8px;border:none;border-radius:6px;color:white;font-weight:bold;font-size:11px;cursor:pointer;margin-top:8px;">🛒 MUA NGAY</button>
                    </div>
                \`;
                grid.appendChild(card);
            }

            toast('success', 'Đã tải ' + listings.length + ' mặt hàng!');
            loadBtn.innerText = '🔄 TẢI HÀNG';
            loadBtn.disabled = false;

        } catch(e) {
            loadBtn.innerText = '🔄 TẢI HÀNG';
            loadBtn.disabled = false;
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#ef4444;font-size:12px;padding:20px;">Lỗi: ' + (e.reason || e.message) + '</div>';
        }
    }

    async function buyItem(mpAddr, listingId, currency, totalPrice, isNative, btn) {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const origText = btn.innerText;
        try {
            btn.disabled = true;
            const mp = new ethers.Contract(mpAddr, [
                "function buyFromListing(uint256 listingId, address buyFor, uint256 quantity, address currency, uint256 expectedTotalPrice) payable"
            ], signer);
            const buyer = await signer.getAddress();

            if(!isNative) {
                // Approve token ERC20 trước
                btn.innerText = '🔑 Approve...';
                toast('info', 'Bước 1: Ủy quyền Token cho Chợ...');
                const token = new ethers.Contract(currency, [
                    "function approve(address spender, uint256 amount)",
                    "function allowance(address owner, address spender) view returns (uint256)"
                ], signer);
                const allowed = await token.allowance(buyer, mpAddr);
                if(allowed.lt(totalPrice)) {
                    const txA = await token.approve(mpAddr, totalPrice);
                    await txA.wait();
                    toast('success', 'Ủy quyền token thành công!');
                }
            }

            btn.innerText = '⏳ Đang mua...';
            toast('info', 'Đang gửi giao dịch Mua Hàng...');
            const txBuy = await mp.buyFromListing(
                listingId, buyer, 1, currency, totalPrice,
                isNative ? { value: totalPrice } : {}
            );
            await txBuy.wait();

            toast('success', 'MUA THÀNH CÔNG! NFT đã về ví bạn!');
            btn.innerText = '✅ ĐÃ MUA';
            btn.style.background = '#10b981';

            // Refresh shop
            setTimeout(() => loadShop(), 2000);

        } catch(e) {
            btn.disabled = false;
            btn.innerText = origText;
            toast('error', e.reason || e.message || 'Lỗi mua hàng!');
        }
    }
    window.buyItem = buyItem;
    `,
        bindings: [
            { btn: "mshop-load-btn", fn: "loadShop" }
        ]
    },

    // ==================== KHỐI 13: DROP AIRDROP (THẦY GIÁO CẤP BẰNG) ====================
    {
        id: "drop-airdrop",
        name: "🏅 Thầy Giáo Cấp Bằng",
        desc: "Airdrop Bằng Khen (ERC1155) hàng loạt cho danh sách ví",
        color: "#eab308",
        label: "Phát Bằng Khen Soulbound",
        config: [
            { key: "contractAddr", label: "🏛️ Địa chỉ Hợp đồng Bằng Khen (Edition Drop)", type: "text" },
            { key: "tokenId", label: "🆔 Token ID của Bằng Khen (VD: 0)", type: "text" },
            { key: "wallets", label: "📋 Danh sách Ví Học Sinh (Mỗi dòng 1 ví)", type: "textarea" }
        ],
        preview: () => `
            <div style="text-align:center;padding:8px;">
                <div style="font-size:30px;margin-bottom:6px;">🏅</div>
                <div class="pv-input">Mã Bằng Khen (0x...)</div>
                <div class="pv-input" style="font-size:8px;">0xAbc...\n0xDef...</div>
                <div class="pv-btn" style="background:#eab308;">🏅 ĐÓNG MỘC PHÁT BẰNG</div>
            </div>`,
        exportHtml: (tk, cfg) => {
            const addr = (cfg && cfg.contractAddr) || '';
            const tid = (cfg && cfg.tokenId) || '0';
            const wallets = (cfg && cfg.wallets) || '';
            return `
    <div class="khoi" style="border-left-color:#eab308;">
        <div class="khoi-title" style="color:#facc15;">🏅 THẦY GIÁO CẤP BẰNG (AIRDROP SOULBOUND)</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Phát Bằng Khen (ERC1155 Edition Drop) hàng loạt cho học sinh. Chỉ Admin (chủ Contract) mới được phép phát!</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="airdrop-contract" placeholder="🏛️ Mã Hợp Đồng Bằng Khen (0x...)" value="${addr}" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="airdrop-tokenid" placeholder="🆔 Token ID (VD: 0)" value="${tid}" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="number" id="airdrop-amount" placeholder="📦 Số lượng/ví (VD: 1)" value="1" style="background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>

        <label style="font-size:10px;color:#94a3b8;font-weight:bold;">📋 DANH SÁCH VÍ HỌC SINH (mỗi dòng 1 ví):</label>
        <textarea id="airdrop-wallets" rows="6" placeholder="0xAbc123...&#10;0xDef456...&#10;0x789Ghi..." style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;font-family:monospace;resize:vertical;margin-bottom:12px;">${wallets}</textarea>

        <button id="airdrop-btn" style="background:linear-gradient(45deg, #ca8a04, #eab308);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:10px;">🏅 ĐÓNG MỘC PHÁT BẰNG CHO CẢ LỚP</button>

        <div id="airdrop-log" style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;max-height:200px;overflow-y:auto;font-size:10px;font-family:monospace;color:#94a3b8;display:none;"></div>
    </div>`;
        },
        engineCode: (pfx) => `
    async function doAirdrop() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const contractAddr = document.getElementById('airdrop-contract').value.trim();
        const tokenId = document.getElementById('airdrop-tokenid').value.trim();
        const amountPer = document.getElementById('airdrop-amount').value.trim() || '1';
        const walletsText = document.getElementById('airdrop-wallets').value.trim();
        const btn = document.getElementById('airdrop-btn');
        const log = document.getElementById('airdrop-log');

        if(!contractAddr || contractAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!walletsText) { toast('error','Dán danh sách Ví học sinh vào!'); return; }

        const wallets = walletsText.split(/[\\n,]+/).map(w => w.trim()).filter(w => w.length === 42 && w.startsWith('0x'));
        if(wallets.length === 0) { toast('error','Không tìm thấy ví hợp lệ nào!'); return; }

        log.style.display = 'block';
        log.innerHTML = '🚀 Chuẩn bị phát bằng cho ' + wallets.length + ' học sinh trong 1 NỐT NHẠC...\\n';

        try {
            btn.disabled = true;
            btn.innerText = '⏳ ĐANG GOM LỆNH...';

            const claimIface = new ethers.utils.Interface([
                "function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data)"
            ]);
            const multicallContract = new ethers.Contract(contractAddr, [
                "function multicall(bytes[] data) returns (bytes[] results)",
                "function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data) payable"
            ], signer);

            const proof = [[], 0, 0, '0x0000000000000000000000000000000000000000'];
            const nativeCurrency = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
            const calls = [];

            for(const w of wallets) {
                const shortW = w.substring(0,6) + '...' + w.slice(-4);
                log.innerHTML += '\\n📋 Gom lệnh cho ' + shortW;
                const encoded = claimIface.encodeFunctionData('claim', [w, tokenId, amountPer, nativeCurrency, 0, proof, '0x']);
                calls.push(encoded);
            }

            log.innerHTML += '\\n\\n🔫 Bắn 1 phát ' + calls.length + ' viên đạn... Ký MetaMask!';
            log.scrollTop = log.scrollHeight;
            btn.innerText = '⏳ KÝ METAMASK...';

            try {
                const tx = await multicallContract.multicall(calls);
                log.innerHTML += '\\n⏳ Đang xử lý trên Blockchain...';
                log.scrollTop = log.scrollHeight;
                await tx.wait();
                log.innerHTML += '\\n\\n🏁 HOÀN TẤT! ✅ ' + wallets.length + '/' + wallets.length + ' bằng khen đã phát xong!';
                log.innerHTML += '\\n🧾 TX: ' + tx.hash;
                toast('success', 'Phát bằng hàng loạt thành công! ' + wallets.length + ' học sinh!');
            } catch(eMulti) {
                log.innerHTML += '\\n⚠️ Multicall lỗi, chuyển sang phát từng em...';
                log.scrollTop = log.scrollHeight;
                let success = 0, failed = 0;
                for(let i = 0; i < wallets.length; i++) {
                    const w = wallets[i];
                    const shortW = w.substring(0,6) + '...' + w.slice(-4);
                    log.innerHTML += '\\n📤 [' + (i+1) + '/' + wallets.length + '] ' + shortW + '...';
                    try {
                        const tx = await multicallContract.claim(w, tokenId, amountPer, nativeCurrency, 0, proof, '0x');
                        await tx.wait();
                        log.innerHTML += ' ✅';
                        success++;
                    } catch(e2) {
                        log.innerHTML += ' ❌ ' + (e2.reason || 'Lỗi');
                        failed++;
                    }
                    log.scrollTop = log.scrollHeight;
                }
                log.innerHTML += '\\n\\n🏁 HOÀN TẤT! ✅ ' + success + ', ❌ ' + failed;
                toast(failed === 0 ? 'success' : 'error', success + '/' + wallets.length + ' thành công!');
            }

            btn.innerText = '🏅 PHÁT BẰNG TIẾP';
            btn.disabled = false;

        } catch(e) {
            log.innerHTML += '\\n❌ LỖI: ' + (e.reason || e.message);
            btn.innerText = '🏅 ĐÓNG MỘC PHÁT BẰNG CHO CẢ LỚP';
            btn.disabled = false;
            toast('error', e.reason || e.message || 'Lỗi phát bằng!');
        }
    }
    `,
        bindings: [
            { btn: "airdrop-btn", fn: "doAirdrop" }
        ]
    },

    // ==================== KHỐI 14: PROFILE GALLERY (BẢNG VINH DANH) ====================
    {
        id: "profile-gallery",
        name: "🏆 Bảng Vinh Danh Lớp",
        desc: "Kiểm tra ai đã nhận Bằng Khen (ERC1155 balanceOf)",
        color: "#a855f7",
        label: "Bảng Phong Thần",
        config: [
            { key: "contractAddr", label: "🏛️ Địa chỉ Hợp đồng Bằng Khen", type: "text" },
            { key: "tokenId", label: "🆔 Token ID cần kiểm tra", type: "text" },
            { key: "wallets", label: "📋 Danh sách Ví Lớp (Mỗi dòng 1 ví)", type: "textarea" }
        ],
        preview: () => `
            <div style="text-align:center;padding:8px;">
                <div style="font-size:30px;margin-bottom:6px;">🏆</div>
                <div class="pv-input">Mã Bằng Khen</div>
                <div class="pv-btn" style="background:#a855f7;">🔍 KIỂM TRA</div>
                <div style="display:flex;gap:4px;margin-top:4px;">
                    <div style="flex:1;padding:4px;background:#10b981;border-radius:4px;font-size:7px;color:white;">🎓 0xA...</div>
                    <div style="flex:1;padding:4px;background:#64748b;border-radius:4px;font-size:7px;color:white;">❌ 0xB...</div>
                </div>
            </div>`,
        exportHtml: (tk, cfg) => {
            const addr = (cfg && cfg.contractAddr) || '';
            const tid = (cfg && cfg.tokenId) || '0';
            const wallets = (cfg && cfg.wallets) || '';
            return `
    <div class="khoi" style="border-left-color:#a855f7;">
        <div class="khoi-title" style="color:#c084fc;">🏆 BẢNG VINH DANH LỚP HỌC</div>
        <p style="font-size:11px;color:#cbd5e1;margin-bottom:12px;line-height:1.5;">Kiểm tra Blockchain xem ai trong lớp đã sở hữu Bằng Khen (Soulbound Token) này chưa.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
            <input type="text" id="honor-contract" placeholder="🏛️ Mã Hợp Đồng Bằng Khen (0x...)" value="${addr}" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
            <input type="text" id="honor-tokenid" placeholder="🆔 Token ID (VD: 0)" value="${tid}" style="grid-column:1/-1;background:#0f172a;color:#fff;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;">
        </div>

        <label style="font-size:10px;color:#94a3b8;font-weight:bold;">📋 DANH SÁCH VÍ CẦN KIỂM TRA:</label>
        <textarea id="honor-wallets" rows="5" placeholder="0xAbc123...&#10;0xDef456...&#10;0x789Ghi..." style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #334155;padding:10px;border-radius:6px;font-size:11px;font-family:monospace;resize:vertical;margin-bottom:12px;">${wallets}</textarea>

        <button id="honor-btn" style="background:linear-gradient(45deg, #7c3aed, #a855f7);width:100%;padding:14px;border-radius:10px;border:none;color:white;font-weight:bold;font-size:14px;cursor:pointer;margin-bottom:12px;">🔍 KIỂM TRA BẢN PHONG THẦN</button>

        <div id="honor-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:8px;">
            <div style="text-align:center;grid-column:1/-1;color:#64748b;font-size:12px;padding:15px;">
                Dán danh sách ví rồi bấm "Kiểm Tra" để xem ai đã có Bằng...
            </div>
        </div>
    </div>`;
        },
        engineCode: (pfx) => `
    async function checkHonorRoll() {
        if(!signer){toast('error','Kết nối Ví trước!');return;}
        const contractAddr = document.getElementById('honor-contract').value.trim();
        const tokenId = document.getElementById('honor-tokenid').value.trim();
        const walletsText = document.getElementById('honor-wallets').value.trim();
        const btn = document.getElementById('honor-btn');
        const grid = document.getElementById('honor-grid');

        if(!contractAddr || contractAddr.length !== 42) { toast('error','Nhập Mã Hợp Đồng hợp lệ!'); return; }
        if(tokenId === '') { toast('error','Nhập Token ID!'); return; }
        if(!walletsText) { toast('error','Dán danh sách Ví cần kiểm tra!'); return; }

        const wallets = walletsText.split(/[\\n,]+/).map(w => w.trim()).filter(w => w.length === 42 && w.startsWith('0x'));
        if(wallets.length === 0) { toast('error','Không tìm thấy ví hợp lệ nào!'); return; }

        try {
            btn.disabled = true;
            btn.innerText = '⏳ ĐANG QUÉT BLOCKCHAIN...';
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#c084fc;font-size:12px;">Đang kiểm tra ' + wallets.length + ' địa chỉ...</div>';

            const contract = new ethers.Contract(contractAddr, [
                "function balanceOf(address account, uint256 id) view returns (uint256)",
                "function uri(uint256) view returns (string)"
            ], signer);

            // Thử load metadata ảnh Bằng Khen
            let certImg = '';
            let certName = 'Bằng Khen #' + tokenId;
            try {
                const rawUri = await contract.uri(tokenId);
                const ipfsUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/').replace('{id}', tokenId);
                const res = await fetch(ipfsUri);
                const metadata = await res.json();
                certImg = metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
                certName = metadata.name || certName;
            } catch(e) {}

            grid.innerHTML = '';
            let holders = 0;

            for(const w of wallets) {
                const shortW = w.substring(0,6) + '...' + w.slice(-4);
                let hasToken = false;
                try {
                    const bal = await contract.balanceOf(w, tokenId);
                    hasToken = bal.gt(0);
                } catch(e) {
                    // Fallback ERC721: thử ownerOf hoặc balanceOf(address)
                    try {
                        const c721 = new ethers.Contract(contractAddr, ["function balanceOf(address) view returns (uint256)"], signer);
                        const bal721 = await c721.balanceOf(w);
                        hasToken = bal721.gt(0);
                    } catch(e2) {}
                }

                if(hasToken) holders++;

                const card = document.createElement('div');
                card.style.cssText = hasToken
                    ? 'background:linear-gradient(135deg, #065f46, #047857);border:2px solid #10b981;border-radius:10px;padding:10px;text-align:center;'
                    : 'background:#1e293b;border:1px solid #334155;border-radius:10px;padding:10px;text-align:center;opacity:0.6;';
                const imgHtml = (hasToken && certImg) 
                    ? \`<img src="\${certImg}" style="width:100%;max-height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px;border:1px solid #34d399;" alt="\${certName}">\` 
                    : \`<div style="font-size:24px;margin-bottom:4px;">\${hasToken ? '🎓' : '❌'}</div>\`;

                card.innerHTML = \`
                    \${imgHtml}
                    <div style="font-size:10px;font-weight:bold;color:\${hasToken ? '#34d399' : '#94a3b8'};">\${hasToken ? 'ĐÃ TỐT NGHIỆP' : 'CHƯA CÓ'}</div>
                    <div style="font-size:9px;color:#64748b;margin-top:4px;font-family:monospace;">\${shortW}</div>
                \`;
                grid.appendChild(card);
            }

            toast('success', 'Kiểm tra xong! ' + holders + '/' + wallets.length + ' đã sở hữu Bằng Khen!');
            btn.innerText = '🔍 KIỂM TRA LẠI';
            btn.disabled = false;

        } catch(e) {
            btn.innerText = '🔍 KIỂM TRA BẢN PHONG THẦN';
            btn.disabled = false;
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:#ef4444;font-size:12px;padding:20px;">Lỗi: ' + (e.reason || e.message) + '</div>';
        }
    }
    `,
        bindings: [
            { btn: "honor-btn", fn: "checkHonorRoll" }
        ]
    }
];
