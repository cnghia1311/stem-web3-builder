// Mock blocks metadata — sẽ thay bằng API khi có backend
// contractFields: danh sách ô nhập contract mà block cần user điền
const BLOCKS_META = [
  {
    id: 'wallet', name: '🦊 Kết Nối Ví', desc: 'Nút MetaMask + Hiện địa chỉ',
    color: '#f59e0b', label: 'Ví của tôi', required: true,
    contractFields: [] // Wallet không cần contract
  },
  {
    id: 'balance', name: '💰 Hiện Số Dư Token', desc: 'Chọn coin từ danh sách',
    color: '#10b981', label: 'Số dư tài khoản',
    contractFields: [
      { key: 'tokenAddress', label: 'Địa chỉ Token (ERC-20)', placeholder: '0x... (địa chỉ contract token)' }
    ]
  },
  {
    id: 'transfer', name: '🚀 Chuyển Token', desc: 'Gửi coin đến địa chỉ khác',
    color: '#3b82f6', label: 'Chuyển tiền',
    contractFields: [
      { key: 'tokenAddress', label: 'Địa chỉ Token (ERC-20)', placeholder: '0x... (địa chỉ contract token)' }
    ]
  },
  {
    id: 'claim', name: '🎁 Nhận Lộng (Claim)', desc: 'Nhận Token miễn phí',
    color: '#3b82f6', label: 'Nhận lộng',
    contractFields: [
      { key: 'claimContract', label: 'Contract Claim', placeholder: '0x... (contract cho phép claim)' }
    ]
  },
  {
    id: 'gacha-drop', name: '🎰 Máy Gacha NFT', desc: 'Bấm quay ngẫu nhiên vật phẩm',
    color: '#8b5cf6', label: 'Gacha',
    contractFields: [
      { key: 'dropContract', label: 'Contract NFT Drop', placeholder: '0x... (Thirdweb Drop contract)' }
    ]
  },
  {
    id: 'drop-gallery', name: '🖼️ Bộ Sưu Tập NFT', desc: 'Hiện ảnh NFT đã sở hữu',
    color: '#ec4899', label: 'Bộ Sưu Tập',
    contractFields: [
      { key: 'nftContract', label: 'Contract NFT', placeholder: '0x... (ERC-721 hoặc ERC-1155)' }
    ]
  },
  {
    id: 'drop-airdrop', name: '🎁 Airdrop Token/NFT', desc: 'Nhận token miễn phí',
    color: '#14b8a6', label: 'Airdrop',
    contractFields: [
      { key: 'airdropContract', label: 'Contract Airdrop', placeholder: '0x... (contract airdrop)' }
    ]
  },
  {
    id: 'profile-gallery', name: '🪪 Thẻ Danh Tính SBT', desc: 'Soulbound Token cá nhân',
    color: '#f97316', label: 'Profile',
    contractFields: [
      { key: 'sbtContract', label: 'Contract SBT (ERC-1155)', placeholder: '0x... (Soulbound Token contract)' }
    ]
  },
  {
    id: 'market-list', name: '📝 Đăng Bán NFT', desc: 'Liệt kê NFT để bán',
    color: '#06b6d4', label: 'Đăng bán',
    contractFields: [
      { key: 'marketplaceContract', label: 'Contract Marketplace', placeholder: '0x... (Thirdweb Marketplace)' },
      { key: 'nftContract', label: 'Contract NFT', placeholder: '0x... (NFT collection contract)' }
    ]
  },
  {
    id: 'market-cancel', name: '❌ Hủy Bán NFT', desc: 'Hủy lệnh bán NFT',
    color: '#ef4444', label: 'Hủy bán',
    contractFields: [
      { key: 'marketplaceContract', label: 'Contract Marketplace', placeholder: '0x... (Thirdweb Marketplace)' }
    ]
  },
  {
    id: 'market-shop', name: '🛒 Cửa Hàng NFT', desc: 'Mua NFT từ marketplace',
    color: '#22c55e', label: 'Cửa Hàng',
    contractFields: [
      { key: 'marketplaceContract', label: 'Contract Marketplace', placeholder: '0x... (Thirdweb Marketplace)' }
    ]
  },
  {
    id: 'uniswap-v3-sell', name: '🦄 Swap Token (DEX)', desc: 'Đổi token qua Uniswap V3',
    color: '#ff007a', label: 'Swap',
    contractFields: [
      { key: 'routerAddress', label: 'Router Uniswap V3', placeholder: '0x... (SwapRouter address)' },
      { key: 'tokenIn', label: 'Token In (bán)', placeholder: '0x... (token muốn bán)' },
      { key: 'tokenOut', label: 'Token Out (mua)', placeholder: '0x... (token muốn mua)' }
    ]
  },
  {
    id: 'gecko-chart', name: '📈 Biểu Đồ Giá', desc: 'Chart giá coin realtime',
    color: '#84cc16', label: 'Biểu đồ',
    contractFields: [
      { key: 'poolAddress', label: 'Pool Address (GeckoTerminal)', placeholder: '0x... (địa chỉ pool trên DEX)' }
    ]
  },
  {
    id: 'gecko-txns', name: '📊 Lịch Sử Giao Dịch', desc: 'Bảng transactions gần nhất',
    color: '#a855f7', label: 'Giao dịch',
    contractFields: [
      { key: 'poolAddress', label: 'Pool Address (GeckoTerminal)', placeholder: '0x... (địa chỉ pool trên DEX)' }
    ]
  },
  {
    id: 'dao-token-voting', name: '🗳️ Bầu Cử Bằng Token', desc: 'Bỏ phiếu DAO (1 Token = 1 Điểm)',
    color: '#eab308', label: 'Bầu cử',
    contractFields: [
      { key: 'votingContract', label: 'Contract Voting', placeholder: '0x... (địa chỉ RealTokenVoting)' }
    ]
  },
]

export default BLOCKS_META
