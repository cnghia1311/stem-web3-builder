const fs = require('fs');

const path = 'react-builder/src/data/blocks.js';
let code = fs.readFileSync(path, 'utf8');

// We will find the marker for KHỐI 9: CHỢ NFT and cut everything below it, then replace with real code.
const marker = '// ==================== KHỐI 9: CHỢ NFT ====================';
const cutIdx = code.indexOf(marker);
if (cutIdx === -1) {
    console.log("Marker not found!");
    process.exit(1);
}

const beforeCode = code.substring(0, cutIdx);

const realBlocks = `// ==================== KHỐI 9: CHỢ NFT ====================
    {
        id: "market-list", name: "🛒 Treo Bán NFT", color: "#ea580c", desc: "List NFT lên chợ.", label: "Thị Trường",
        config: [
            { id: "marketUrl", label: "Địa Chỉ Sàn Chợ (Marketplace)", type: "string" },
            { id: "nftUrl", label: "Địa Chỉ SC Vật Phẩm (NFT)", type: "string" }
        ],
        preview: () => '<div style="background:#431407;padding:15px;border-left:4px solid #ea580c;color:#fdba74;">🛒 TREO BÁN SẢN PHẨM</div>',
        exportHtml: (tk) => {
            let mkt = tk.contractData?.marketUrl || "0x0";
            let nft = tk.contractData?.nftUrl || "0x0";
            return \`
    <div class="khoi" style="border-left-color:#ea580c;background:rgba(234,88,12,0.05);padding:15px;">
        <div style="color:#fdba74;font-weight:bold;margin-bottom:12px;">🛒 ĐĂNG BÁN SẢN PHẨM LÊN CHỢ</div>
        <input type="number" class="ml-id" placeholder="Token ID (Ví dụ: 0)" style="width:48%;padding:8px;">
        <input type="number" class="ml-price" placeholder="Giá Token (Ví dụ: 0.1 ETH)" style="width:48%;padding:8px;">
        <button class="ml-btn" style="background:#ea580c;color:white;padding:10px 20px;border-radius:8px;margin-top:10px;">Lên Kệ</button>
        <div class="ml-stt" style="margin-top:10px;font-size:11px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.previousElementSibling;
            let stt = btn.nextElementSibling;
            let inpId = btn.previousElementSibling.previousElementSibling;
            let inpPrice = btn.previousElementSibling;
            btn.addEventListener('click', async () => {
                try {
                    if(!window.walletAddress) return alert('Chưa kết nối ví');
                    let id = inpId.value; let price = inpPrice.value;
                    if(!id || !price) return alert('Điền đủ thông tin');
                    stt.innerHTML = 'Bước 1: Ủy quyền NFT cho cửa hàng...';
                    
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    
                    const nftAbi = ["function setApprovalForAll(address operator, bool approved)"];
                    const nftContract = new ethers.Contract("\${nft}", nftAbi, signer);
                    const tx1 = await nftContract.setApprovalForAll("\${mkt}", true);
                    await tx1.wait();
                    
                    stt.innerHTML = 'Bước 2: Đưa lên kệ chợ đen...';
                    const mktAbi = ["function listToken(address nftAddress, uint256 tokenId, uint256 price)"];
                    const mktContract = new ethers.Contract("\${mkt}", mktAbi, signer);
                    const tkPrice = ethers.utils.parseEther(price);
                    const tx2 = await mktContract.listToken("\${nft}", id, tkPrice);
                    await tx2.wait();
                    
                    stt.innerHTML = '✅ Treo bán thành công!';
                } catch(e) {
                    stt.innerHTML = '❌ Lỗi: ' + e.message.substring(0,80);
                }
            });
        });
    </script>\`;
        }
    },
    {
        id: "market-cancel", name: "❌ Hủy Bán NFT", color: "#dc2626", desc: "Hủy niêm yết NFT.", label: "Thị Trường",
        config: [{ id: "marketUrl", label: "Địa Chỉ Sàn Chợ (Marketplace)", type: "string" }],
        preview: () => '<div style="background:#450a0a;color:#fca5a5;padding:15px;border-left:4px solid #dc2626;">❌ HỦY BÁN SẢN PHẨM</div>',
        exportHtml: (tk) => {
            let mkt = tk.contractData?.marketUrl || "0x0";
            return \`
    <div class="khoi" style="border-left-color:#dc2626;background:rgba(220,38,38,0.05);padding:15px;">
        <div style="color:#fca5a5;font-weight:bold;margin-bottom:12px;">❌ GỠ HÀNG KHỎI KỆ</div>
        <input type="number" class="mc-id" placeholder="Listing ID hoặc Token ID" style="width:100%;padding:8px;">
        <button class="mc-btn" style="background:#dc2626;color:white;padding:10px 20px;border-radius:8px;margin-top:10px;">Gỡ Xuống</button>
        <div class="mc-stt" style="margin-top:10px;font-size:11px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
             let btn = document.currentScript.previousElementSibling.previousElementSibling;
             let stt = btn.nextElementSibling;
             let inpId = btn.previousElementSibling;
             btn.addEventListener('click', async () => {
                if(!window.walletAddress) return;
                try {
                    stt.innerHTML = 'Đang xử lý hủy...';
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const mktAbi = ["function cancelListing(uint256 listingId)", "function cancelListing(address nft, uint256 tokenId)"];
                    const mktContract = new ethers.Contract("\${mkt}", mktAbi, provider.getSigner());
                    const tx = await mktContract['cancelListing(uint256)'](inpId.value);
                    await tx.wait();
                    stt.innerHTML = '✅ Hủy bán thành công!';
                } catch(e) { stt.innerHTML = '❌ Lỗi: ' + e.message.substring(0,80); }
             });
        });
    </script>\`;
        }
    },
    {
        id: "market-shop", name: "🛍️ Cửa Hàng NFT (Shop)", color: "#16a34a", desc: "Hiển thị NFT và bấm mua.", label: "Thị Trường",
        config: [{ id: "marketUrl", label: "Địa Chỉ Sàn Chợ (Marketplace)", type: "string" }],
        preview: () => '<div style="background:#052e16;color:#86efac;padding:15px;border-left:4px solid #16a34a;">🛍️ CỬA HÀNG NFT</div>',
        exportHtml: (tk) => {
            let mkt = tk.contractData?.marketUrl || "0x0";
            return \`
    <div class="khoi" style="border-left-color:#16a34a;background:rgba(22,163,74,0.05);padding:15px;">
        <div style="color:#86efac;font-weight:bold;margin-bottom:12px;display:flex;justify-content:space-between;">
             <span>🛍️ CỬA HÀNG ĐỒ CHƠI BẢO MẬT</span>
             <button class="ms-load" style="font-size:10px;padding:3px 8px;">🔄 Tải lại</button>
        </div>
        <div class="ms-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;color:#fff;"></div>
        <div class="ms-stt" style="margin-top:10px;font-size:11px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btnLoad = document.currentScript.previousElementSibling.previousElementSibling.previousElementSibling.querySelector('.ms-load');
            let grid = btnLoad.parentElement.nextElementSibling;
            let stt = grid.nextElementSibling;
            
            btnLoad.addEventListener('click', async () => {
                try {
                    stt.innerHTML = 'Đang quét chợ...';
                    const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
                    const mktAbi = ["function getAllListings() view returns (tuple(uint256 id, address seller, address nft, uint256 tokenId, uint256 price)[])"];
                    const mktContract = new ethers.Contract("\${mkt}", mktAbi, provider);
                    const items = await mktContract.getAllListings();
                    if(items.length === 0) { grid.innerHTML = 'Chợ đang trống...'; stt.innerHTML = ''; return; }
                    
                    grid.innerHTML = items.map(i => \`
                        <div style="background:#064e3b;padding:10px;border-radius:8px;text-align:center;">
                            <div style="font-size:30px;margin-bottom:5px;">📦</div>
                            <div>Token ID: \${i.tokenId}</div>
                            <div style="color:#fde047;font-weight:bold;">\${ethers.utils.formatEther(i.price)} ETH</div>
                            <button onclick="buy('\${i.id}', '\${i.price}')" style="margin-top:5px;width:100%;padding:5px;background:#16a34a;color:white;border:none;">Mua</button>
                        </div>
                    \`).join('');
                    stt.innerHTML = 'Đã tải kệ hàng!';
                } catch(e) { stt.innerHTML = '❌ Lỗi chợ: ' + e.message.substring(0,50); }
            });
            window.buy = async (id, priceStr) => {
                if(!window.walletAddress) return alert('Chưa kết nối ví!');
                try {
                    stt.innerHTML = 'Đang mua hàng...';
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const mktAbi = ["function buyToken(uint256 listingId) payable"];
                    const mktContract = new ethers.Contract("\${mkt}", mktAbi, signer);
                    const tx = await mktContract.buyToken(id, { value: priceStr });
                    await tx.wait();
                    stt.innerHTML = '✅ Mua thành công!';
                    btnLoad.click();
                } catch(e) { stt.innerHTML = '❌ Lỗi: ' + (e.reason || e.message).substring(0,80); }
            };
        });
    </script>\`;
        }
    },
    // ==================== KHỐI 10: AIRDROP BẰNG KHEN ====================
    {
        id: "drop-airdrop", name: "🪂 Phát Bằng Khen (Airdrop)", color: "#0ea5e9", desc: "Giáo viên airdrop SBT.", label: "Chứng Thực Học Tập",
        config: [{ id: "contractUrl", label: "Địa Chỉ Bằng Khen SC", type: "string" }],
        preview: () => '<div style="background:#082f49;color:#7dd3fc;padding:15px;border-left:4px solid #0ea5e9;">🪂 TRẠM PHÁT BẰNG KHEN (GIÁO VIÊN)</div>',
        exportHtml: (tk) => {
            let addr = tk.contractData?.contractUrl || "0x0";
            return \`
    <div class="khoi" style="border-left-color:#0ea5e9;background:rgba(14,165,233,0.05);padding:15px;">
        <div style="color:#7dd3fc;font-weight:bold;margin-bottom:12px;">🪂 TRUYỀN TỐNG BẰNG KHEN VÀO VÍ HỌC SINH</div>
        <input type="text" class="da-adr" placeholder="Địa chỉ ví học sinh (0x...)" style="width:100%;padding:8px;margin-bottom:5px;">
        <input type="text" class="da-uri" placeholder="URL Hình ảnh Thành tích (Tùy chọn)" style="width:100%;padding:8px;margin-bottom:5px;">
        <button class="da-btn" style="background:#0ea5e9;color:white;padding:10px 20px;border-radius:8px;">Bắn Airdrop</button>
        <div class="da-stt" style="margin-top:10px;font-size:11px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.previousElementSibling;
            let stt = btn.nextElementSibling;
            let inpUri = btn.previousElementSibling;
            let inpAdr = inpUri.previousElementSibling;
            btn.addEventListener('click', async () => {
                if(!window.walletAddress) return alert('No wallet');
                try {
                    stt.innerHTML = 'Đang ký tên lên bằng khen học sinh...';
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const abi = ["function safeMint(address to, string uri)", "function airdrop(address to)"];
                    const contract = new ethers.Contract("\${addr}", abi, signer);
                    const tx = await contract.safeMint(inpAdr.value, inpUri.value || "https://example.com/cert.png");
                    stt.innerHTML = 'Đợi mạng lưới đúc bằng (Mining)...';
                    await tx.wait();
                    stt.innerHTML = '✅ Phát Bằng Thành Công!';
                } catch(e) { stt.innerHTML = '❌ Lỗi: ' + e.message.substring(0,80); }
            });
        });
    </script>\`;
        }
    },
    {
        id: "profile-gallery", name: "🖼️ Bàn Thờ Khung Kính (Hồ sơ)", color: "#8b5cf6", desc: "Khoe bằng khen SBT.", label: "Chứng Thực Học Tập",
        config: [{ id: "contractUrl", label: "Địa Chỉ Bằng Khen SC", type: "string" }],
        preview: () => '<div style="background:#2e1065;color:#c4b5fd;padding:15px;border-left:4px solid #8b5cf6;">🖼️ KHO BẰNG KHEN CÁ NHÂN</div>',
        exportHtml: (tk) => {
            let addr = tk.contractData?.contractUrl || "0x0";
            return \`
    <div class="khoi" style="border-left-color:#8b5cf6;background:rgba(139,92,246,0.05);padding:15px;">
        <div style="color:#c4b5fd;font-weight:bold;margin-bottom:12px;">🖼️ KHUNG KÍNH KHOE BẰNG CỦA BẠN <button class="pg-btn" style="float:right;font-size:10px;">Load</button></div>
        <div class="pg-v" style="font-size:11px;color:#fff;">Chưa tải dữ liệu</div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.querySelector('.pg-btn');
            let view = document.currentScript.previousElementSibling.querySelector('.pg-v');
            btn.addEventListener('click', async () => {
                if(!window.walletAddress) return alert('Chưa kết nối ví!');
                view.innerHTML = 'Đang lùng sục blockchain...';
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const abi = ["function balanceOf(address) view returns (uint256)"];
                    const contract = new ethers.Contract("\${addr}", abi, provider);
                    const bal = await contract.balanceOf(window.walletAddress);
                    if(bal > 0) {
                        view.innerHTML = \`<div style="font-size:24px;text-align:center;">🏆<br>\${bal} Bằng Khen Bất Tử</div>\`;
                    } else {
                        view.innerHTML = 'Bạn chưa có bằng khen nào!';
                    }
                } catch(e) { view.innerHTML = 'Lỗi...'; }
            });
        });
    </script>\`;
        }
    },
    // ==================== KHỐI 11: CHỮ KÝ VÀ BẢO MẬT ====================
    {
        id: "auth-sign", name: "✍️ Đóng Dấu (Ký Điện Tử)", color: "#eab308", desc: "Dùng ví metamask đóng dấu nội dung.", label: "Bảo Mật",
        preview: () => '<div style="background:#422006;color:#fde047;padding:15px;border-left:4px solid #eab308;">✍️ KHU VỰC KÝ ĐIỆN TỬ</div>',
        exportHtml: (tk) => \`
    <div class="khoi" style="border-left-color:#eab308;background:rgba(234,179,8,0.05);padding:15px;">
        <div style="color:#fde047;font-weight:bold;margin-bottom:12px;">✍️ ĐÓNG MỘC VĂN BẢN (KHÔNG BÊN THỨ 3)</div>
        <textarea class="as-txt" placeholder="Nhập văn bản cần đóng dấu khóa..." style="width:100%;height:60px;padding:8px;"></textarea>
        <button class="as-btn" style="background:#eab308;color:black;padding:10px;font-weight:bold;margin-top:5px;width:100%;">Ký Đóng Mộc (Off-chain)</button>
        <div class="as-res" style="word-break:break-all;font-size:10px;color:#fef08a;margin-top:10px;background:#422006;padding:5px;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
             let btn = document.currentScript.previousElementSibling.querySelector('.as-btn');
             let txt = document.currentScript.previousElementSibling.querySelector('.as-txt');
             let res = document.currentScript.previousElementSibling.querySelector('.as-res');
             btn.addEventListener('click', async () => {
                 if(!window.walletAddress) return alert('Cần Ví Metamask để lấy con dấu!');
                 res.innerHTML = 'Đợi duyệt Metamask...';
                 try {
                     const provider = new ethers.providers.Web3Provider(window.ethereum);
                     const signer = provider.getSigner();
                     const sig = await signer.signMessage(txt.value);
                     res.innerHTML = '<b>CHỮ KÝ (Lưu lại chuỗi này):</b><br/>' + sig;
                 } catch(e) { res.innerHTML = 'Người dùng từ chối đóng dấu!'; }
             });
        });
    </script>\`
    },
    {
        id: "auth-verify", name: "🔎 Máy Quét Kính Lúp (Verify)", color: "#14b8a6", desc: "Quét xem văn bản có bị giả mạo chữ ký không.", label: "Bảo Mật",
        preview: () => '<div style="background:#042f2e;color:#5eead4;padding:15px;border-left:4px solid #14b8a6;">🔎 KÍNH LÚP XÁC THỰC</div>',
        exportHtml: (tk) => \`
    <div class="khoi" style="border-left-color:#14b8a6;background:rgba(20,184,166,0.05);padding:15px;">
        <div style="color:#5eead4;font-weight:bold;margin-bottom:12px;">🔎 MÁY PHÁT HIỆN HÀNG GIẢ (VERIFY)</div>
        <input type="text" class="av-txt" placeholder="Văn bản gốc..." style="width:100%;padding:5px;margin-bottom:5px;">
        <input type="text" class="av-sig" placeholder="Chữ ký (0x...)..." style="width:100%;padding:5px;margin-bottom:5px;">
        <button class="av-btn" style="background:#14b8a6;color:white;padding:10px;font-weight:bold;width:100%;">Xác Thực Cấp Tốc</button>
        <div class="av-res" style="font-size:12px;color:#ccfbf1;margin-top:10px;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
             let btn = document.currentScript.previousElementSibling.querySelector('.av-btn');
             let txt = document.currentScript.previousElementSibling.querySelector('.av-txt');
             let sig = document.currentScript.previousElementSibling.querySelector('.av-sig');
             let res = document.currentScript.previousElementSibling.querySelector('.av-res');
             btn.addEventListener('click', () => {
                 try {
                     const signerAddr = ethers.utils.verifyMessage(txt.value, sig.value);
                     res.innerHTML = '✅ <b>Văn Bản Thật!</b><br>Ký bởi: ' + signerAddr;
                 } catch(e) { res.innerHTML = '❌ <b>Giả Mạo!</b> Chữ ký không khớp nội dung.'; }
             });
        });
    </script>\`
    },
    {
        id: "hall-of-fame", name: "🏆 Bảng Vàng Danh Dự", color: "#f59e0b", desc: "Lưu điểm thi bất biến lên smart contract.", label: "Bảo Mật",
        config: [{ id: "contractUrl", label: "Địa Chỉ SC Bảng Vàng", type: "string" }],
        preview: () => '<div style="background:#451a03;color:#fcd34d;padding:15px;border-left:4px solid #f59e0b;">🏆 BẢNG VÀNG LƯU DANH</div>',
        exportHtml: (tk) => {
            let addr = tk.contractData?.contractUrl || "0x0";
            return \`
    <div class="khoi" style="border-left-color:#f59e0b;background:rgba(245,158,11,0.05);padding:15px;">
        <div style="color:#fcd34d;font-weight:bold;margin-bottom:12px;">🏆 KHẮC TÊN LÊN ĐÁ BIA (BLOCKCHAIN)</div>
        <input type="text" class="hf-name" placeholder="Tên học sinh" style="width:48%;padding:8px;">
        <input type="number" class="hf-score" placeholder="Điểm số (VD: 100)" style="width:48%;padding:8px;">
        <button class="hf-btn" style="background:#f59e0b;color:black;font-weight:bold;padding:10px;margin-top:10px;width:100%;">Khắc Lên Hệ Thống</button>
        <div class="hf-stt" style="font-size:11px;color:#cbd5e1;margin-top:10px;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.querySelector('.hf-btn');
            let txtN = document.currentScript.previousElementSibling.querySelector('.hf-name');
            let txtS = document.currentScript.previousElementSibling.querySelector('.hf-score');
            let stt = document.currentScript.previousElementSibling.querySelector('.hf-stt');
            btn.addEventListener('click', async () => {
                if(!window.walletAddress) return alert('Chưa kết nối ví!');
                stt.innerHTML = 'Đang gọi hợp đồng ghi mộc...';
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const abi = ["function recordScore(string name, uint256 score)"];
                    const contract = new ethers.Contract("\${addr}", abi, provider.getSigner());
                    const tx = await contract.recordScore(txtN.value, txtS.value);
                    stt.innerHTML = 'Đang đào...';
                    await tx.wait();
                    stt.innerHTML = '✅ Khắc bia thành công vĩnh viễn!';
                } catch(e) { stt.innerHTML = '❌ Lỗi: ' + e.message.substring(0,80); }
            });
        });
    </script>\`;
        }
    },
    // ==================== KHỐI 12: TX-CHECK API V2 ====================
    {
        id: "tx-check",
        name: "📡 Radar Quét Giao Dịch",
        desc: "Sử dụng Etherscan V2 API quét lịch sử chuyển tiền của một ví.",
        color: "#4f46e5",
        label: "Hệ Thống Kiểm Tra",
        config: [{ id: "apiKey", label: "Etherscan API Key", type: "string" }],
        preview: (tk) => '<div style="background:#1e1b4b;color:#a5b4fc;padding:15px;border-left:4px solid #4f46e5;">📡 RADAR QUÉT GIAO DỊCH (V2)</div>',
        exportHtml: (tk) => {
            let apiKey = tk.contractData?.apiKey || "EGUX1WCJ8EHBX59F1EP7QGUKFTT2WRXYVR";
            return \`
    <div class="khoi" style="border-left-color:#4f46e5;background:rgba(79,70,229,0.05);padding:15px;">
        <div style="color:#a5b4fc;font-weight:bold;margin-bottom:12px;">📡 RADAR QUÉT LỊCH SỬ GIAO DỊCH (V2)</div>
        <input type="text" class="tx-inp" placeholder="Nhập địa chỉ ví 0x..." style="width:100%;padding:10px;margin-bottom:10px;">
        <input type="hidden" class="tx-key" value="\${apiKey}">
        <button class="tx-btn" style="background:#4f46e5;color:white;padding:10px 20px;border:none;border-radius:8px;">Quét Radar</button>
        <div class="tx-stt" style="margin-top:10px;font-size:12px;color:#cbd5e1;"></div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btn = document.currentScript.previousElementSibling.querySelector('.tx-btn');
            let stt = document.currentScript.previousElementSibling.querySelector('.tx-stt');
            let inp = document.currentScript.previousElementSibling.querySelector('.tx-inp');
            let key = document.currentScript.previousElementSibling.querySelector('.tx-key').value;
            
            btn.addEventListener('click', async () => {
                let wallet = inp.value.trim();
                if(!wallet) return;
                stt.innerHTML = 'Đang quét Etherscan V2 API...';
                try {
                    const url = \\\`https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist&address=\\\${wallet}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=\\\${key}\\\`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if(data.status === "1" && data.result.length > 0) {
                        let html = data.result.slice(0, 3).map(tx => \\\`<div style="padding:5px;border-bottom:1px solid #333;">🟢 To: \\\${tx.to.substring(0,8)}...<br>Giá trị: \\\${tx.value} wei</div>\\\`).join('');
                        stt.innerHTML = html;
                    } else {
                        stt.innerHTML = 'Chưa có giao dịch! (status 0)';
                    }
                } catch(e) { stt.innerHTML = 'Lỗi kết nối API!'; }
            });
        });
    </script>\`;
        }
    }
];`;

const finalCode = beforeCode + realBlocks;
fs.writeFileSync(path, finalCode, 'utf8');
console.log('Successfully injected real blocks HTML!');
