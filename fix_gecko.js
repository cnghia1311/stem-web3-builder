const fs = require('fs');
let code = fs.readFileSync('react-builder/src/data/blocks.js', 'utf8');

// Find the gecko-chart block marker
const startMarker = '// ==================== KHỐI 5: BIỂU ĐỒ GECKOTERMINAL ====================';
const startIdx = code.indexOf(startMarker);

if (startIdx < 0) {
    console.log('ERROR: Cannot find KHỐI 5 marker');
    process.exit(1);
}

const before = code.substring(0, startIdx);

const twoBlocks = `// ==================== KHỐI 5: BIỂU ĐỒ GECKOTERMINAL ====================
    {
        id: "gecko-chart",
        name: "📈 Biểu Đồ Giá (GeckoTerminal)",
        desc: "Nhúng biểu đồ nến Nhật từ GeckoTerminal để phân tích giá Token.",
        color: "#1e293b",
        label: "Trạm Phân Tích Dữ Liệu",
        preview: (tk) => {
            return \`
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
            </div>\`;
        },
        exportHtml: (tk) => {
            return \`
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
    </div>\`;
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
            return \`
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
            </div>\`;
        },
        exportHtml: (tk) => {
            return \`
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
        <div style="width:100%;height:500px;border-radius:10px;overflow:hidden;border:1px solid #334155;background:#0f172a;">
            <iframe 
                height="100%" 
                width="100%" 
                title="GeckoTerminal Transactions" 
                src="https://www.geckoterminal.com/sepolia-testnet/pools/0xB09f73508e137B772F5ed0464badF99b6e3290A4?embed=1&info=1&swaps=1" 
                frameborder="0" 
                allow="clipboard-write" 
                allowfullscreen>
            </iframe>
        </div>
        <p style="font-size:10px;color:#64748b;text-align:center;margin-top:8px;">Dữ liệu cung cấp bởi GeckoTerminal</p>
    </div>\`;
        },
        engineCode: () => ''
    }
];
`;

const finalCode = before + twoBlocks;
fs.writeFileSync('react-builder/src/data/blocks.js', finalCode, 'utf8');
console.log('SUCCESS: Created 2 separate blocks (gecko-chart + gecko-txns)');
