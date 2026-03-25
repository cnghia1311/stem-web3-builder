import React from 'react';
import { TEMPLATES } from '../data/templates';
import { BLOCKS } from '../data/blocks';

export default function ConfigPanel({ config, onChange, tabs, onAddTab, onRenameTab, onDeleteTab, onChangeTemplate, activeTab, selectedSlotId, onSelectSlot, contracts, onContractChange }) {
    // Lấy tất cả block instance đang nằm trong tab hiện tại
    const placedInstances = activeTab
        ? Object.entries(activeTab.slots)
            .map(([slotId, blockId]) => ({
                slotId,
                block: BLOCKS.find(b => b.id === blockId)
            }))
            .filter(item => item.block && (item.block.contractKey || item.block.multiToken))
        : [];

    // === Handlers cho Multi-Token ===
    const handleAddToken = (slotKey) => {
        const current = contracts[slotKey] || [];
        onContractChange(slotKey, [...current, '']);
    };

    const handleRemoveToken = (slotKey, index) => {
        const current = contracts[slotKey] || [];
        onContractChange(slotKey, current.filter((_, i) => i !== index));
    };

    const handleTokenFieldChange = (slotKey, index, value) => {
        const current = contracts[slotKey] || [];
        const updated = current.map((t, i) => i === index ? value : t);
        onContractChange(slotKey, updated);
    };

    return (
        <div className="config-panel">
            <h3>⚙️ Cấu Hình App</h3>
            <div className="config-group">
                <label>Tên App</label>
                <input type="text" value={config.title} onChange={e => onChange('title', e.target.value)} />
            </div>
            <div className="config-group">
                <label>Mô tả</label>
                <input type="text" value={config.sub} onChange={e => onChange('sub', e.target.value)} />
            </div>

            <div className="config-group">
                <label>Giao diện</label>
                <select value={config.theme} onChange={e => onChange('theme', e.target.value)}>
                    <option value="dark">🌙 Dark Mode</option>
                    <option value="light">☀️ Light Mode</option>
                    <option value="neon">💜 Neon Cyber</option>
                </select>
            </div>
            <div className="config-group" style={{ marginBottom: '20px' }}>
                <label>Kích thước Web</label>
                <select value={config.layout || 'desktop'} onChange={e => onChange('layout', e.target.value)}>
                    <option value="desktop">💻 Responsive (Máy tính)</option>
                    <option value="mobile">📱 Giới hạn 440px</option>
                </select>
            </div>

            {/* ===== DANH SÁCH CONTRACT ===== */}
            {placedInstances.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>🔗 Cài đặt Contract</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {placedInstances.map(({ slotId, block }) => {
                            const slotKey = `${activeTab.id}-${slotId}`;
                            const isSelected = selectedSlotId === slotId;

                            // ===== MULTI-TOKEN (Balance block) =====
                            if (block.multiToken) {
                                const tokens = Array.isArray(contracts[slotKey]) ? contracts[slotKey] : [];
                                const allValid = tokens.length > 0 && tokens.every(t => t && t.length === 42);
                                return (
                                    <div
                                        key={slotKey}
                                        onClick={() => onSelectSlot(slotId)}
                                        style={{
                                            background: isSelected ? '#f0fdf4' : '#f8fafc',
                                            border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                                            borderRadius: '10px',
                                            padding: '10px',
                                            cursor: 'pointer',
                                            transition: '0.15s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: block.color }}>{block.name}</span>
                                                <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '6px' }}>Vị trí: {slotId}</span>
                                            </div>
                                            <span style={{ fontSize: '11px' }}>{allValid ? '✅' : '⚠️'}</span>
                                        </div>

                                        {/* Danh sách coin */}
                                        {tokens.map((token, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={token}
                                                    onChange={e => { e.stopPropagation(); handleTokenFieldChange(slotKey, i, e.target.value); }}
                                                    onClick={e => e.stopPropagation()}
                                                    placeholder="Địa chỉ Contract (0x...)"
                                                    style={{
                                                        flex: 1, padding: '6px',
                                                        border: `1px solid ${token?.length === 42 ? '#10b981' : '#fbbf24'}`,
                                                        borderRadius: '5px', fontSize: '10px', fontFamily: 'monospace',
                                                        background: token?.length === 42 ? '#f0fdf4' : '#fffbeb'
                                                    }}
                                                />
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleRemoveToken(slotKey, i); }}
                                                    style={{ padding: '2px 6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}
                                                >✕</button>
                                            </div>
                                        ))}

                                        <button
                                            onClick={e => { e.stopPropagation(); handleAddToken(slotKey); }}
                                            style={{
                                                width: '100%', padding: '6px', marginTop: '4px',
                                                background: '#ecfdf5', border: '1px dashed #10b981',
                                                borderRadius: '6px', cursor: 'pointer', fontSize: '11px', color: '#10b981', fontWeight: 600
                                            }}
                                        >+ Thêm Coin Mới</button>
                                    </div>
                                );
                            }

                            // ===== SINGLE CONTRACT (các block khác) =====
                            const hasValue = contracts[slotKey] && contracts[slotKey].length === 42;
                            return (
                                <div
                                    key={slotKey}
                                    onClick={() => onSelectSlot(slotId)}
                                    style={{
                                        background: isSelected ? '#f0fdf4' : '#f8fafc',
                                        border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                                        borderRadius: '10px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        transition: '0.15s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: block.color }}>{block.name}</span>
                                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>Vị trí: {slotId}</span>
                                        </div>
                                        <span style={{ fontSize: '11px' }}>{hasValue ? '✅' : '⚠️'}</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={contracts[slotKey] || ''}
                                        onChange={e => onContractChange(slotKey, e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        placeholder={block.contractPlaceholder || '0x...'}
                                        style={{
                                            width: '100%', padding: '8px',
                                            border: `1px solid ${hasValue ? '#10b981' : '#fbbf24'}`,
                                            borderRadius: '6px', fontSize: '11px',
                                            fontFamily: 'monospace',
                                            background: hasValue ? '#f0fdf4' : '#fffbeb'
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <h3>🗂️ Quản Lý Trang</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                {tabs.map(tab => (
                    <div key={tab.id} style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '6px' }}>
                            <input type="text" style={{ margin: 0, flex: 1 }} value={tab.name} onChange={e => onRenameTab(tab.id, e.target.value)} />
                            <button onClick={() => onDeleteTab(tab.id)} disabled={tabs.length === 1}
                                style={{ padding: '0 10px', background: tabs.length === 1 ? '#e2e8f0' : '#ef4444', border: 'none', borderRadius: '6px', color: 'white', cursor: tabs.length === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>✕</button>
                        </div>
                        <select value={tab.templateId} onChange={e => onChangeTemplate(tab.id, e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                            {TEMPLATES.map(tpl => (
                                <option key={tpl.id} value={tpl.id}>{tpl.name} — {tpl.desc}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>THÊM TRANG MỚI VỚI MẪU:</label>
                {TEMPLATES.map(tpl => (
                    <button key={tpl.id} onClick={() => onAddTab(tpl.id)}
                        style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}>
                        {tpl.name} <span style={{ color: '#94a3b8' }}>— {tpl.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
