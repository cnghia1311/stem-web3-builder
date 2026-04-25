// ==================== KHỐI: MINT NFT (ĐÚC NFT VÀO BỘ SƯU TẬP) ====================
export default {
    id: "mint-nft",
    name: "🖌️ Đúc NFT (Mint)",
    desc: "Upload ảnh & Mint NFT vào Bộ Sưu Tập ERC-721",
    color: "#ec4899",
    label: "Đúc NFT",
    exportHtml: () => `
    <div class="khoi" style="border-left-color:#ec4899;">
        <div class="khoi-title" style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:24px;">🖌️</span>
            <span style="background:linear-gradient(135deg,#ec4899,#f43f5e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:16px;letter-spacing:1px;">ĐÚC NFT (MINT)</span>
        </div>

        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:15px;margin-bottom:12px;">
            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Địa chỉ Contract Bộ Sưu Tập</label>
            <input type="text" id="mint-collection-addr" placeholder="Dán địa chỉ từ Khối Tạo BST (0x...)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">📷 Hình ảnh NFT</label>
            <div id="mint-upload-zone" style="border:2px dashed #334155;border-radius:10px;padding:20px;text-align:center;cursor:pointer;margin-bottom:12px;transition:all 0.2s;">
                <input type="file" id="mint-file-input" accept="image/*" style="display:none;">
                <div id="mint-upload-icon" style="font-size:40px;margin-bottom:8px;">📁</div>
                <div id="mint-upload-text" style="font-size:12px;color:#94a3b8;">Bấm để chọn ảnh hoặc kéo thả vào đây</div>
                <img id="mint-preview-img" src="" style="display:none;max-width:100%;max-height:200px;border-radius:8px;margin-top:10px;">
            </div>

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Tên NFT</label>
            <input type="text" id="mint-nft-name" placeholder="Ví dụ: Bức Tranh Hoàng Hôn #1" maxlength="64" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:14px;outline:none;margin-bottom:12px;">

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Mô tả (tuỳ chọn)</label>
            <textarea id="mint-nft-desc" placeholder="Ví dụ: Tác phẩm đầu tay của em..." maxlength="256" rows="2" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;resize:vertical;margin-bottom:12px;"></textarea>

            <label style="display:block;font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:bold;">Gửi đến ví (để trống = ví của bạn)</label>
            <input type="text" id="mint-recipient" placeholder="0x... (mặc định: ví đang kết nối)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:13px;outline:none;margin-bottom:4px;">
            <div style="font-size:10px;color:#64748b;margin-bottom:6px;">🖼️ Ảnh sẽ được tải lên IPFS (phi tập trung, tồn tại vĩnh viễn)</div>
        </div>

        <button id="mint-btn" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#ec4899,#f43f5e);color:white;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:1px;">🖌️ MINT NFT</button>

        <div id="mint-status" style="margin-top:10px;font-size:12px;text-align:center;color:#94a3b8;min-height:20px;"></div>

        <div id="mint-result" style="display:none;margin-top:12px;background:#0f2a1a;border:1px solid #10b981;border-radius:12px;padding:15px;">
            <div style="font-size:14px;font-weight:bold;color:#10b981;margin-bottom:8px;">🎉 NFT đã được Mint thành công!</div>
            <div style="text-align:center;margin-bottom:10px;">
                <img id="mint-result-img" src="" style="max-width:150px;border-radius:10px;box-shadow:0 4px 15px rgba(236,72,153,0.3);">
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Tên: <span id="mint-result-name" style="color:#e2e8f0;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Token ID: <span id="mint-result-tokenid" style="color:#ec4899;font-weight:bold;"></span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Địa chỉ Collection:</div>
            <div id="mint-result-address" style="background:#1e293b;padding:10px;border-radius:8px;font-size:12px;color:#06b6d4;word-break:break-all;cursor:pointer;text-align:center;" title="Bấm để copy"></div>
            <div style="text-align:center;margin-top:8px;">
                <a id="mint-result-link" href="#" target="_blank" style="color:#06b6d4;font-size:11px;text-decoration:underline;">🔗 Xem trên Etherscan</a>
            </div>
        </div>
    </div>`,

    engineCode: () => `
        const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiNTE1M2M0Yy1hMzg3LTRmZDEtODI0My1mZjM0MzU5YTM3MjYiLCJlbWFpbCI6ImNuZ2hpYTEzMTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBkZTFmNmJmODdiNzc5NTAzYTJlIiwic2NvcGVkS2V5U2VjcmV0IjoiZWIwNmNlMTZhNzEwYjJjYTk2MTU4ZGZkYjUyZGJlMTI1MjQwYzJlOGI3NjA2ODY0YmI5OWNkOTU1NzliMjg5NCIsImV4cCI6MTgwODY3MjE5NH0.VGKX8Fh2z49FpeyhVMCpIYrkwXoz4TfDRLDzyUSYFSM';
        const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

        const MINT_ABI = [
            "function mintNFT(address to, string memory uri) public returns (uint256)",
            "function getTotalMinted() view returns (uint256)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function owner() view returns (address)"
        ];

        const _mintBtn = document.getElementById('mint-btn');
        const _mintFile = document.getElementById('mint-file-input');
        const _mintZone = document.getElementById('mint-upload-zone');
        const _mintPreview = document.getElementById('mint-preview-img');
        const _mintUploadIcon = document.getElementById('mint-upload-icon');
        const _mintUploadText = document.getElementById('mint-upload-text');
        const _mintStatus = document.getElementById('mint-status');
        const _mintResult = document.getElementById('mint-result');

        var _selectedFile = null;

        if (_mintBtn) {
            // Click zone → trigger file input
            _mintZone.addEventListener('click', function() {
                _mintFile.click();
            });

            // Drag & Drop
            _mintZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                _mintZone.style.borderColor = '#ec4899';
                _mintZone.style.background = 'rgba(236,72,153,0.05)';
            });
            _mintZone.addEventListener('dragleave', function() {
                _mintZone.style.borderColor = '#334155';
                _mintZone.style.background = 'transparent';
            });
            _mintZone.addEventListener('drop', function(e) {
                e.preventDefault();
                _mintZone.style.borderColor = '#334155';
                _mintZone.style.background = 'transparent';
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                }
            });

            // File chọn từ input
            _mintFile.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    handleFileSelect(this.files[0]);
                }
            });

            function handleFileSelect(file) {
                if (!file.type.startsWith('image/')) {
                    toast('error', 'Chỉ chấp nhận file ảnh!');
                    return;
                }
                if (file.size > 10 * 1024 * 1024) {
                    toast('error', 'Ảnh quá lớn! Tối đa 10MB.');
                    return;
                }
                _selectedFile = file;
                var reader = new FileReader();
                reader.onload = function(e) {
                    _mintPreview.src = e.target.result;
                    _mintPreview.style.display = 'block';
                    _mintUploadIcon.style.display = 'none';
                    _mintUploadText.innerText = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
                };
                reader.readAsDataURL(file);
            }

            // Copy address khi click
            document.getElementById('mint-result-address').addEventListener('click', function() {
                navigator.clipboard.writeText(this.innerText).then(function(){
                    toast('success', '📋 Đã copy địa chỉ!');
                });
            });

            // === MINT ===
            _mintBtn.addEventListener('click', async function() {
                if (!signer) { toast('error', 'Cần kết nối ví (🦊) trước!'); return; }

                var colAddr = document.getElementById('mint-collection-addr').value.trim();
                var nftName = document.getElementById('mint-nft-name').value.trim();
                var nftDesc = document.getElementById('mint-nft-desc').value.trim();
                var recipient = document.getElementById('mint-recipient').value.trim();

                if (!colAddr || !colAddr.startsWith('0x') || colAddr.length !== 42) {
                    toast('error', 'Nhập địa chỉ Contract Bộ Sưu Tập hợp lệ!'); return;
                }
                if (!_selectedFile) { toast('error', 'Hãy chọn ảnh cho NFT!'); return; }
                if (!nftName) { toast('error', 'Nhập tên cho NFT!'); return; }
                if (!recipient) recipient = userAddr;
                if (!recipient.startsWith('0x') || recipient.length !== 42) {
                    toast('error', 'Địa chỉ ví nhận không hợp lệ!'); return;
                }

                try {
                    _mintBtn.disabled = true; _mintBtn.style.opacity = '0.5';
                    _mintResult.style.display = 'none';

                    // Bước 1: Upload ảnh lên IPFS qua Pinata
                    _mintStatus.innerHTML = '<span style="color:#ec4899;">📤 Bước 1/3: Đang tải ảnh lên IPFS...</span>';
                    var formData = new FormData();
                    formData.append('file', _selectedFile);
                    var pinOpts = JSON.stringify({ cidVersion: 1 });
                    formData.append('pinataOptions', pinOpts);

                    var imgRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + PINATA_JWT },
                        body: formData
                    });
                    if (!imgRes.ok) throw new Error('Upload ảnh thất bại! Status: ' + imgRes.status);
                    var imgData = await imgRes.json();
                    var imageURI = 'ipfs://' + imgData.IpfsHash;

                    // Bước 2: Tạo metadata JSON & upload lên IPFS
                    _mintStatus.innerHTML = '<span style="color:#ec4899;">📝 Bước 2/3: Đang tạo Metadata...</span>';
                    var metadata = {
                        name: nftName,
                        description: nftDesc || '',
                        image: imageURI
                    };
                    var metaRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + PINATA_JWT
                        },
                        body: JSON.stringify({
                            pinataContent: metadata,
                            pinataOptions: { cidVersion: 1 }
                        })
                    });
                    if (!metaRes.ok) throw new Error('Upload metadata thất bại! Status: ' + metaRes.status);
                    var metaData = await metaRes.json();
                    var tokenURI = 'ipfs://' + metaData.IpfsHash;

                    // Bước 3: Gọi Smart Contract để Mint
                    _mintStatus.innerHTML = '<span style="color:#ec4899;">⛏️ Bước 3/3: Đang Mint NFT... (Xác nhận trên MetaMask)</span>';
                    var collection = new ethers.Contract(colAddr, MINT_ABI, signer);

                    // Kiểm tra quyền Owner
                    try {
                        var contractOwner = await collection.owner();
                        if (contractOwner.toLowerCase() !== userAddr.toLowerCase()) {
                            throw new Error('Bạn không phải Owner của bộ sưu tập này! Chỉ Owner mới có quyền Mint.');
                        }
                    } catch(ownerErr) {
                        if (ownerErr.message.includes('Owner')) throw ownerErr;
                        // Nếu lỗi khác (contract không có hàm owner), bỏ qua check
                    }

                    var tx = await collection.mintNFT(recipient, tokenURI);
                    _mintStatus.innerHTML = '<span style="color:#ec4899;">⏳ Đang đợi Blockchain xác nhận...</span>';
                    var receipt = await tx.wait();

                    // Lấy tokenId từ Transfer event (ERC721 Transfer: from=0x0 khi mint)
                    var tokenId = '?';
                    for (var i = 0; i < receipt.logs.length; i++) {
                        try {
                            if (receipt.logs[i].topics && receipt.logs[i].topics.length === 4 &&
                                receipt.logs[i].topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
                                tokenId = parseInt(receipt.logs[i].topics[3], 16);
                                break;
                            }
                        } catch(e) {}
                    }

                    // Hiển thị kết quả
                    var scanBase = 'https://sepolia.etherscan.io/address/';
                    document.getElementById('mint-result-img').src = PINATA_GATEWAY + imgData.IpfsHash;
                    document.getElementById('mint-result-name').innerText = nftName;
                    document.getElementById('mint-result-tokenid').innerText = '#' + tokenId;
                    document.getElementById('mint-result-address').innerText = colAddr;
                    document.getElementById('mint-result-link').href = scanBase + colAddr;
                    _mintResult.style.display = 'block';

                    _mintStatus.innerHTML = '<span style="color:#10b981;">✅ Hoàn tất! NFT <strong>' + nftName + '</strong> (ID: #' + tokenId + ') đã được Mint!</span>';
                    toast('success', '🎉 Mint NFT thành công! Token ID: #' + tokenId);

                    // Reset form
                    document.getElementById('mint-nft-name').value = '';
                    document.getElementById('mint-nft-desc').value = '';
                    _selectedFile = null;
                    _mintPreview.style.display = 'none';
                    _mintUploadIcon.style.display = 'block';
                    _mintUploadText.innerText = 'Bấm để chọn ảnh hoặc kéo thả vào đây';

                } catch(e) {
                    var msg = e.reason || e.message || 'Lỗi không xác định';
                    if (msg.includes('user rejected')) msg = 'Bạn đã từ chối giao dịch trên MetaMask!';
                    _mintStatus.innerHTML = '<span style="color:#ef4444;">❌ ' + msg.substring(0, 100) + '</span>';
                    toast('error', 'Thất bại: ' + msg.substring(0, 60));
                } finally {
                    _mintBtn.disabled = false; _mintBtn.style.opacity = '1';
                }
            });
        }
    `,
    bindings: []
}
