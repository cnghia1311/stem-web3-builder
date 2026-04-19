import BLOCKS_META from '~/utils/blocksMeta'
import './BlockPlaceholder.css'

function BlockPlaceholder({ blockId, isOver, onRemove }) {
  const block = blockId ? BLOCKS_META.find(b => b.id === blockId) : null

  if (!block) {
    return (
      <div className={`block-placeholder ${isOver ? 'is-over' : ''}`}>
        <span className="block-empty-text">
          {isOver ? '📥 Thả vào đây' : '＋ Kéo khối vào'}
        </span>
      </div>
    )
  }

  return (
    <div
      className="block-placeholder has-block"
      style={{ borderColor: block.color + '60' }}
    >
      <button className="block-ph-remove" onClick={onRemove}>✕</button>
      <div className="block-ph-icon">{block.name.split(' ')[0]}</div>
      <div className="block-ph-info">
        <h5>{block.label}</h5>
        <p>{block.desc}</p>
      </div>
    </div>
  )
}

export default BlockPlaceholder
