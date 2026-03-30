const fs = require('fs');

const blocksJsPath = 'react-builder/src/data/blocks.js';
let code = fs.readFileSync(blocksJsPath, 'utf8');

if (!code.trim().endsWith('];')) {
    console.error('File does not end with ];. Aborting.');
    process.exit(1);
}

// Remove the trailing '];'
code = code.substring(0, code.lastIndexOf('];'));

const extraBlocks = `
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
            return \`
    <div class="khoi" style="border-left-color:#c026d3;background:rgba(192,38,211,0.05);padding:15px;">
        <div class="khoi-title" style="color:#e879f9;font-weight:bold;margin-bottom:12px;">🎰 MÁY QUAY GACHA NFT</div>
        <p style="font-size:10px;color:#a1a1aa;margin-bottom:10px;">Contract: \${addr}</p>
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
                    const contract = new ethers.Contract("\${addr}", abi, signer);
                    const tx = await contract.mintTo(window.walletAddress, 1);
                    await tx.wait();
                    stt.innerText = '✅ Thành công!';
                } catch(e) {
                    stt.innerText = '❌ Lỗi: ' + e.message.substring(0,50);
                }
            });
        });
    </script>\`;
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
            return \`
    <div class="khoi">🎒 TÚI ĐỒ TỪ GACHA <button class="g-btn">Tải đồ</button>
        <div class="g-stt"></div>
    </div>\`;
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
            return \`
    <div class="khoi" style="border-left-color:#4f46e5;background:rgba(79,70,229,0.05);padding:15px;">
        <div style="color:#a5b4fc;font-weight:bold;margin-bottom:12px;">📡 RADAR QUÉT LỊCH SỬ GIAO DỊCH (V2)</div>
        <input type="text" class="tx-inp" placeholder="Nhập địa chỉ ví 0x..." style="width:100%;padding:10px;margin-bottom:10px;">
        <input type="hidden" class="tx-key" value="\${apiKey}">
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
    </script>\`;
        }
    }
`;

fs.writeFileSync(blocksJsPath, code + extraBlocks + '\n];', 'utf8');
console.log('Restored 11 blocks successfully!');
