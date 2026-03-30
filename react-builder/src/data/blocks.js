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
        },
        engineCode: () => ''
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
    }

    // ==================== KHỐI 7: GACHA DROP ====================
    ,{
        id: "gacha-drop",
        name: "🎰 Máy Quay Gacha NFT",
        desc: "Khối cho học sinh bốc thăm ngẫu nhiên hoặc nhận NFT từ hộp gacha.",
        color: "#c026d3",
        label: "Hệ Thống Vật Phẩm",
        config: [
            { id: "contractUrl", label: "Địa Chỉ SC Gacha", type: "string" }
        ],
        preview: (tk) => {
            return '<div style="padding:15px;background:#4a044e;border-radius:10px;border-left:4px solid #c026d3;"><div style="color:#e879f9;font-weight:bold;margin-bottom:10px;">🎰 MÁY GACHA ĐIỆN TỬ</div></div>';
        },
        exportHtml: (tk) => {
            let addr = tk.contractData?.contractUrl || "0x0";
            return `
    <div class="khoi" style="border-left-color:#c026d3;background:rgba(192,38,211,0.05);padding:15px;">
        <div class="khoi-title" style="color:#e879f9;font-weight:bold;margin-bottom:12px;">🎰 MÁY QUAY GACHA NFT</div>
        <p style="font-size:10px;color:#a1a1aa;margin-bottom:10px;">Contract: ${addr}</p>
        <button class="gacha-btn" style="background:#c026d3;color:white;padding:10px 20px;border-radius:8px;">🎰 Quay Ngay (Claim)</button>
        <div class="gacha-stt" style="margin-top:10px;font-size:11px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.previousElementSibling;
            let stt = btn.nextElementSibling;
            btn.addEventListener('click', async () => {
                try {
                    if(!window.walletAddress) return alert('No wallet');
                    stt.innerText = 'Đang duyệt...';
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    // Generic mint function for demonstration
                    const abi = ["function claim(address receiver, uint256 quantity) payable", "function mintTo(address receiver, uint256 qty) payable"];
                    const contract = new ethers.Contract("${addr}", abi, signer);
                    const tx = await contract.mintTo(window.walletAddress, 1);
                    await tx.wait();
                    stt.innerText = '✅ Thành công!';
                } catch(e) {
                    stt.innerText = '❌ Lỗi: ' + e.message.substring(0,50);
                }
            });
        });
    </script>`;
        }
    },
    // ==================== KHỐI 8: TỦ ĐỒ NFT ====================
    {
        id: "drop-gallery",
        name: "🎒 Túi Đồ Khoe Quà (NFT Gallery)",
        desc: "Hiện các NFT đã quay trúng.",
        color: "#db2777",
        label: "Hệ Thống Vật Phẩm",
        config: [{ id: "contractUrl", label: "Địa Chỉ SC Gacha", type: "string" }],
        preview: () => '<div style="padding:15px;background:#500724;border-left:4px solid #db2777;border-radius:10px;"><div style="color:#f472b6;">🎒 TÚI ĐỒ CỦA BẠN</div></div>',
        exportHtml: (tk) => {
            let addr = tk.contractData?.contractUrl || "0x0";
            return `
    <div class="khoi">🎒 TÚI ĐỒ TỪ GACHA <button class="g-btn">Tải đồ</button>
        <div class="g-stt"></div>
    </div>`;
        }
    },
    // ==================== KHỐI 9: CHỢ NFT ====================
    {
        id: "market-list", name: "🛒 Treo Bán NFT", color: "#ea580c", desc: "List NFT lên chợ.", label: "Thị Trường",
        config: [{ id: "market", label: "SC Chợ Marketplace", type: "string" }],
        preview: () => '<div style="background:#431407;padding:15px;border-left:4px solid #ea580c;color:#fdba74;">🛒 TREO BÁN SẢN PHẨM</div>',
        exportHtml: (tk) => '<div class="khoi">🛒 Treo bán NFT...</div>'
    },
    {
        id: "market-cancel", name: "❌ Hủy Bán NFT", color: "#dc2626", desc: "Hủy niêm yết NFT.", label: "Thị Trường",
        preview: () => '<div style="background:#450a0a;color:#fca5a5;padding:15px;">❌ HỦY BÁN SẢN PHẨM</div>',
        exportHtml: (tk) => '<div class="khoi">❌ Hủy bán NFT...</div>'
    },
    {
        id: "market-shop", name: "🛍️ Cửa Hàng (Shop Mua Nhanh)", color: "#16a34a", desc: "Hiển thị NFT và bấm mua.", label: "Thị Trường",
        preview: () => '<div style="background:#052e16;color:#86efac;padding:15px;">🛍️ CỬA HÀNG NFT</div>',
        exportHtml: (tk) => '<div class="khoi">🛍️ Shop Mua Nhanh...</div>'
    },
    // ==================== KHỐI 10: AIRDROP BẰNG KHEN ====================
    {
        id: "drop-airdrop", name: "🪂 Phát Bằng Khen (Airdrop)", color: "#0ea5e9", desc: "Giáo viên airdrop quyền đúc.", label: "Chứng Thực Học Tập",
        preview: () => '<div style="background:#082f49;color:#7dd3fc;padding:15px;">🪂 TRẠM PHÁT BẰNG KHEN</div>',
        exportHtml: (tk) => '<div class="khoi">🪂 Phát bằng khen...</div>'
    },
    {
        id: "profile-gallery", name: "🖼️ Bàn Thờ Khung Kính (Hồ sơ)", color: "#8b5cf6", desc: "Khoe bằng khen SBT chống gửi.", label: "Chứng Thực Học Tập",
        preview: () => '<div style="background:#2e1065;color:#c4b5fd;padding:15px;">🖼️ KHO BẰNG KHEN CÁ NHÂN</div>',
        exportHtml: (tk) => '<div class="khoi">🖼️ Túi đựng Bằng Khen Cứng...</div>'
    },
    // ==================== KHỐI 11: CHỮ KÝ VÀ BẢO MẬT ====================
    {
        id: "auth-sign", name: "✍️ Đóng Dấu (Ký Điện Tử)", color: "#eab308", desc: "Dùng ví metamask đóng dấu nội dung.", label: "Bảo Mật",
        preview: () => '<div style="background:#422006;color:#fde047;padding:15px;">✍️ KHU VỰC KÝ ĐIỆN TỬ</div>',
        exportHtml: (tk) => '<div class="khoi">✍️ Đóng Dấu Văn Bản...</div>'
    },
    {
        id: "auth-verify", name: "🔎 Máy Quét Kính Lúp (Verify)", color: "#14b8a6", desc: "Quét xem văn bản có bị giả mạo chữ ký không.", label: "Bảo Mật",
        preview: () => '<div style="background:#042f2e;color:#5eead4;padding:15px;">🔎 KÍNH LÚP XÁC THỰC</div>',
        exportHtml: (tk) => '<div class="khoi">🔎 Quét mã chữ ký...</div>'
    },
    {
        id: "hall-of-fame", name: "🏆 Bảng Vàng Danh Dự", color: "#f59e0b", desc: "Lưu điểm thi bất biến lên smart contract.", label: "Bảo Mật",
        preview: () => '<div style="background:#451a03;color:#fcd34d;padding:15px;">🏆 BẢNG VÀNG LƯU DANH</div>',
        exportHtml: (tk) => '<div class="khoi">🏆 Lưu danh học sinh (Lưu điểm)...</div>'
    },
    // ==================== KHỐI 12: TX-CHECK API V2 ====================
    {
        id: "tx-check",
        name: "📡 Radar Quét Giao Dịch",
        desc: "Sử dụng Etherscan V2 API quét lịch sử chuyển tiền của một ví.",
        color: "#4f46e5",
        label: "Hệ Thống Kiểm Tra",
        config: [{ id: "apiKey", label: "Etherscan API Key", type: "string" }],
        preview: (tk) => '<div style="background:#1e1b4b;color:#a5b4fc;padding:15px;">📡 RADAR QUÉT GIAO DỊCH (V2)</div>',
        exportHtml: (tk) => {
            let apiKey = tk.contractData?.apiKey || "EGUX1WCJ8EHBX59F1EP7QGUKFTT2WRXYVR";
            return `
    <div class="khoi" style="border-left-color:#4f46e5;background:rgba(79,70,229,0.05);padding:15px;">
        <div style="color:#a5b4fc;font-weight:bold;margin-bottom:12px;">📡 RADAR QUÉT LỊCH SỬ GIAO DỊCH (V2)</div>
        <input type="text" class="tx-inp" placeholder="Nhập địa chỉ ví 0x..." style="width:100%;padding:10px;margin-bottom:10px;">
        <input type="hidden" class="tx-key" value="${apiKey}">
        <button class="tx-btn" style="background:#4f46e5;color:white;padding:10px 20px;border:none;">Quét Radar</button>
        <div class="tx-stt" style="margin-top:10px;font-size:12px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.previousElementSibling;
            let stt = btn.nextElementSibling;
            let inp = btn.previousElementSibling.previousElementSibling;
            let key = btn.previousElementSibling.value;
            
            btn.addEventListener('click', async () => {
                let wallet = inp.value.trim();
                if(!wallet) return;
                stt.innerHTML = 'Đang quét Etherscan V2 API...';
                try {
                    // API Etherscan V2 Unified endpoint
                    const url = \`https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist&address=\${wallet}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=\${key}\`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if(data.status === "1" && data.result.length > 0) {
                        let html = data.result.slice(0, 3).map(tx => \`<div style="padding:5px;border-bottom:1px solid #333;">🟢 To: \${tx.to.substring(0,8)}...<br>Giá trị: \${tx.value} wei</div>\`).join('');
                        stt.innerHTML = html;
                    } else {
                        stt.innerHTML = 'Chưa có giao dịch nào!';
                    }
                } catch(e) {
                    stt.innerHTML = 'Lỗi kết nối API!';
                }
            });
        });
    </script>`;
        }
    }

];