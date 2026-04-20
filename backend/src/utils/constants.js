export const WHITELIST_DOMAINS = [
  'http://localhost:5173', // Vite dev
  'http://localhost:3000'  // Production
]

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher'
}

// Object chứa prefix cho mỗi block instance trong exported HTML
export const BLOCK_PREFIXES = {
  'wallet': '',
  'balance': 'bal-',
  'transfer': 'tf-',
  'gacha-drop': 'gacha-',
  'drop-gallery': 'gallery-',
  'drop-airdrop': 'airdrop-',
  'profile-gallery': 'profile-',
  'market-list': 'mklist-',
  'market-cancel': 'mkcancel-',
  'market-shop': 'mkshop-',
  'uniswap-v3-sell': 'swap-',
  'gecko-chart': 'chart-',
  'gecko-txns': 'txns-',
  'dao-token-voting': 'vote-',
  'uniswap-v3-lp': 'lp-',
  'erc20-factory': 'tf-'
}
