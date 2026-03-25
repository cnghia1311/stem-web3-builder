import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import ConfigPanel from './components/ConfigPanel';
import { TEMPLATES } from './data/templates';
import { generateWeb3Code } from './utils/exportEngine';

function App() {
  const [tabs, setTabs] = useState([
    { id: 'tab-1', name: '🏠 Trang Chủ', templateId: 'dashboard', slots: {} }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  const [config, setConfig] = useState({
    title: 'Ngân Hàng Web3',
    sub: 'Tiện ích đa trang',
    tokenName: 'DOG',
    theme: 'dark',
    layout: 'desktop'
  });
  const [contracts, setContracts] = useState({});
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [exportModalCode, setExportModalCode] = useState(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const activeTemplate = TEMPLATES.find(tpl => tpl.id === activeTab.templateId) || TEMPLATES[0];

  // ====== KÉO THẢ VÀO Ô LƯỚI ======
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Kéo từ Sidebar vào 1 slot trống
    if (source.droppableId === 'sidebar' && destination.droppableId.startsWith('slot-')) {
      const blockId = result.draggableId.replace('sidebar-', '');
      const slotId = destination.droppableId.replace('slot-', '');

      // Kiểm tra slot đã có block chưa
      if (activeTab.slots[slotId]) return;

      setTabs(tabs.map(t => {
        if (t.id === activeTabId) {
          return { ...t, slots: { ...t.slots, [slotId]: blockId } };
        }
        return t;
      }));
    }
  };

  const handleContractChange = (slotKey, value) => {
    setContracts({ ...contracts, [slotKey]: value });
  };

  const handleRemoveFromSlot = (slotId) => {
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        const newSlots = { ...t.slots };
        delete newSlots[slotId];
        // Dọn dẹp luôn contract liên quan
        const slotKey = `${activeTabId}-${slotId}`;
        const newContracts = { ...contracts };
        delete newContracts[slotKey];
        setContracts(newContracts);
        return { ...t, slots: newSlots };
      }
      return t;
    }));
  };

  const handleAddTab = (templateId) => {
    const newId = 'tab-' + Date.now();
    const tpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
    setTabs([...tabs, { id: newId, name: `📄 Trang ${tabs.length + 1}`, templateId: tpl.id, slots: {} }]);
    setActiveTabId(newId);
  };

  const handleChangeTemplate = (tabId, templateId) => {
    setTabs(tabs.map(t => t.id === tabId ? { ...t, templateId, slots: {} } : t));
  };

  const handleRenameTab = (id, newName) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const handleDeleteTab = (id) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };

  const handleConfigChange = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  // Lấy danh sách block đã dùng trong tab hiện tại
  const usedBlockIds = Object.values(activeTab.slots);

  const handleExportApp = () => {
    const code = generateWeb3Code(tabs, config, contracts);
    setExportModalCode(code);
  };

  const handleRunApp = async () => {
    const code = generateWeb3Code(tabs, config, contracts);
    const filename = (config.title || 'app').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.html';
    try {
      const resp = await fetch('http://localhost:3000/save-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, code })
      });
      const data = await resp.json();
      if (data.ok) window.open('http://localhost:3000' + data.url, '_blank');
      else alert('Lỗi: ' + data.error);
    } catch (e) {
      alert('Không thể kết nối server!');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportModalCode);
    alert('✅ Đã copy!');
  };

  const handleDownloadCode = () => {
    const blob = new Blob([exportModalCode], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (config.title || 'app').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.html';
    a.click();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Sidebar />
      <PreviewArea
        tabs={tabs}
        activeTabId={activeTabId}
        activeTemplate={activeTemplate}
        onSelectTab={setActiveTabId}
        config={config}
        contracts={contracts}
        onContractChange={handleContractChange}
        selectedSlotId={selectedSlotId}
        onSelectSlot={setSelectedSlotId}
        onRemoveFromSlot={handleRemoveFromSlot}
        onRunApp={handleRunApp}
        onExportApp={handleExportApp}
      />
      <ConfigPanel
        config={config}
        onChange={handleConfigChange}
        tabs={tabs}
        onAddTab={handleAddTab}
        onRenameTab={handleRenameTab}
        onDeleteTab={handleDeleteTab}
        onChangeTemplate={handleChangeTemplate}
        activeTab={activeTab}
        selectedSlotId={selectedSlotId}
        onSelectSlot={setSelectedSlotId}
        contracts={contracts}
        onContractChange={handleContractChange}
      />

      {exportModalCode !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🎉 App Web3 đã sẵn sàng!</h2>
            <p>Copy hoặc tải file <code>.html</code>, mở trên trình duyệt có MetaMask.</p>
            <textarea readOnly value={exportModalCode} />
            <div className="modal-btns">
              <button style={{ background: '#3b82f6', color: 'white' }} onClick={handleCopyCode}>📋 Copy Mã</button>
              <button style={{ background: '#8b5cf6', color: 'white' }} onClick={handleDownloadCode}>💾 Tải File</button>
              <button style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setExportModalCode(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </DragDropContext>
  );
}

export default App;
