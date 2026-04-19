import { Droppable } from '@hello-pangea/dnd'
import BlockPlaceholder from '../BlockPlaceholder/BlockPlaceholder'
import { DRAG_TYPES } from '~/utils/constants'
import './RowContainer.css'

function RowContainer({ row, dragHandleProps, isDragging, onRemove, onChangeColumns, onRemoveBlock }) {
  return (
    <div className={`row-container ${isDragging ? 'dragging' : ''}`}>
      <div className="row-header">
        <span className="row-handle" {...dragHandleProps}>≡</span>
        <div className="row-header-actions">
          <select
            className="row-col-select"
            value={row.columns}
            onChange={e => onChangeColumns(Number(e.target.value))}
          >
            <option value={1}>1 cột</option>
            <option value={2}>2 cột</option>
            <option value={3}>3 cột</option>
          </select>
          <button className="row-btn-delete" onClick={onRemove} title="Xóa hàng">✕</button>
        </div>
      </div>

      <div className={`row-grid cols-${row.columns}`}>
        {row.blocks.map((blockId, cellIndex) => (
          <Droppable key={cellIndex} droppableId={`cell-${row.id}__${cellIndex}`} type={DRAG_TYPES.BLOCK}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <BlockPlaceholder
                  blockId={blockId}
                  isOver={snapshot.isDraggingOver}
                  onRemove={() => onRemoveBlock(cellIndex)}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  )
}

export default RowContainer
