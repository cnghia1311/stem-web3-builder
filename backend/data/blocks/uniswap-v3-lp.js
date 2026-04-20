// ==================== KHỐI: CUNG CẤP THANH KHOẢN UNISWAP V3 ====================
export default {
    id: "uniswap-v3-lp",
    name: "💧 Cung Cấp Thanh Khoản",
    desc: "Tạo Pool & thêm thanh khoản trên Uniswap V3, nhận NFT Position",
    color: "#06b6d4",
    label: "DeFi - Thanh Khoản",
    preview: () => `
        <div style="padding:15px;background:#0f172a;border-radius:10px;border-left:4px solid #06b6d4;box-shadow:0 4px 15px rgba(6,182,212,0.2);">
            <div style="color:#22d3ee;font-size:12px;font-weight:bold;margin-bottom:10px;display:flex;align-items:center;">
                <span style="font-size:16px;margin-right:5px;">💧</span> CUNG CẤP THANH KHOẢN V3
            </div>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
                <div style="flex:1;background:#1e293b;border-radius:6px;padding:6px;text-align:center;font-size:10px;color:#94a3b8;">Token A<br/><span style="color:#06b6d4;">500.00</span></div>
                <div style="display:flex;align-items:center;color:#06b6d4;font-size:14px;">+</div>
                <div style="flex:1;background:#1e293b;border-radius:6px;padding:6px;text-align:center;font-size:10px;color:#94a3b8;">Token B<br/><span style="color:#06b6d4;">500.00</span></div>
            </div>
            <button class="pv-btn" disabled style="background:#06b6d4;padding:6px;width:100%;font-size:10px;">💧 Thêm Thanh Khoản</button>
        </div>`,
    exportHtml: (tk) => `
    <div class="khoi" style="border-left-color:#06b6d4;background:rgba(6,182,212,0.05);padding:20px;max-width:450px;margin:0 auto;">
        <div class="khoi-title" style="color:#22d3ee;font-size:14px;display:flex;align-items:center;margin-bottom:15px;justify-content:center;">
            <span style="font-size:22px;margin-right:8px;">💧</span> CUNG CẤP THANH KHOẢN V3
        </div>
        <div style="display:flex;gap:10px;margin-bottom:15px;">
            <select id="lp-network-sel" style="flex:1;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;">
                <option value="sepolia">Sepolia Testnet</option>
                <option value="ethereum">Ethereum Mainnet</option>
                <option value="base">Base</option>
                <option value="polygon">Polygon POS</option>
                <option value="arbitrum">Arbitrum</option>
            </select>
            <select id="lp-fee-sel" style="width:110px;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;">
                <option value="500">0.05%</option>
                <option value="3000" selected>0.3%</option>
                <option value="10000">1%</option>
            </select>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:10px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:8px;font-weight:bold;">Token A (ERC-20)</label>
            <input type="text" id="lp-token-a" placeholder="Địa chỉ Token A (0x...)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <input type="number" id="lp-amount-a" placeholder="Nhập đủ 2 địa chỉ token trước" disabled style="flex:1;padding:12px;border-radius:8px;border:1px solid #06b6d4;background:#1e293b;color:white;font-size:16px;font-weight:bold;outline:none;opacity:0.4;">
                <span id="lp-symbol-a" style="color:#06b6d4;font-size:13px;font-weight:bold;min-width:50px;">TOKEN</span>
            </div>
        </div>
        <div style="text-align:center;margin:-15px 0;position:relative;z-index:10;">
            <div style="display:inline-flex;background:#1e293b;border:4px solid #0f172a;border-radius:50%;padding:8px;color:#06b6d4;font-weight:bold;">＋</div>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:15px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:8px;font-weight:bold;">Token B (ERC-20)</label>
            <input type="text" id="lp-token-b" placeholder="Địa chỉ Token B (0x...)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <input type="number" id="lp-amount-b" placeholder="Nhập đủ 2 địa chỉ token trước" disabled style="flex:1;padding:12px;border-radius:8px;border:1px solid #06b6d4;background:#1e293b;color:white;font-size:16px;font-weight:bold;outline:none;opacity:0.4;">
                <span id="lp-symbol-b" style="color:#06b6d4;font-size:13px;font-weight:bold;min-width:50px;">TOKEN</span>
            </div>
        </div>
        <div id="lp-info" style="background:rgba(6,182,212,0.08);border:1px solid #334155;border-radius:10px;padding:12px;margin-bottom:15px;text-align:center;font-size:12px;color:#94a3b8;">
            💧 Thanh khoản Full Range — Bao phủ toàn bộ khoảng giá
        </div>
        <button id="lp-add-btn" style="background:linear-gradient(45deg,#06b6d4,#0891b2);width:100%;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;color:white;transition:all 0.2s;box-shadow:0 4px 15px rgba(6,182,212,0.3);">💧 THÊM THANH KHOẢN</button>
        <div id="lp-status" style="margin-top:15px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>
    </div>`,
    engineCode: (pfx) => {
        return `
    {
        const LP_PM = {
            "sepolia":  "0x1238536071E1c677A632429e3655c799b22cDA52",
            "ethereum": "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            "base":     "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
            "polygon":  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            "arbitrum": "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
        };
        const LP_FACTORY = {
            "sepolia":  "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
            "ethereum": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            "base":     "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
            "polygon":  "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            "arbitrum": "0x1F98431c8aD98523631AE4a59f267346ea31F984"
        };
        const TICK_SPACINGS = { 500: 10, 3000: 60, 10000: 200 };
        function fullRangeTicks(fee) {
            var sp = TICK_SPACINGS[fee] || 60;
            return { lower: Math.ceil(-887272 / sp) * sp, upper: Math.floor(887272 / sp) * sp };
        }

        const ERC20_ABI = [
            "function approve(address,uint256) returns(bool)",
            "function decimals() view returns(uint8)",
            "function symbol() view returns(string)",
            "function allowance(address,address) view returns(uint256)"
        ];
        const PM_ABI = [
            "function mint(tuple(address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint256 amount0Desired,uint256 amount1Desired,uint256 amount0Min,uint256 amount1Min,address recipient,uint256 deadline)) external payable returns(uint256 tokenId,uint128 liquidity,uint256 amount0,uint256 amount1)",
            "function createAndInitializePoolIfNecessary(address token0,address token1,uint24 fee,uint160 sqrtPriceX96) external payable returns(address pool)"
        ];
        const FACTORY_ABI = ["function getPool(address,address,uint24) view returns(address)"];
        const POOL_ABI = ["function slot0() view returns(uint160 sqrtPriceX96,int24 tick,uint16,uint16,uint16,uint8,bool)"];
        var _poolPrice = null; var _poolExists = false; var _decA = 18; var _decB = 18; var _isAToken0 = true;

        const lpBtn = document.getElementById('lp-add-btn');
        if (lpBtn) {
            const _cont = lpBtn.closest('.khoi');
            const _net = _cont.querySelector('#lp-network-sel');
            const _fee = _cont.querySelector('#lp-fee-sel');
            const _tA = _cont.querySelector('#lp-token-a');
            const _tB = _cont.querySelector('#lp-token-b');
            const _amtA = _cont.querySelector('#lp-amount-a');
            const _amtB = _cont.querySelector('#lp-amount-b');
            const _symA = _cont.querySelector('#lp-symbol-a');
            const _symB = _cont.querySelector('#lp-symbol-b');
            const _info = _cont.querySelector('#lp-info');
            const _stt = _cont.querySelector('#lp-status');

            // Auto-fetch symbol khi nhập địa chỉ token
            async function fetchSymbol(addr, symEl) {
                if (!signer || !addr || addr.length !== 42) { symEl.innerText = 'TOKEN'; return; }
                try {
                    var c = new ethers.Contract(addr, ERC20_ABI, signer);
                    symEl.innerText = await c.symbol();
                } catch(e) { symEl.innerText = 'TOKEN'; }
            }

            // Auto-check pool khi nhập đủ 2 địa chỉ token
            var _poolTimer;
            function enableAmounts(on) {
                _amtA.disabled = !on; _amtB.disabled = !on;
                _amtA.style.opacity = on ? '1' : '0.4';
                _amtB.style.opacity = on ? '1' : '0.4';
                if (on) { _amtA.placeholder = '0.0'; _amtB.placeholder = '0.0'; }
                else { _amtA.placeholder = 'Nhập đủ 2 địa chỉ token trước'; _amtB.placeholder = 'Nhập đủ 2 địa chỉ token trước'; }
            }
            async function checkPool() {
                var addrA = _tA.value.trim();
                var addrB = _tB.value.trim();
                var net = _net.value;
                var fee = parseInt(_fee.value);
                _poolExists = false; _poolPrice = null;
                if (!signer || !addrA || addrA.length !== 42 || !addrB || addrB.length !== 42 || !LP_FACTORY[net]) {
                    _info.innerHTML = '💧 Nhập đủ 2 địa chỉ token để kiểm tra Pool';
                    enableAmounts(false);
                    return;
                }
                try {
                    _info.innerHTML = '⏳ Đang kiểm tra Pool...';
                    // Fetch decimals
                    try { _decA = await new ethers.Contract(addrA, ERC20_ABI, signer).decimals(); } catch(e){ _decA = 18; }
                    try { _decB = await new ethers.Contract(addrB, ERC20_ABI, signer).decimals(); } catch(e){ _decB = 18; }
                    _isAToken0 = addrA.toLowerCase() < addrB.toLowerCase();
                    var t0 = _isAToken0 ? addrA : addrB;
                    var t1 = _isAToken0 ? addrB : addrA;
                    var factory = new ethers.Contract(LP_FACTORY[net], FACTORY_ABI, signer);
                    var poolAddr = await factory.getPool(t0, t1, fee);
                    var scanUrls = { sepolia:'https://sepolia.etherscan.io/address/', ethereum:'https://etherscan.io/address/', base:'https://basescan.org/address/', polygon:'https://polygonscan.com/address/', arbitrum:'https://arbiscan.io/address/' };
                    var scanBase = scanUrls[net] || scanUrls.sepolia;
                    if (poolAddr && poolAddr !== ethers.constants.AddressZero) {
                        _poolExists = true;
                        // Đọc giá hiện tại từ Pool
                        var pool = new ethers.Contract(poolAddr, POOL_ABI, signer);
                        var slot = await pool.slot0();
                        var sqrtP = parseFloat(slot.sqrtPriceX96.toString());
                        var q96 = parseFloat(ethers.BigNumber.from(2).pow(96).toString());
                        var rawPrice = (sqrtP / q96) * (sqrtP / q96);
                        _poolPrice = rawPrice;
                        // Tính giá hiển thị
                        var dec0 = _isAToken0 ? _decA : _decB;
                        var dec1 = _isAToken0 ? _decB : _decA;
                        var humanPrice = rawPrice * Math.pow(10, dec0 - dec1);
                        var symA = _symA.innerText || 'A';
                        var symB = _symB.innerText || 'B';
                        var priceStr = _isAToken0 ? (humanPrice.toFixed(6) + ' ' + symB + '/' + symA) : ((1/humanPrice).toFixed(6) + ' ' + symA + '/' + symB);
                        _info.innerHTML = '✅ Pool có sẵn — Tỉ giá: <strong>' + priceStr + '</strong><br/><a href="' + scanBase + poolAddr + '" target="_blank" style="color:#06b6d4;font-size:11px;word-break:break-all;">' + poolAddr + '</a>';
                    } else {
                        _info.innerHTML = '🆕 Pool chưa tồn tại — nhập số lượng tự do để đặt tỉ giá ban đầu';
                    }
                    enableAmounts(true);
                } catch(e) {
                    _info.innerHTML = '⚠️ Lỗi kiểm tra: ' + (e.reason||e.message||'').substring(0,60);
                    enableAmounts(true);
                }
            }
            function triggerPoolCheck() { clearTimeout(_poolTimer); _poolTimer = setTimeout(checkPool, 800); }

            // Auto-calc khi pool có sẵn
            var _calcLock = false;
            function autoCalcB() {
                if (_calcLock || !_poolExists || !_poolPrice) return;
                var valA = parseFloat(_amtA.value);
                if (!valA || isNaN(valA)) return;
                _calcLock = true;
                var dec0 = _isAToken0 ? _decA : _decB;
                var dec1 = _isAToken0 ? _decB : _decA;
                var humanPrice = _poolPrice * Math.pow(10, dec0 - dec1);
                _amtB.value = _isAToken0 ? (valA * humanPrice).toFixed(6) : (valA / humanPrice).toFixed(6);
                _calcLock = false;
            }
            function autoCalcA() {
                if (_calcLock || !_poolExists || !_poolPrice) return;
                var valB = parseFloat(_amtB.value);
                if (!valB || isNaN(valB)) return;
                _calcLock = true;
                var dec0 = _isAToken0 ? _decA : _decB;
                var dec1 = _isAToken0 ? _decB : _decA;
                var humanPrice = _poolPrice * Math.pow(10, dec0 - dec1);
                _amtA.value = _isAToken0 ? (valB / humanPrice).toFixed(6) : (valB * humanPrice).toFixed(6);
                _calcLock = false;
            }

            var _tATimer, _tBTimer;
            _tA.addEventListener('input', function(){ clearTimeout(_tATimer); _tATimer = setTimeout(function(){ fetchSymbol(_tA.value.trim(), _symA); }, 600); triggerPoolCheck(); });
            _tB.addEventListener('input', function(){ clearTimeout(_tBTimer); _tBTimer = setTimeout(function(){ fetchSymbol(_tB.value.trim(), _symB); }, 600); triggerPoolCheck(); });
            _amtA.addEventListener('input', autoCalcB);
            _amtB.addEventListener('input', autoCalcA);
            _net.addEventListener('change', triggerPoolCheck);
            _fee.addEventListener('change', triggerPoolCheck);
            setTimeout(checkPool, 2000);
            // Tự động check lại khi ví được kết nối (sau khi nhập token)
            if (window.ethereum) {
                window.ethereum.on('accountsChanged', function(){ setTimeout(checkPool, 500); });
                window.ethereum.on('chainChanged', function(){ setTimeout(checkPool, 500); });
            }
            // Poll: kiểm tra khi signer xuất hiện
            var _signerPoll = setInterval(function(){
                if (signer && _tA.value.trim().length === 42 && _tB.value.trim().length === 42 && _amtA.disabled) {
                    clearInterval(_signerPoll);
                    checkPool();
                }
            }, 1000);

            lpBtn.addEventListener('click', async function() {
                if (!signer) { toast('error','Cần kết nối ví (🦊) trước!'); return; }
                try {
                    lpBtn.disabled = true; lpBtn.style.opacity = '0.5';
                    var net = _net.value;
                    var fee = parseInt(_fee.value);
                    var addrA = _tA.value.trim();
                    var addrB = _tB.value.trim();
                    var valA = _amtA.value.trim();
                    var valB = _amtB.value.trim();
                    if (!addrA || addrA.length !== 42) throw new Error('Địa chỉ Token A không hợp lệ!');
                    if (!addrB || addrB.length !== 42) throw new Error('Địa chỉ Token B không hợp lệ!');
                    if (addrA.toLowerCase() === addrB.toLowerCase()) throw new Error('Hai token phải khác nhau!');
                    if (!valA || isNaN(valA) || Number(valA) <= 0) throw new Error('Nhập số lượng Token A!');
                    if (!valB || isNaN(valB) || Number(valB) <= 0) throw new Error('Nhập số lượng Token B!');
                    if (!LP_PM[net]) throw new Error('Mạng chưa được hỗ trợ!');

                    _stt.innerText = 'Đang đọc thông tin token...';
                    var cA = new ethers.Contract(addrA, ERC20_ABI, signer);
                    var cB = new ethers.Contract(addrB, ERC20_ABI, signer);
                    var decA = 18, decB = 18;
                    try { decA = await cA.decimals(); } catch(e){}
                    try { decB = await cB.decimals(); } catch(e){}
                    var amtA = ethers.utils.parseUnits(valA, decA);
                    var amtB = ethers.utils.parseUnits(valB, decB);

                    // Sắp xếp token0 < token1 (bắt buộc bởi Uniswap V3)
                    var token0, token1, amount0, amount1;
                    if (addrA.toLowerCase() < addrB.toLowerCase()) {
                        token0 = addrA; token1 = addrB; amount0 = amtA; amount1 = amtB;
                    } else {
                        token0 = addrB; token1 = addrA; amount0 = amtB; amount1 = amtA;
                    }

                    var pmAddr = LP_PM[net];
                    var factoryAddr = LP_FACTORY[net];
                    var pm = new ethers.Contract(pmAddr, PM_ABI, signer);

                    // Kiểm tra pool đã tồn tại chưa
                    _stt.innerText = 'Kiểm tra Pool trên Uniswap V3...';
                    var factory = new ethers.Contract(factoryAddr, FACTORY_ABI, signer);
                    var poolAddr = await factory.getPool(token0, token1, fee);
                    var poolExists = poolAddr && poolAddr !== ethers.constants.AddressZero;

                    if (!poolExists) {
                        _stt.innerHTML = '<span style=\"color:#f59e0b;\">Pool chưa tồn tại — Đang tạo mới với tỉ lệ bạn nhập...</span>';
                        // Tính sqrtPriceX96 từ số lượng user nhập
                        // sqrtPriceX96 = sqrt(amount1 / amount0) * 2^96
                        var num0 = parseFloat(amount0.toString());
                        var num1 = parseFloat(amount1.toString());
                        var sqrtRatio = Math.sqrt(num1 / num0);
                        // Tách 2^96 = 2^48 * 2^48 để tránh mất độ chính xác JS
                        var pHalf = Math.floor(sqrtRatio * (2 ** 48));
                        var sqrtPrice = ethers.BigNumber.from(pHalf.toString()).mul(ethers.BigNumber.from(2).pow(48));
                        var txInit = await pm.createAndInitializePoolIfNecessary(token0, token1, fee, sqrtPrice);
                        await txInit.wait();
                        _stt.innerHTML = '<span style=\"color:#10b981;\">✅ Pool đã được tạo!</span>';
                    }

                    // Approve Token A
                    _stt.innerText = 'Xin quyền chuyển Token A (Approve)... (1/3)';
                    var txAp1 = await cA.approve(pmAddr, ethers.constants.MaxUint256);
                    await txAp1.wait();

                    // Approve Token B
                    _stt.innerText = 'Xin quyền chuyển Token B (Approve)... (2/3)';
                    var txAp2 = await cB.approve(pmAddr, ethers.constants.MaxUint256);
                    await txAp2.wait();

                    // Mint position (Full Range)
                    _stt.innerHTML = '<span style=\"color:#3b82f6;\">Chờ ký giao dịch Thêm Thanh Khoản... (3/3)</span>';
                    var ticks = fullRangeTicks(fee);
                    var deadline = Math.floor(Date.now() / 1000) + 600;
                    var mintParams = {
                        token0: token0, token1: token1, fee: fee,
                        tickLower: ticks.lower, tickUpper: ticks.upper,
                        amount0Desired: amount0, amount1Desired: amount1,
                        amount0Min: 0, amount1Min: 0,
                        recipient: userAddr, deadline: deadline
                    };
                    var txMint = await pm.mint(mintParams);
                    _stt.innerText = 'Đợi Blockchain xác nhận...';
                    var receipt = await txMint.wait();

                    // Tìm tokenId từ event Transfer (ERC721)
                    var nftId = '';
                    for (var log of receipt.logs) {
                        if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics.length === 4) {
                            nftId = ethers.BigNumber.from(log.topics[3]).toString();
                            break;
                        }
                    }

                    // Lấy địa chỉ Pool từ Factory
                    var finalPoolAddr = await factory.getPool(token0, token1, fee);
                    var explorerUrl = {
                        sepolia: 'https://sepolia.etherscan.io/address/',
                        ethereum: 'https://etherscan.io/address/',
                        base: 'https://basescan.org/address/',
                        polygon: 'https://polygonscan.com/address/',
                        arbitrum: 'https://arbiscan.io/address/'
                    };
                    var scanBase = explorerUrl[net] || explorerUrl.sepolia;

                    var resultHtml = '<div style="text-align:center;">';
                    resultHtml += '<div style="color:#10b981;font-size:14px;font-weight:bold;margin-bottom:8px;">🎉 THÀNH CÔNG!</div>';
                    if (nftId) resultHtml += '<div style="margin-bottom:6px;">🖼️ NFT Position: <strong>#' + nftId + '</strong></div>';
                    resultHtml += '<div style="margin-bottom:6px;">🏊 Pool Contract:</div>';
                    resultHtml += '<a href="' + scanBase + finalPoolAddr + '" target="_blank" style="color:#06b6d4;word-break:break-all;font-size:11px;text-decoration:underline;">' + finalPoolAddr + '</a>';
                    resultHtml += '</div>';
                    _stt.innerHTML = resultHtml;

                    toast('success', 'Đã thêm thanh khoản! Pool: ' + finalPoolAddr.substring(0,10) + '...');
                    if (window.stemEvents) window.stemEvents.dispatchEvent(new Event('GIAO_DICH_THANH_CONG'));
                } catch(e) {
                    var msg = e.reason || e.message;
                    if (msg.includes('user rejected')) msg = 'Bạn đã từ chối ký giao dịch!';
                    _stt.innerHTML = '<span style=\"color:#ef4444;\">❌ ' + msg.substring(0,100) + '</span>';
                    toast('error', msg);
                } finally { lpBtn.disabled = false; lpBtn.style.opacity = '1'; }
            });
        }
    }`;
    }
}
