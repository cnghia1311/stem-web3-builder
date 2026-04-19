// ==================== KHỐI 3: CLAIM (ĐỘC LẬP) ====================
export default {
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
}
