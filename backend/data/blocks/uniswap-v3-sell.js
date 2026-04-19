// ==================== KHỐI 5: GIAO DỊCH UNISWAP V3 ====================
export default {
    id: "uniswap-v3-sell",
    name: "🦄 Trạm Hoán Đổi (Swap V3)",
    desc: "Giao diện Swap đa mạng với Uniswap V3. Hỗ trợ hoán đổi Native Token và ERC-20.",
    color: "#1e293b",
    label: "DeFi - Thanh Khoản",
    preview: (tk) => `
        <div style="padding:15px;background:#0f172a;border-radius:10px;border-left:4px solid #ec4899;box-shadow:0 4px 15px rgba(236,72,153,0.2);">
            <div style="color:#f472b6;font-size:12px;font-weight:bold;margin-bottom:10px;display:flex;align-items:center;">
                <span style="font-size:16px;margin-right:5px;">🦄</span> TRẠM HOÁN ĐỔI UNISWAP V3
            </div>
            <button class="pv-btn" disabled style="background:#ec4899;padding:6px;width:100%;font-size:10px;">🚀 SWAP</button>
        </div>`,
    exportHtml: (tk) => `
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
            <div style="display:inline-flex;background:#1e293b;border:4px solid #0f172a;border-radius:50%;padding:8px;color:#94a3b8;cursor:pointer;">⬇️</div>
        </div>
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
        <div id="swap-quote" style="background:rgba(16,185,129,0.08);border:1px solid #334155;border-radius:10px;padding:12px;margin-bottom:15px;text-align:center;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span style="color:#94a3b8;font-size:12px;">💱 Ước tính nhận:</span>
            <span id="swap-quote-value" style="color:#10b981;font-weight:bold;font-size:16px;">---</span>
        </div>
        <button id="swap-execute-btn" style="background:linear-gradient(45deg, #ec4899, #f43f5e);width:100%;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;color:white;transition:all 0.2s;box-shadow:0 4px 15px rgba(236,72,153,0.3);">🚀 THỰC HIỆN SWAP</button>
        <div id="swap-status" style="margin-top:15px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>
    </div>`,
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
        const QUOTERS = {
            "sepolia":  "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
            "ethereum": "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
            "base":     "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
            "bsc":      "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
            "polygon":  "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
            "arbitrum": "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
        };
        const _nativeSym = {sepolia:'ETH',ethereum:'ETH',base:'ETH',bsc:'BNB',polygon:'MATIC',arbitrum:'ETH'};

        const execBtn = document.getElementById('swap-execute-btn');
        
        if (execBtn) {
            const container = execBtn.closest('.khoi');
            const inRadios = container.querySelectorAll('input[name="token_in_type"]');
            const outRadios = container.querySelectorAll('input[name="token_out_type"]');
            const inAddr = container.querySelector('#swap-in-addr');
            const outAddr = container.querySelector('#swap-out-addr');
            const amtInp = container.querySelector('#swap-amount');
            const netSel = container.querySelector('#swap-network-sel');
            const feeSel = container.querySelector('#swap-fee-sel');
            const stt = container.querySelector('#swap-status');

            function updateInputs() {
                const isEqIn = [...inRadios].find(r=>r.checked).value;
                const isEqOut = [...outRadios].find(r=>r.checked).value;
                if (isEqIn === 'native') { inAddr.disabled = true; inAddr.placeholder = "Native Token (Tự động Wrap)"; inAddr.style.opacity = '0.6'; }
                else { inAddr.disabled = false; inAddr.placeholder = "Địa chỉ Token ERC-20 (0x...)"; inAddr.style.opacity = '1'; }
                if (isEqOut === 'native') { outAddr.disabled = true; outAddr.placeholder = "Native Token (Tự động Unwrap)"; outAddr.style.opacity = '0.6'; }
                else { outAddr.disabled = false; outAddr.placeholder = "Địa chỉ Token ERC-20 (0x...)"; outAddr.style.opacity = '1'; }
            }
            inRadios.forEach(r => r.addEventListener('change', updateInputs));
            outRadios.forEach(r => r.addEventListener('change', updateInputs));
            updateInputs();

            const quoteEl = container.querySelector('#swap-quote-value');
            let _qTimer = null;
            const getQuote = async () => {
                if (!quoteEl) return;
                if (!signer) { quoteEl.innerText = 'Kết nối ví trước'; return; }
                const amtVal = amtInp.value.trim();
                if (!amtVal || isNaN(amtVal) || Number(amtVal) <= 0) { quoteEl.innerText = '---'; return; }
                const _isIn = [...inRadios].find(r=>r.checked).value;
                const _isOut = [...outRadios].find(r=>r.checked).value;
                if (_isIn==='native' && _isOut==='native') { quoteEl.innerText = '---'; return; }
                const _net = netSel.value;
                if (!NETWORKS[_net] || !QUOTERS[_net]) { quoteEl.innerText = '?'; return; }
                const _WETH = NETWORKS[_net].w;
                const _FEE = parseInt(feeSel.value);
                let _tIn = _isIn==='native' ? _WETH : inAddr.value.trim();
                let _tOut = _isOut==='native' ? _WETH : outAddr.value.trim();
                if (!_tIn||_tIn.length!==42||!_tOut||_tOut.length!==42) { quoteEl.innerText = '---'; return; }
                try {
                    quoteEl.innerText = '⏳ ...'; quoteEl.style.color = '#94a3b8';
                    let _dIn = 18;
                    if (_isIn!=='native') { try { _dIn = await new ethers.Contract(_tIn,["function decimals() view returns(uint8)"],signer).decimals(); } catch(e){} }
                    const _amtIn = ethers.utils.parseUnits(amtVal, _dIn);
                    const _q = new ethers.Contract(QUOTERS[_net],["function quoteExactInputSingle(tuple(address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) public returns(uint256 amountOut,uint160,uint32,uint256)"], signer);
                    const _res = await _q.callStatic.quoteExactInputSingle({ tokenIn:_tIn, tokenOut:_tOut, amountIn:_amtIn, fee:_FEE, sqrtPriceLimitX96:0 });
                    let _dOut=18, _sym='';
                    if (_isOut!=='native') { try { const _c=new ethers.Contract(_tOut,["function decimals() view returns(uint8)","function symbol() view returns(string)"],signer); _dOut=await _c.decimals(); _sym=await _c.symbol(); } catch(e){ _sym='Token'; } }
                    else { _sym = _nativeSym[_net]||'ETH'; }
                    const _outAmt = _res.amountOut || _res[0];
                    const _fmtd = parseFloat(ethers.utils.formatUnits(_outAmt, _dOut));
                    quoteEl.innerText = '≈ ' + _fmtd.toLocaleString('en-US',{maximumFractionDigits:6}) + ' ' + _sym;
                    quoteEl.style.color = '#10b981';
                } catch(e) { quoteEl.innerText = 'Pool chưa khả dụng'; quoteEl.style.color = '#f59e0b'; }
            }
            const triggerQuote = () => { if(_qTimer) clearTimeout(_qTimer); _qTimer=setTimeout(getQuote,600); };
            amtInp.addEventListener('input', triggerQuote);
            inRadios.forEach(r => r.addEventListener('change', triggerQuote));
            outRadios.forEach(r => r.addEventListener('change', triggerQuote));
            netSel.addEventListener('change', triggerQuote);
            feeSel.addEventListener('change', triggerQuote);
            inAddr.addEventListener('input', triggerQuote);
            outAddr.addEventListener('input', triggerQuote);

            execBtn.addEventListener('click', async () => {
                if(!signer){ toast('error', 'Cần Kết Nối Ví (🦊) trước!'); return; }
                try {
                    execBtn.disabled = true; execBtn.style.opacity = "0.5"; stt.innerText = "Chuẩn bị giao dịch...";
                    const amtVal = amtInp.value.trim();
                    if(!amtVal || isNaN(amtVal) || Number(amtVal) <= 0) throw new Error('Nhập số lượng hợp lệ!');
                    const isEqIn = [...inRadios].find(r=>r.checked).value;
                    const isEqOut = [...outRadios].find(r=>r.checked).value;
                    if (isEqIn === 'native' && isEqOut === 'native') throw new Error('Không thể Swap Native sang Native!');
                    const net = netSel.value;
                    if (!NETWORKS[net]) throw new Error('Mạng không được hỗ trợ!');
                    const V3_ROUTER = NETWORKS[net].r; const WETH = NETWORKS[net].w; const FEE = parseInt(feeSel.value);
                    let tokenIn = isEqIn === 'native' ? WETH : inAddr.value.trim();
                    let tokenOut = isEqOut === 'native' ? WETH : outAddr.value.trim();
                    if (!tokenIn || !tokenIn.startsWith('0x') || tokenIn.length !== 42) throw new Error('Địa chỉ Token IN không hợp lệ');
                    if (!tokenOut || !tokenOut.startsWith('0x') || tokenOut.length !== 42) throw new Error('Địa chỉ Token OUT không hợp lệ');
                    const routerAbi = ["function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)","function unwrapWETH9(uint256 amountMinimum, address recipient) payable","function multicall(uint256 deadline, bytes[] data) payable returns (bytes[] results)"];
                    const router = new ethers.Contract(V3_ROUTER, routerAbi, signer);
                    const iface = new ethers.utils.Interface(routerAbi);
                    const userAddr = await signer.getAddress();
                    if (isEqIn === 'native') {
                        stt.innerText = "Kiểm tra số dư Native Token...";
                        const ethAmount = ethers.utils.parseEther(amtVal);
                        const ethBal = await provider.getBalance(userAddr);
                        if(ethBal.lt(ethAmount)) throw new Error('Không đủ số dư Native Token!');
                        stt.innerHTML = '<span style="color:#3b82f6;">Chờ ký xác nhận Swap trên MetaMask...</span>';
                        const tx = await router.exactInputSingle({ tokenIn: WETH, tokenOut: tokenOut, fee: FEE, recipient: userAddr, amountIn: ethAmount, amountOutMinimum: 0, sqrtPriceLimitX96: 0 }, { value: ethAmount });
                        stt.innerText = 'Đợi Blockchain xác nhận...'; await tx.wait();
                        stt.innerHTML = '<span style="color:#10b981;">🎉 SWAP THÀNH CÔNG!</span>'; toast('success', 'Swap Native Token thành công!');
                    } else if (isEqOut === 'native') {
                        const erc20Abi = ["function approve(address,uint256) returns(bool)", "function decimals() view returns(uint8)"];
                        const tIn = new ethers.Contract(tokenIn, erc20Abi, signer);
                        let dec = 18; try { dec = await tIn.decimals(); }catch(e){}
                        const amtTIn = ethers.utils.parseUnits(amtVal, dec);
                        stt.innerText = "Đang xin quyền chuyển Token (Approve)... (1/2)";
                        const txA = await tIn.approve(V3_ROUTER, ethers.constants.MaxUint256); await txA.wait();
                        stt.innerHTML = '<span style="color:#3b82f6;">Chờ ký giao dịch Swap + Unwrap... (2/2)</span>';
                        const callSwap = iface.encodeFunctionData('exactInputSingle', [{ tokenIn: tokenIn, tokenOut: WETH, fee: FEE, recipient: V3_ROUTER, amountIn: amtTIn, amountOutMinimum: 0, sqrtPriceLimitX96: 0 }]);
                        const callUnwrap = iface.encodeFunctionData('unwrapWETH9', [0, userAddr]);
                        const deadline = Math.floor(Date.now()/1000) + 600;
                        const txS = await router.multicall(deadline, [callSwap, callUnwrap]); stt.innerText = 'Đợi Blockchain xác nhận...'; await txS.wait();
                        stt.innerHTML = '<span style="color:#10b981;">🎉 SWAP THÀNH CÔNG! Đã nhận Native Token.</span>'; toast('success', 'Swap nhận Native Token thành công!');
                    } else {
                        const erc20Abi = ["function approve(address,uint256) returns(bool)", "function decimals() view returns(uint8)"];
                        const tIn = new ethers.Contract(tokenIn, erc20Abi, signer);
                        let dec = 18; try { dec = await tIn.decimals(); }catch(e){}
                        const amtTIn = ethers.utils.parseUnits(amtVal, dec);
                        stt.innerText = "Đang xin quyền chuyển Token (Approve)... (1/2)";
                        const txA = await tIn.approve(V3_ROUTER, ethers.constants.MaxUint256); await txA.wait();
                        stt.innerHTML = '<span style="color:#3b82f6;">Chờ ký giao dịch Swap... (2/2)</span>';
                        const tx = await router.exactInputSingle({ tokenIn: tokenIn, tokenOut: tokenOut, fee: FEE, recipient: userAddr, amountIn: amtTIn, amountOutMinimum: 0, sqrtPriceLimitX96: 0 });
                        stt.innerText = 'Đợi Blockchain xác nhận...'; await tx.wait();
                        stt.innerHTML = '<span style="color:#10b981;">🎉 SWAP THÀNH CÔNG!</span>'; toast('success', 'Swap Token ERC-20 thành công!');
                    }
                    if(window.stemEvents) window.stemEvents.dispatchEvent(new Event('GIAO_DICH_THANH_CONG'));
                } catch (e) {
                    let msg = e.reason || e.message;
                    if(msg.includes('user rejected')) msg = "Bạn đã từ chối ký giao dịch!";
                    if(msg.includes('TF')) msg = "Pool không tồn tại hoặc hết thanh khoản!";
                    stt.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0,80) + '</span>'; toast('error', msg);
                } finally { execBtn.disabled = false; execBtn.style.opacity = "1"; }
            });
        }
    }`;
    }
}
