# 🎨 FRONTEND DESIGN — STEM Web3 Builder

> **Chuẩn cấu trúc**: TrungQuanDev (Vite-Trello-Web)  
> **Liên quan**: [BACKEND_DESIGN.md](./BACKEND_DESIGN.md)

---

## 🚀 Todo / Lộ trình sắp tới

**Tích hợp xem trước và test Web3:**
- ✅ Chốt nguyên lý: Trang `Preview` (`/preview/:id`) **chỉ hiển thị giả lập UI/UX** trên khung điện thoại (tránh chạy web3 trong iframe sinh rủi ro).
- ✅ Xây dựng nút **"🚀 Mở Tab Test (Full Màn Hình)"** tại phần Preview.
- ✅ Sự kiện click: Frontend lấy format cấu hình (`tabs`, `config`, `contracts`) gửi gọi API `POST /api/v1/export/save` cho Backend. 
- ✅ Backend trả URL file -> Frontend tạo tab mới mở địa chỉ này ra dApp thực tế, tại đây người dùng có thể test kết nối ví, ký MetaMask không dính lỗi iframe.

---

## 1. Các Trang

| # | Trang | URL | Mô tả |
|---|---|---|---|
| 1 | 🔐 Đăng nhập | `/login` | Email + mật khẩu |
| 2 | 📝 Đăng ký | `/register` | Tạo tài khoản |
| 3 | 🏠 Dashboard | `/` | Danh sách dự án + nút tạo mới |
| 4 | 🧱 Builder | `/builder/:id` | Kéo thả khối xây app |
| 5 | 👁️ Preview | `/preview/:id` | Xem trước app full màn hình |

---

## 2. Cấu Trúc Thư Mục

```
web/src/
│
├── 📂 apis/                         Tập trung gọi API (axios)
│   ├── index.js                     Axios instance + interceptors
│   ├── authApi.js                   Login, register, refresh token
│   ├── blocksApi.js                 GET metadata, POST batch-code
│   └── exportApi.js                 POST export/html, POST export/save
│
├── 📂 assets/                       Hình ảnh, icons, fonts
│
├── 📂 components/                   Components dùng chung (shared)
│   ├── 📂 AppBar/                   Thanh header (logo, user menu)
│   ├── 📂 ExportModal/              Modal xuất HTML
│   └── 📂 Loading/                  Spinner khi chờ API
│
├── 📂 pages/
│   │
│   ├── 📂 Auth/                     Đăng nhập + Đăng ký
│   │   ├── Login.jsx + Login.css
│   │   └── Register.jsx + Register.css
│   │
│   ├── 📂 Dashboard/               Trang chủ (danh sách dự án)
│   │   ├── Dashboard.jsx + Dashboard.css
│   │   └── 📂 ProjectCard/         Card 1 dự án
│   │
│   ├── 📂 Builder/                  Trang kéo thả chính
│   │   ├── Builder.jsx + Builder.css
│   │   │
│   │   ├── 📂 Sidebar/             Cột trái: Kho linh kiện
│   │   │   ├── Sidebar.jsx + Sidebar.css
│   │   │   └── 📂 BlockCard/       1 block item
│   │   │
│   │   ├── 📂 Canvas/              Cột giữa: Phone preview + rows
│   │   │   ├── Canvas.jsx + Canvas.css
│   │   │   ├── 📂 RowContainer/    1 hàng (header + grid cells)
│   │   │   ├── 📂 BlockPlaceholder/ Placeholder box 1 block
│   │   │   └── 📂 AddRowBar/       Nút thêm hàng (1/2/3 cột)
│   │   │
│   │   └── 📂 ConfigPanel/         Cột phải: Cấu hình
│   │       ├── ConfigPanel.jsx + ConfigPanel.css
│   │       ├── 📂 AppConfig/       Form tên, theme, layout
│   │       ├── 📂 ContractConfig/  Cài đặt contract
│   │       └── 📂 TabManager/      Quản lý trang (thêm/xóa/đổi tên)
│   │
│   └── 📂 Preview/                 Xem trước app full màn hình
│
├── 📂 utils/
│   ├── constants.js                 API_BASE_URL, DRAG_TYPES, ...
│   ├── subjects.js                  Bài học + phân loại (từ data/ cũ)
│   └── formatters.js               Prefix IDs, format tên file
│
├── App.jsx                          Root: routing
├── App.css
├── main.jsx                         Entry point
├── index.css                        CSS Reset + CSS Variables
└── theme.js                         Design tokens (colors, spacing, radius)
```

