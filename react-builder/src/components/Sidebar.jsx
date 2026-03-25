import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { BLOCKS } from '../data/blocks';
import { LESSONS, CATEGORIES } from '../data/subjects';

export default function Sidebar() {
    const [mode, setMode] = useState('guided'); // 'guided' | 'sandbox'
    const [lessonId, setLessonId] = useState('web3-bank');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({ 'all': true }); 

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const lowerQuery = searchQuery.toLowerCase();
    const isSearching = lowerQuery.length > 0;

    let draggablesRendered = 0;

    // Hàm phụ trợ để render từng Draggable Block
    const renderDraggableBlock = (b) => {
        const idx = draggablesRendered++;
        return (
            <Draggable key={b.id + '-' + idx} draggableId={`sidebar-${b.id}`} index={idx}>
                {(provided, snapshot) => (
                    <>
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`block-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                            <span className={`tag ${b.required ? 'tag-required' : 'tag-optional'}`}>
                                {b.required ? 'Bắt buộc' : 'Tùy chọn'}
                            </span>
                            <strong>{b.name}</strong>
                            <span>{b.desc}</span>
                        </div>
                        {snapshot.isDragging && (
                            <div className="block-item added" style={{ transform: 'none !important' }}>
                                <span className={`tag ${b.required ? 'tag-required' : 'tag-optional'}`}>
                                    {b.required ? 'Bắt buộc' : 'Tùy chọn'}
                                </span>
                                <strong>{b.name}</strong>
                                <span>{b.desc}</span>
                            </div>
                        )}
                    </>
                )}
            </Draggable>
        );
    };

    let renderUI;

    if (isSearching) {
        // Nếu đang tìm kiếm: Xóa bỏ mọi tab/phân nhóm, trải phẳng danh sách
        const matched = BLOCKS.filter(b => b.name.toLowerCase().includes(lowerQuery) || b.desc.toLowerCase().includes(lowerQuery));
        renderUI = (
            <div style={{ marginTop: '10px' }}>
                {matched.length === 0 && <div style={{color: '#94a3b8', fontSize: '12px', textAlign: 'center'}}>Không tìm thấy khối nào...</div>}
                {matched.map(renderDraggableBlock)}
            </div>
        );
    } else if (mode === 'guided') {
        // Chế độ Bài học (Guided)
        const lesson = LESSONS.find(l => l.id === lessonId);
        const matched = BLOCKS.filter(b => lesson.blocks.includes(b.id));
        renderUI = (
            <>
                <div style={{ padding: '10px', background: '#f8fafc', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{fontSize: '10px', fontWeight: 600, color: '#64748b'}}>CHỌN BÀI THỰC HÀNH:</label>
                    <select 
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', marginTop: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }} 
                        value={lessonId} 
                        onChange={e => setLessonId(e.target.value)}
                    >
                        {LESSONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
                {matched.map(renderDraggableBlock)}
            </>
        );
    } else {
        // Chế độ Tự do (Sandbox Categories)
        renderUI = CATEGORIES.map(cat => {
            const hasBlocks = cat.blocks === 'all' ? BLOCKS : BLOCKS.filter(b => cat.blocks.includes(b.id));
            const isExpanded = expandedCategories[cat.id];
            
            return (
                <div key={cat.id} style={{ marginBottom: '8px' }}>
                    <div 
                        onClick={() => toggleCategory(cat.id)}
                        style={{ 
                            padding: '8px', background: '#f1f5f9', borderRadius: '6px', 
                            fontSize: '12px', fontWeight: 700, color: '#334155', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{isExpanded ? '▼' : '▶'}</span>
                        {cat.name}
                    </div>
                    {isExpanded && (
                        <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                            {hasBlocks.map(renderDraggableBlock)}
                        </div>
                    )}
                </div>
            );
        });
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header" style={{ marginBottom: '10px' }}>
                <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🧱</span> Kho Linh Kiện
                </h2>
                
                {/* 2 Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '10px', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                    <button 
                        onClick={() => setMode('guided')}
                        style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', background: mode === 'guided' ? 'white' : 'transparent', color: mode === 'guided' ? '#0f172a' : '#64748b', boxShadow: mode === 'guided' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                        📚 THEO BÀI HỌC
                    </button>
                    <button 
                        onClick={() => setMode('sandbox')}
                        style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', background: mode === 'sandbox' ? 'white' : 'transparent', color: mode === 'sandbox' ? '#0f172a' : '#64748b', boxShadow: mode === 'sandbox' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                        🛠️ TỰ DO KHÁM PHÁ
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ marginTop: '10px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '12px' }}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm linh kiện..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px 6px 26px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 15px 15px 15px' }}>
                <Droppable droppableId="sidebar" isDropDisabled={true}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '100px' }}>
                            {renderUI}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </div>
    );
}
