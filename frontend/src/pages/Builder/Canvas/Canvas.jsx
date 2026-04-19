import { Droppable, Draggable } from '@hello-pangea/dnd'
import RowContainer from './RowContainer/RowContainer'
import AddRowBar from './AddRowBar/AddRowBar'
import { DRAG_TYPES } from '~/utils/constants'
import './Canvas.css'

function Canvas({ activeTab, tabs, activeTabIndex, setActiveTabIndex, addRow, removeRow, updateRowColumns, removeBlockFromCell, config }) {
  return (
    <div className="canvas">
      {tabs.length > 1 && (
        <div className="canvas-toolbar">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              className={`canvas-tab ${i === activeTabIndex ? 'active' : ''}`}
              onClick={() => setActiveTabIndex(i)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      <div className="canvas-phone-wrapper">
        <div className="canvas-phone">
          <div className="canvas-phone-header">
            {config?.title || activeTab?.name || 'App Preview'}
          </div>

          <Droppable droppableId="rows-list" type={DRAG_TYPES.ROW}>
            {(provided) => (
              <div className="rows-container" ref={provided.innerRef} {...provided.droppableProps}>
                {activeTab?.rows?.map((row, index) => (
                  <Draggable key={row.id} draggableId={row.id} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <RowContainer
                          row={row}
                          dragHandleProps={provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                          onRemove={() => removeRow(row.id)}
                          onChangeColumns={(cols) => updateRowColumns(row.id, cols)}
                          onRemoveBlock={(cellIndex) => removeBlockFromCell(row.id, cellIndex)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <AddRowBar onAddRow={addRow} />
        </div>
      </div>
    </div>
  )
}

export default Canvas
