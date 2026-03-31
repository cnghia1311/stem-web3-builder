export const LESSONS = [
    { id: "web3-bank", name: "🏛️ Bài 1: Ngân Hàng Web3", blocks: ["wallet", "balance", "transfer"] },
    { id: "nft-gacha", name: "🎰 Bài 2: Máy Gacha NFT", blocks: ["wallet", "gacha-drop", "drop-gallery"] },
    { id: "market-trade", name: "🛒 Bài 3: Lập Trình Siêu Thị (Shop)", blocks: ["wallet", "balance", "market-list", "market-cancel", "market-shop"] },
    { id: "soulbound-cert", name: "🎓 Bài 4: Bằng Khen & Danh Tính", blocks: ["wallet", "drop-airdrop", "profile-gallery", "auth-sign", "auth-verify", "hall-of-fame", "tx-check"] },
    { id: "dex-exchange", name: "🦄 Bài 5: Sàn Giao Dịch Phân Quyền (DEX)", blocks: ["wallet", "gecko-chart", "gecko-txns", "uniswap-v3-sell"] }
];

export const CATEGORIES = [
    { id: "all", name: "🌟 Tất Cả Khối", blocks: "all" },
    { id: "basic", name: "⚙️ Nhóm Cơ Bản", blocks: ["wallet"] },
    { id: "payment", name: "💰 Nhóm Tiền Tệ", blocks: ["balance", "transfer"] },
    { id: "nft", name: "🖼️ Nhóm Vật Phẩm", blocks: ["gacha-drop", "drop-gallery", "drop-airdrop", "profile-gallery", "auth-sign", "auth-verify", "hall-of-fame", "tx-check"] },
    { id: "market", name: "📈 Nhóm Thị Trường", blocks: ["market-list", "market-cancel", "market-shop", "uniswap-v3-sell", "gecko-chart", "gecko-txns"] }
];
