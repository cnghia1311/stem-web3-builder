import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import AppBar from '~/components/AppBar/AppBar'
import Sidebar from './Sidebar/Sidebar'
import Canvas from './Canvas/Canvas'
import ConfigPanel from './ConfigPanel/ConfigPanel'
import { generateId } from '~/utils/formatters'
import { DRAG_TYPES } from '~/utils/constants'
import './Builder.css'

function Builder({ user, onLogout, projects, setProjects }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const project = projects.find(p => p._id === id)
  if (!project) {
    return (
      <div className="builder">
        <AppBar user={user} onLogout={onLogout} />
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h2>Không tìm thấy dự án</h2>
          <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '8px 20px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer' }}>
            Về Dashboard
          </button>
        </div>
      </div>
    )
  }

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const activeTab = project.tabs[activeTabIndex] || project.tabs[0]

  const updateProject = (updater) => {
    setProjects(prev => prev.map(p =>
      p._id === id ? { ...updater(p), updatedAt: new Date().toISOString() } : p
    ))
  }

  // ===== ROW ACTIONS =====
  const addRow = (columns) => {
    updateProject(p => ({
      ...p,
      tabs: p.tabs.map((tab, i) =>
        i === activeTabIndex
          ? { ...tab, rows: [...tab.rows, { id: 'row-' + generateId(), columns, blocks: Array(columns).fill(null) }] }
          : tab
      )
    }))
  }

  const removeRow = (rowId) => {
    updateProject(p => ({
      ...p,
      tabs: p.tabs.map((tab, i) =>
        i === activeTabIndex
          ? { ...tab, rows: tab.rows.filter(r => r.id !== rowId) }
          : tab
      )
    }))
  }

  const updateRowColumns = (rowId, newColumns) => {
    updateProject(p => ({
      ...p,
      tabs: p.tabs.map((tab, i) =>
        i === activeTabIndex
          ? {
            ...tab,
            rows: tab.rows.map(r => {
              if (r.id !== rowId) return r
              const blocks = Array(newColumns).fill(null)
              r.blocks.forEach((b, idx) => { if (idx < newColumns) blocks[idx] = b })
              return { ...r, columns: newColumns, blocks }
            })
          }
          : tab
      )
    }))
  }

  // ===== BLOCK ACTIONS =====
  const setBlockInCell = (rowId, cellIndex, blockId) => {
    updateProject(p => ({
      ...p,
      tabs: p.tabs.map((tab, i) =>
        i === activeTabIndex
          ? {
            ...tab,
            rows: tab.rows.map(r =>
              r.id === rowId
                ? { ...r, blocks: r.blocks.map((b, ci) => ci === cellIndex ? blockId : b) }
                : r
            )
          }
          : tab
      )
    }))
  }

  const removeBlockFromCell = (rowId, cellIndex) => {
    setBlockInCell(rowId, cellIndex, null)
  }

  // ===== DRAG & DROP =====
  const handleDragEnd = (result) => {
    const { source, destination, type } = result
    if (!destination) return

    if (type === DRAG_TYPES.ROW) {
      updateProject(p => ({
        ...p,
        tabs: p.tabs.map((tab, i) => {
          if (i !== activeTabIndex) return tab
          const rows = [...tab.rows]
          const [moved] = rows.splice(source.index, 1)
          rows.splice(destination.index, 0, moved)
          return { ...tab, rows }
        })
      }))
      return
    }

    if (type === DRAG_TYPES.BLOCK && source.droppableId === 'sidebar-blocks') {
      const blockId = result.draggableId.replace('sidebar-', '')
      const parts = destination.droppableId.replace('cell-', '').split('__')
      const rowId = parts[0]
      const cellIndex = parseInt(parts[1])
      setBlockInCell(rowId, cellIndex, blockId)
    }
  }

  // ===== TAB ACTIONS =====
  const addTab = () => {
    updateProject(p => ({
      ...p,
      tabs: [...p.tabs, { id: 'tab-' + generateId(), name: '📄 Trang ' + (p.tabs.length + 1), rows: [] }]
    }))
  }

  const removeTab = (tabIndex) => {
    if (project.tabs.length <= 1) return
    updateProject(p => ({ ...p, tabs: p.tabs.filter((_, i) => i !== tabIndex) }))
    if (activeTabIndex >= project.tabs.length - 1) setActiveTabIndex(Math.max(0, activeTabIndex - 1))
  }

  const renameTab = (tabIndex, newName) => {
    updateProject(p => ({
      ...p,
      tabs: p.tabs.map((tab, i) => i === tabIndex ? { ...tab, name: newName } : tab)
    }))
  }

  const updateConfig = (key, value) => {
    if (key === '__contracts') {
      updateProject(p => ({ ...p, contracts: value }))
    } else {
      updateProject(p => ({ ...p, config: { ...p.config, [key]: value } }))
    }
  }

  return (
    <div className="builder">
      <AppBar user={user} onLogout={onLogout} projectId={id} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="builder-body">
          <Sidebar />

          <Canvas
            activeTab={activeTab}
            activeTabIndex={activeTabIndex}
            tabs={project.tabs}
            setActiveTabIndex={setActiveTabIndex}
            addRow={addRow}
            removeRow={removeRow}
            updateRowColumns={updateRowColumns}
            removeBlockFromCell={removeBlockFromCell}
            config={project.config}
          />

          <ConfigPanel
            config={project.config}
            updateConfig={updateConfig}
            tabs={project.tabs}
            activeTabIndex={activeTabIndex}
            setActiveTabIndex={setActiveTabIndex}
            addTab={addTab}
            removeTab={removeTab}
            renameTab={renameTab}
            project={project}
          />
        </div>
      </DragDropContext>
    </div>
  )
}

export default Builder
