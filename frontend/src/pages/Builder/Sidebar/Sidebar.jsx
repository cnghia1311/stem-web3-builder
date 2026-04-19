import { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import BLOCKS_META from '~/utils/blocksMeta'
import { LESSONS, CATEGORIES } from '~/utils/subjects'
import { DRAG_TYPES } from '~/utils/constants'
import './Sidebar.css'

function Sidebar() {
  const [mode, setMode] = useState('lesson') // 'lesson' | 'free'
  const [search, setSearch] = useState('')
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0]?.id)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getFilteredBlocks = () => {
    let blocks = BLOCKS_META

    if (mode === 'lesson') {
      const lesson = LESSONS.find(l => l.id === selectedLesson)
      if (lesson) blocks = blocks.filter(b => lesson.blocks.includes(b.id))
    } else {
      const cat = CATEGORIES.find(c => c.id === selectedCategory)
      if (cat && cat.blocks !== 'all') blocks = blocks.filter(b => cat.blocks.includes(b.id))
    }

    if (search) {
      const q = search.toLowerCase()
      blocks = blocks.filter(b => b.name.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))
    }

    return blocks
  }

  const filteredBlocks = getFilteredBlocks()

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button className={`sidebar-tab ${mode === 'lesson' ? 'active' : ''}`} onClick={() => setMode('lesson')}>
          📚 Theo Bài Học
        </button>
        <button className={`sidebar-tab ${mode === 'free' ? 'active' : ''}`} onClick={() => setMode('free')}>
          🛠️ Tự Do
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="🔍 Tìm khối..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {mode === 'lesson' && (
        <div style={{ padding: '4px 8px' }}>
          <select
            value={selectedLesson}
            onChange={e => setSelectedLesson(e.target.value)}
            style={{
              width: '100%', padding: '8px', background: 'var(--bg-input)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
            }}
          >
            {LESSONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      )}

      {mode === 'free' && (
        <div style={{ padding: '4px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '4px 10px', fontSize: '11px', borderRadius: '12px', cursor: 'pointer',
                border: selectedCategory === c.id ? '1px solid var(--color-primary)' : '1px solid var(--border)',
                background: selectedCategory === c.id ? 'var(--bg-hover)' : 'transparent',
                color: selectedCategory === c.id ? 'var(--color-primary-light)' : 'var(--text-secondary)'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <Droppable droppableId="sidebar-blocks" type={DRAG_TYPES.BLOCK} isDropDisabled={true}>
          {(provided) => (
            <div className="sidebar-list" ref={provided.innerRef} {...provided.droppableProps}>
              {filteredBlocks.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Không tìm thấy khối nào
                </div>
              )}
              {filteredBlocks.map((block, index) => (
                <Draggable key={block.id} draggableId={`sidebar-${block.id}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="block-card"
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1
                      }}
                    >
                      <div className="block-card-icon" style={{ background: block.color + '20', color: block.color }}>
                        {block.name.split(' ')[0]}
                      </div>
                      <div className="block-card-info">
                        <h4>{block.name}</h4>
                        <p>{block.desc}</p>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
    </aside>
  )
}

export default Sidebar
