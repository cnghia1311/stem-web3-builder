import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { BLOCKS } from '../data/blocks';

export default function PreviewArea({ tabs, activeTabId, activeTemplate, onSelectTab, config, contracts, onContractChange, selectedSlotId, onSelectSlot, onRemoveFromSlot, onRunApp, onExportApp }) {
    const hasAnyBlock = tabs.some(t => Object.keys(t.slots).length > 0);
    const activeTabObj = tabs.find(t => t.id === activeTabId) || tabs[0];

    return (
        <div className="preview-area">
            <div className="preview-toolbar">
                <h3>📱 Xem Trước App</h3>
                <div className="toolbar-btns">
                    <button className="btn-action" disabled={!hasAnyBlock} style={{ background: '#3b82f6' }} onClick={onRunApp}>🚀 Chạy App</button>
                    <button className="btn-action" disabled={!hasAnyBlock} style={{ background: '#10b981' }} onClick={onExportApp}>📥 Xuất HTML</button>
                </div>
            </div>
            <div className="phone" style={{ maxWidth: config.layout === 'mobile' ? '440px' : '700px' }}>
                <div className="phone-title">{config.title || 'Tên App Của Em'}</div>
                <div className="phone-sub">{config.sub || 'Mô tả ngắn'}</div>

                {/* Tab navigation */}
                {tabs.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => onSelectTab(t.id)} style={{
                                flex: '1 0 auto', padding: '8px 12px', borderRadius: '8px', border: 'none',
                                background: t.id === activeTabId ? '#3b82f6' : '#334155',
                                color: t.id === activeTabId ? 'white' : '#94a3b8',
                                fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                            }}>{t.name}</button>
                        ))}
                    </div>
                )}

                {/* Grid Layout */}
                <div className="grid-layout" style={{
                    display: 'grid',
                    gridTemplateColumns: activeTemplate.gridColumns,
                    gap: '12px',
                    minHeight: '200px'
                }}>
                    {activeTemplate.slots.map(slot => {
                        const blockId = activeTabObj.slots[slot.id];
                        const block = blockId ? BLOCKS.find(b => b.id === blockId) : null;

                        return (
                            <Droppable key={slot.id} droppableId={`slot-${slot.id}`}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`grid-slot ${snapshot.isDraggingOver ? 'slot-hover' : ''} ${block ? 'slot-filled' : ''}`}
                                        style={{ gridColumn: `span ${slot.span}` }}
                                    >
                                        {block ? (
                                            <div 
                                                className={`slot-block ${selectedSlotId === slot.id ? 'slot-selected' : ''}`}
                                                style={{ borderLeftColor: block.color, cursor: 'pointer' }}
                                                onClick={() => onSelectSlot(slot.id)}
                                            >
                                                <button className="pv-remove" onClick={(e) => { e.stopPropagation(); onRemoveFromSlot(slot.id); }}>✕</button>
                                                <div className="pv-label">{block.label}</div>
                                                <div dangerouslySetInnerHTML={{ __html: block.preview(config.tokenName || 'TOKEN') }} />
                                            </div>
                                        ) : (
                                            <div className="slot-empty">
                                                <span>{slot.label}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'none' }}>{provided.placeholder}</div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
