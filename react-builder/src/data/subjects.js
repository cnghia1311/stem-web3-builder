export const LESSONS = [
    { id: "web3-bank", name: "🏛️ Bài 1: Ngân Hàng Web3", blocks: ["wallet", "balance", "transfer"] },
    { id: "faucet", name: "🎁 Bài 2: Vòi Nhận Token (Airdrop)", blocks: ["wallet", "balance", "claim"] },
    { id: "nft-gallery", name: "🖼️ Bài 3: Triển Lãm NFT", blocks: ["wallet", "mint-nft"] },
    { id: "dao-voting", name: "🗳️ Bài 4: Hệ Thống Bầu Cử DAO", blocks: ["wallet", "vote"] },
    { id: "charity", name: "💝 Bài 5: Quyên Góp Từ Thiện", blocks: ["wallet", "donate"] }
];

export const CATEGORIES = [
    { id: "all", name: "🌟 Tất Cả Khối", blocks: "all" },
    { id: "basic", name: "⚙️ Nhóm Cơ Bản", blocks: ["wallet"] },
    { id: "payment", name: "💰 Nhóm Tiền Tệ", blocks: ["balance", "transfer", "claim", "donate"] },
    { id: "nft", name: "🖼️ Nhóm NFT", blocks: ["mint-nft"] },
    { id: "dao", name: "🗳️ Nhóm DAO", blocks: ["vote"] }
];
