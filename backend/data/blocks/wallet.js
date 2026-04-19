// ==================== KHỐI 1: VÍ ====================
export default {
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
}
