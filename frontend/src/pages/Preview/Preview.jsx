import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import BLOCKS_META from '~/utils/blocksMeta'
import { API_BASE_URL } from '~/utils/constants'
import axiosInstance from '~/apis'
import './Preview.css'

// Mock render block — chỉ hiển thị UI giả lập, không chạy Web3
function MockBlock({ blockId }) {
  const block = BLOCKS_META.find(b => b.id === blockId)
  if (!block) return <div className="preview-empty-cell">Trống</div>

  const mockContent = {
    'wallet': { display: 'Địa chỉ: 0x1a2b...3c4d', btn: '🦊 Kết Nối MetaMask' },
    'balance': { display: '💰 1,250.00 TOKEN', btn: '🔄 Cập Nhật' },
    'transfer': { display: 'Nhập địa chỉ nhận...', btn: '🚀 Gửi Token' },
    'claim': { display: '🎁 Claim Token miễn phí', btn: '🎁 Nhận Ngay' },
    'gacha-drop': { display: '🎲 Tỉ lệ: Common 60% | Rare 30% | Epic 10%', btn: '🎰 Quay Gacha' },
    'drop-gallery': { display: '🖼️ 3 NFT đã sở hữu', btn: null },
    'drop-airdrop': { display: '🎁 Số lượng còn lại: 847', btn: '🎁 Nhận Airdrop' },
    'profile-gallery': { display: '🪪 SBT #0042', btn: null },
    'market-list': { display: '📋 Chọn NFT để bán', btn: '📝 Đăng Bán' },
    'market-cancel': { display: '🛑 2 lệnh đang bán', btn: '❌ Hủy Tất Cả' },
    'market-shop': { display: '🛒 12 vật phẩm đang bán', btn: '💳 Mua Ngay' },
    'uniswap-v3-sell': { display: '1 ETH ≈ 3,200.50 USDT', btn: '🦄 Swap Now' },
    'gecko-chart': { display: '📈 Chart 24h — +5.2%', btn: null },
    'gecko-txns': { display: '📊 15 giao dịch gần nhất', btn: null },
    'dao-token-voting': { display: '🗳️ Ứng viên A: 65% | Ứng viên B: 35%', btn: '🗳️ Bình Chọn' },
  }

  const mock = mockContent[blockId] || { display: block.desc, btn: null }

  return (
    <div className="preview-block" style={{ borderLeftColor: block.color }}>
      <div className="preview-block-label">{block.name}</div>
      <div className="preview-block-desc">{block.desc}</div>
      <div className="preview-block-mockup">{mock.display}</div>
      {mock.btn && (
        <button className="preview-block-btn" style={{ background: block.color }}>
          {mock.btn}
        </button>
      )}
    </div>
  )
}

function Preview({ projects }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [showExport, setShowExport] = useState(false)
  const [loading, setLoading] = useState(false)

  const project = projects.find(p => p._id === id)

  if (!project) {
    return (
      <div className="preview-page">
        <div className="preview-toolbar">
          <button className="btn-back" onClick={() => navigate('/')}>← Về Dashboard</button>
        </div>
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Không tìm thấy dự án
        </div>
      </div>
    )
  }

  const currentTab = project.tabs[activeTab] || project.tabs[0]

  /**
   * 🚀 Mở Tab Test — Gọi Backend Assembler để tạo HTML thật + mở tab mới
   */
  const handleOpenTestTab = async () => {
    setLoading(true)
    try {
      const data = await axiosInstance.post('/export/save', {
        tabs: project.tabs,
        config: project.config || {},
        contracts: project.contracts || {},
        appTitle: project.config?.tokenName || 'My Web3 App'
      })

      // Mở tab mới với URL backend trả về
      const backendUrl = API_BASE_URL.replace('/api/v1', '')
      const fullUrl = backendUrl + data.url
      window.open(fullUrl, '_blank')

      toast.success('🚀 Đã mở Tab Test!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('❌ Không thể xuất HTML. Hãy bật Backend!')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Xuất HTML giả lập (copy) — giữ nguyên tính năng cũ
   */
  const generateMockHtml = () => {
    const title = project.config?.title || 'My Web3 App'
    const blocks = currentTab.rows
      .map(row => row.blocks.filter(Boolean).map(bid => {
        const b = BLOCKS_META.find(x => x.id === bid)
        return b ? `    <div class="block" style="border-left:3px solid ${b.color};padding:16px;margin:8px 0;background:#1e293b;border-radius:8px;">
      <h3>${b.name}</h3>
      <p>${b.desc}</p>
    </div>` : ''
      }).join('\n')).join('\n')

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }
    h1 { text-align: center; margin-bottom: 20px; }
    .block h3 { margin-bottom: 6px; }
    .block p { font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${title}</h1>
${blocks}
</body>
</html>`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMockHtml())
    toast.success('Đã copy HTML! 📋')
    setShowExport(false)
  }

  return (
    <div className="preview-page">
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <button className="btn-back" onClick={() => navigate(`/builder/${id}`)}>
            ← Quay lại Builder
          </button>
          <span className="preview-title">{project.config?.title || 'Preview'}</span>
        </div>
        <div className="preview-toolbar-right">
          <button
            className="btn-test-tab"
            onClick={handleOpenTestTab}
            disabled={loading}
          >
            {loading ? '⏳ Đang xuất...' : '🚀 Mở Tab Test'}
          </button>
          <button className="btn-export" onClick={() => setShowExport(true)}>
            📄 Xuất HTML
          </button>
        </div>
      </div>

      <div className="preview-device-wrap">
        <div className="preview-device">
          <div className="preview-device-notch"></div>
          <div className="preview-device-content">
            <div className="preview-app-header">
              <h2>{project.config?.title || 'My Web3 App'}</h2>
            </div>

            {project.tabs.length > 1 && (
              <div className="preview-tabs">
                {project.tabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    className={`preview-tab ${i === activeTab ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            )}

            {currentTab.rows.map(row => (
              <div key={row.id} className={`preview-row cols-${row.columns}`}>
                {row.blocks.map((blockId, ci) => (
                  <div key={ci}>
                    {blockId ? <MockBlock blockId={blockId} /> : <div className="preview-empty-cell">—</div>}
                  </div>
                ))}
              </div>
            ))}

            {currentTab.rows.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Chưa có khối nào. Quay lại Builder để thêm.
              </div>
            )}
          </div>
        </div>
      </div>

      {showExport && (
        <div className="export-modal-overlay" onClick={() => setShowExport(false)}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>📄 Xuất HTML</h3>
              <button className="export-modal-close" onClick={() => setShowExport(false)}>✕</button>
            </div>
            <div className="export-modal-body">
              <pre>{generateMockHtml()}</pre>
            </div>
            <div className="export-modal-footer">
              <button className="btn-copy" onClick={handleCopy}>📋 Copy HTML</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Preview
