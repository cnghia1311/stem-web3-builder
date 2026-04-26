export const LESSONS = [
    { id: "web3-bank", name: "🏛️ Bài 1: Hệ Thống Coin Web3", blocks: ["wallet", "erc20-factory", "balance", "transfer"] },
    { id: "nft-gacha", name: "🎰 Bài 2: Máy Gacha NFT", blocks: ["wallet", "gacha-drop", "drop-gallery"] },
    { id: "market-trade", name: "🛒 Bài 3: Lập Trình Siêu Thị (Shop)", blocks: ["wallet", "balance", "market-list", "market-cancel", "market-shop"] },
    { id: "soulbound-cert", name: "🎓 Bài 4: Bằng Khen & Danh Tính", blocks: ["wallet", "drop-airdrop", "profile-gallery", "admin-revoke"] },
    { id: "dex-exchange", name: "🦄 Bài 5: Sàn Giao Dịch Phân Quyền (DEX)", blocks: ["wallet", "gecko-chart", "gecko-txns", "uniswap-v3-sell", "uniswap-v3-lp"] },
    { id: "dao-voting", name: "🗳️ Bài 6: Bầu Cử Phi Tập Trung (DAO)", blocks: ["wallet", "voting-factory", "dao-token-voting"] },
    { id: "token-factory", name: "🏭 Bài 7: Xưởng Tạo Token", blocks: ["wallet", "erc20-factory", "erc721-factory", "mint-nft", "admin-revoke", "balance"] }
]

export const CATEGORIES = [
    { id: "all", name: "🌟 Tất Cả Khối", blocks: "all" },
    { id: "basic", name: "⚙️ Nhóm Cơ Bản", blocks: ["wallet"] },
    { id: "payment", name: "💰 Nhóm Coin", blocks: ["erc20-factory", "balance", "transfer"] },
    { id: "nft", name: "🖼️ Nhóm Vật Phẩm", blocks: ["erc721-factory", "mint-nft", "admin-revoke", "gacha-drop", "drop-gallery", "drop-airdrop", "profile-gallery"] },
    { id: "market", name: "📈 Nhóm Thị Trường", blocks: ["market-factory", "market-list", "market-cancel", "market-shop", "uniswap-v3-sell", "uniswap-v3-lp", "gecko-chart", "gecko-txns"] },
    { id: "dao", name: "🗳️ Nhóm Tổ Chức (DAO)", blocks: ["voting-factory", "dao-token-voting"] }
]

