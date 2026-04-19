import BLOCKS_META from '~/utils/blocksMeta'
import { THEME_OPTIONS, LAYOUT_OPTIONS } from '~/utils/constants'
import './ConfigPanel.css'

function ConfigPanel({ config, updateConfig, tabs, activeTabIndex, setActiveTabIndex, addTab, removeTab, renameTab, project }) {

  // Lấy danh sách block đang được sử dụng (unique)
  const usedBlockIds = [...new Set(
    tabs.flatMap(tab => tab.rows?.flatMap(row => row.blocks?.filter(Boolean)) || [])
  )]

  // Lọc ra blocks có contractFields
  const blocksNeedingConfig = usedBlockIds
    .map(id => BLOCKS_META.find(b => b.id === id))
    .filter(b => b && b.contractFields && b.contractFields.length > 0)

  const contracts = project?.contracts || {}

  const updateContract = (blockId, fieldKey, value) => {
    const updated = {
      ...contracts,
      [blockId]: {
        ...(contracts[blockId] || {}),
        [fieldKey]: value
      }
    }
    updateConfig('__contracts', updated)
  }

  return (
    <aside className="config-panel">
      {/* App Config */}
      <div className="config-section">
        <div className="config-section-title">⚙️ Cấu Hình App</div>

        <div className="config-field">
          <label>Tên ứng dụng</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={e => updateConfig('title', e.target.value)}
            placeholder="Ngân Hàng Web3"
          />
        </div>

        <div className="config-field">
          <label>Giao diện</label>
          <select value={config.theme || 'dark'} onChange={e => updateConfig('theme', e.target.value)}>
            {THEME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="config-field">
          <label>Bố cục</label>
          <select value={config.layout || 'mobile'} onChange={e => updateConfig('layout', e.target.value)}>
            {LAYOUT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Contract Config — tự động hiện khi có block cần contract */}
      {blocksNeedingConfig.length > 0 && (
        <div className="config-section">
          <div className="config-section-title">🔗 Cài Đặt Contract</div>
          <div className="contract-hint">
            Điền địa chỉ contract cho các khối đang sử dụng
          </div>

          {blocksNeedingConfig.map(block => (
            <div key={block.id} className="contract-block-group">
              <div className="contract-block-name">
                <span className="contract-block-dot" style={{ background: block.color }}></span>
                {block.name}
              </div>
              {block.contractFields.map(field => (
                <div className="config-field" key={`${block.id}-${field.key}`}>
                  <label>{field.label}</label>
                  <input
                    type="text"
                    value={contracts[block.id]?.[field.key] || ''}
                    onChange={e => updateContract(block.id, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tab Manager */}
      <div className="config-section">
        <div className="config-section-title">🗂️ Quản Lý Trang</div>

        <div className="tab-list">
          {tabs.map((tab, i) => (
            <div
              key={tab.id}
              className={`tab-item ${i === activeTabIndex ? 'active' : ''}`}
              onClick={() => setActiveTabIndex(i)}
            >
              <input
                className="tab-item-name"
                value={tab.name}
                onChange={e => renameTab(i, e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              {tabs.length > 1 && (
                <button
                  className="tab-btn-delete"
                  onClick={(e) => { e.stopPropagation(); removeTab(i) }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="btn-add-tab" onClick={addTab}>
          ＋ Thêm trang mới
        </button>
      </div>

      {/* Summary */}
      <div className="config-section">
        <div className="config-section-title">📊 Tóm Tắt</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>📄 Số trang: <strong style={{ color: 'var(--text-primary)' }}>{tabs.length}</strong></div>
          <div>📐 Số hàng: <strong style={{ color: 'var(--text-primary)' }}>
            {tabs.reduce((acc, t) => acc + (t.rows?.length || 0), 0)}
          </strong></div>
          <div>🧱 Số khối: <strong style={{ color: 'var(--text-primary)' }}>
            {tabs.reduce((acc, t) => acc + (t.rows?.reduce((a, r) => a + r.blocks.filter(Boolean).length, 0) || 0), 0)}
          </strong></div>
        </div>
      </div>
    </aside>
  )
}

export default ConfigPanel
