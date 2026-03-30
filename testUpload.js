const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const pinFileToIPFS = async () => {
    const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzOTI2NjgyZi01ZDJmLTQ5MGUtYmIyZC1kNmFkNWFkYzEyMWUiLCJlbWFpbCI6ImRvZ21pbmgzNzZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImViY2Q2MWIxYTI1NDczZTY0ZjFjIiwic2NvcGVkS2V5U2VjcmV0IjoiMzE4MjEzNjllNzk5ZjhjNWE4ZDBiYjk4NDk4ZmYwMThlNGJjMWFjNjkyN2M4NTVkMjM1YTkwNDNkMDg3ZmIxNyIsImV4cCI6MTgwNjAyODI1M30.lnc0UxdaRkn1NtBBQQ1lW9ciRBBbMfbKSuZfikDV4jk';
    const filePath = './apps/ng-n-h-ng-l-p-12a.html';
    
    // Check if file exists, if not use ng-n-h-ng-web3.html
    let targetFile = filePath;
    if (!fs.existsSync(filePath)) {
        targetFile = './apps/ng-n-h-ng-web3.html';
        if (!fs.existsSync(targetFile)) {
            console.error("Khong tim thay file HTML nao trong muc apps/");
            return;
        }
    }

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(targetFile));
        
        console.log("🚀 Đang đẩy file " + targetFile + " lên vệ tinh Pinata IPFS...");
        
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${JWT}`,
                ...formData.getHeaders()
            }
        });
        console.log("✅ TẢI LÊN THÀNH CÔNG (SUCCESS)!");
        console.log("🔗 Mã Hash IPFS: ", res.data.IpfsHash);
        console.log("🌐 TRANG WEB CỦA HỌC SINH ĐÃ CHẠY LIVE TẠI ĐÂY:");
        console.log("👉 https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash);
    } catch (error) {
        console.log("❌ LỖI (ERROR):");
        console.log(error.response ? error.response.data : error.message);
    }
}

pinFileToIPFS();
