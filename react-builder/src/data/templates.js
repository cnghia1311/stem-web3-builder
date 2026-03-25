export const TEMPLATES = [
    {
        id: 'list',
        name: '📋 Danh sách',
        desc: '1 cột xếp dọc — đơn giản nhất',
        gridColumns: '1fr',
        slots: [
            { id: 's1', span: 1, label: 'Ô 1' },
            { id: 's2', span: 1, label: 'Ô 2' },
            { id: 's3', span: 1, label: 'Ô 3' },
            { id: 's4', span: 1, label: 'Ô 4' },
            { id: 's5', span: 1, label: 'Ô 5' },
            { id: 's6', span: 1, label: 'Ô 6' },
        ]
    },
    {
        id: 'dashboard',
        name: '📊 Dashboard',
        desc: '2 cột đều — bảng điều khiển',
        gridColumns: '1fr 1fr',
        slots: [
            { id: 's1', span: 1, label: 'Trái 1' },
            { id: 's2', span: 1, label: 'Phải 1' },
            { id: 's3', span: 1, label: 'Trái 2' },
            { id: 's4', span: 1, label: 'Phải 2' },
            { id: 's5', span: 2, label: 'Full chiều ngang' },
            { id: 's6', span: 1, label: 'Trái 3' },
            { id: 's7', span: 1, label: 'Phải 3' },
        ]
    },
    {
        id: 'showcase',
        name: '🛒 Showcase',
        desc: 'Hero trên + 3 cột dưới',
        gridColumns: '1fr 1fr 1fr',
        slots: [
            { id: 'hero', span: 3, label: '🌟 Hero (nổi bật)' },
            { id: 's1', span: 1, label: 'Cột 1' },
            { id: 's2', span: 1, label: 'Cột 2' },
            { id: 's3', span: 1, label: 'Cột 3' },
            { id: 's4', span: 3, label: 'Full dưới cùng' },
        ]
    },
    {
        id: 'sidebar-layout',
        name: '📰 Sidebar',
        desc: 'Menu bên + Nội dung chính',
        gridColumns: '1fr 2fr',
        slots: [
            { id: 'side1', span: 1, label: '📌 Menu 1' },
            { id: 'main1', span: 1, label: '📄 Nội dung 1' },
            { id: 'side2', span: 1, label: '📌 Menu 2' },
            { id: 'main2', span: 1, label: '📄 Nội dung 2' },
            { id: 'bottom', span: 2, label: 'Full dưới cùng' },
        ]
    },
];