---

## 3. Layout Builder (3 Cột)

```
┌──────────┬────────────────────────┬──────────────────┐
│ SIDEBAR  │       CANVAS           │  CONFIG PANEL     │
│ 280px    │       flex: 1          │  300px            │
│          │                        │                   │
│ 📚/🛠️   │  📱 Phone Frame        │  ⚙️ Cấu Hình     │
│ Tabs     │  ┌────────────────┐    │  🔗 Contract      │
│ 🔍Search │  │ [Row 1] full   │    │  🗂️ Quản lý trang│
│          │  │ [Row 2] 2 cột  │    │                   │
│ Block    │  │ [Row 3] 3 cột  │    │                   │
│ List     │  │ [+ Thêm hàng]  │    │                   │
│          │  └────────────────┘    │                   │
└──────────┴────────────────────────┴──────────────────┘
```

---

## 4. Hệ Thống Hàng + Cột (Thay Template Cũ)

| Cũ (Template cứng) | Mới (Hàng tự do) |
|---|---|
| Chọn 1 trong 4 mẫu | User tự thêm hàng, mỗi hàng chọn 1/2/3 cột |
| Slots cố định | Kéo thả block vào ô bất kỳ |
| Không đổi thứ tự | Kéo hàng lên/xuống sắp xếp |
| `data/templates.js` | **Xóa bỏ** |

**State mới**: `tabs[].rows[]` thay `tabs[].slots{}`

**2 loại drag-drop**:
- **BLOCK**: Sidebar → Cell (kéo block vào ô)
- **ROW**: Row ↕ Row (sắp xếp hàng)

**Preview**: Placeholder box (icon + label + desc) thay `dangerouslySetInnerHTML`

---

## 5. Dependencies

| Package | Vai trò | Mới? |
|---|---|---|
| `react` | UI | Có sẵn |
| `react-dom` | UI | Có sẵn |
| `@hello-pangea/dnd` | Drag & drop | Có sẵn |
| `axios` | HTTP client | **Thêm** |
| `react-router-dom` | Routing | **Thêm** |
| `react-toastify` | Thông báo đẹp | **Thêm** |

---

## 6. Vite Config

- Thêm `~` alias: `'~' → './src'` để import gọn
- Co-located CSS: mỗi component có file `.css` riêng

---

## 7. Files Xóa / Tạo Mới

### Xóa:
- `src/data/blocks.js` — 105KB → Backend
- `src/data/templates.js` — Không cần template
- `src/utils/exportEngine.js` — Logic → Backend
- `src/components/PreviewArea.jsx` — Thay bằng Canvas

### Tạo mới:
- `apis/` — 4 files (index, auth, blocks, export)
- `pages/Auth/` — Login + Register
- `pages/Dashboard/` — Danh sách dự án
- `pages/Builder/Canvas/` — RowContainer, BlockPlaceholder, AddRowBar
- `pages/Builder/ConfigPanel/` — AppConfig, ContractConfig, TabManager
- `components/AppBar/` — Header chung
- `components/ExportModal/` — Tách từ App.jsx
- `utils/constants.js` + `theme.js`

---

## 8. Quy Trình Triển Khai

1. Đổi tên `react-builder/` → `web/`
2. Cài thêm `axios`, `react-router-dom`, `react-toastify`
3. Thêm `~` alias vào `vite.config.js`
4. Tạo `apis/`, `utils/constants.js`, `theme.js`, `index.css` (CSS vars)
5. Tạo `pages/Auth/` (Login + Register)
6. Tạo `pages/Dashboard/`
7. Tạo `pages/Builder/Canvas/` (RowContainer, BlockPlaceholder, AddRowBar)
8. Tạo `components/AppBar/`, `ExportModal/`
9. Tách ConfigPanel → AppConfig + ContractConfig + TabManager
10. Refactor Sidebar (dùng API metadata)
11. Refactor App.jsx (routing + auth state)
12. Xóa files cũ
13. Test toàn bộ
