# 🏗️ BACKEND DESIGN — STEM Web3 Builder

> **Chuẩn cấu trúc**: TrungQuanDev (Express + MongoDB)  
> **Xác thực**: Email + Password (JWT)

---

## 📋 Changelog

### ✅ 17/04/2026 — Auth + App Ownership

**Đã hoàn thành:**
- **Auth JWT thật**: Register (kiểm tra trùng email + displayName) → Login → trả Access Token (1h) + Refresh Token (14 ngày). JWT payload gồm `_id, email, role, displayName`.
- **Frontend Auth**: Trang Login/Register gọi API thật, lưu `accessToken` vào localStorage, gửi kèm header `Authorization` trong mọi request.
- **App Model** (`appModel.js`): Schema MongoDB collection `apps` — `userId, authorEmail, filename, title, url, size, createdAt, _destroy`.
- **Export → MongoDB**: `exportService.saveHtmlFromData()` sau khi ghi file HTML xong sẽ tự insert metadata vào MongoDB (cần user đăng nhập).
- **App Routes**: `GET /my` (apps của tôi, cần JWT), `DELETE /:filename` (xóa + kiểm tra ownership), `GET /explore` (public, phân trang + search + filter).
- **App Service**: `getMyApps(userId)`, `explore(query)`, `deleteApp(filename, userId)` — có chống path traversal + kiểm tra ownership.

---

### 🔲 Việc cần làm tiếp

1. **Frontend trang Apps**: Cập nhật `Apps.jsx` gọi API `/my` + `/explore` thay vì đọc filesystem. Hiển thị 2 tab: "Apps Của Tôi" và "Khám Phá".
2. **Frontend Export flow**: Nút "Xuất App" gửi kèm JWT → backend lưu metadata đúng userId.
3. **Refresh Token**: Frontend chưa xử lý auto-refresh khi access token hết hạn (interceptor axios).
4. **Block data**: Kiểm tra lại `Assembler` nhận đúng format từ Frontend khi Test/Preview.

---

## 1. Cấu Trúc Thư Mục

```
server/
├── src/
│   ├── config/
│   │   ├── environment.js          Biến môi trường (PORT, DB_URI, JWT_SECRET...)
│   │   ├── mongodb.js              Kết nối MongoDB
│   │   └── cors.js                 CORS whitelist
│   │
│   ├── controllers/
│   │   ├── authController.js       Xử lý request đăng ký/đăng nhập
│   │   ├── userController.js       Xử lý request thông tin user
│   │   ├── blockController.js      Xử lý request metadata/batch-code
│   │   ├── exportController.js     Xử lý request xuất HTML/save
│   │   └── appController.js        Xử lý request quản lý apps đã xuất
│   │
│   ├── services/
│   │   ├── authService.js          Logic đăng ký/đăng nhập/token
│   │   ├── userService.js          Logic lấy/cập nhật user
│   │   ├── blockService.js         Logic đọc metadata + cache
│   │   ├── exportService.js        Logic nối HTML (assembler)
│   │   └── appService.js           Logic liệt kê/xóa apps đã xuất
│   │
│   ├── models/
│   │   ├── userModel.js            Schema User (email, password, name...)
│   │   └── appModel.js             Schema App (userId, filename, title...)
│   │
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── index.js            Gom tất cả routes v1
│   │   │   ├── authRoute.js        /api/v1/auth/*
│   │   │   ├── userRoute.js        /api/v1/users/*
│   │   │   ├── blockRoute.js       /api/v1/blocks/*
│   │   │   ├── exportRoute.js      /api/v1/export/*
│   │   │   └── appRoute.js         /api/v1/apps/*
│   │   └── v1.js                   Mount routes v1
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js       Verify JWT token
│   │   └── errorHandling.js        Xử lý lỗi tập trung
│   │
│   ├── validations/
│   │   ├── authValidation.js       Validate email/password format
│   │   └── exportValidation.js     Validate export payload
│   │
│   ├── utils/
│   │   ├── constants.js            Hằng số (WHITELIST_DOMAINS, ...)
│   │   └── helpers.js              Hàm tiện ích chung
│   │
│   ├── engine/
│   │   ├── assembler.js            Nối HTML từ cache (logic exportEngine.js cũ)
│   │   ├── template.js             HTML shell boilerplate
│   │   └── blockCache.js           HashMap cache O(1) cho block data
│   │
│   └── server.js                   Entry point
│
├── data/
│   └── blocks/                     Mỗi block = 1 folder (file-based)
│       ├── wallet/                 meta.json + export.html + engine.js + global.js
│       ├── balance/
│       ├── claim/
│       ├── transfer/
│       └── ...
│
├── apps/                           Output HTML đã xuất
├── scripts/
│   └── extract-blocks.js           Script tách blocks.js → folders (chạy 1 lần)
│
├── .env                            Biến môi trường (không commit)
├── package.json
└── .gitignore
```

---

## 2. Luồng Request (3 Tầng)

```
Request → Route → Validation → Controller → Service → Model/Cache → Response
```

| Tầng | Vai trò |
|---|---|
| **Route** | Định nghĩa URL + HTTP method, gắn middleware |
| **Validation** | Kiểm tra dữ liệu đầu vào (Joi) |
| **Controller** | Nhận request, gọi service, trả response |
| **Service** | Logic nghiệp vụ chính |
| **Model** | Tương tác MongoDB (schema, query) |

---

## 3. API Endpoints

### 3.1. Auth — `/api/v1/auth`

| Method | URL | Mô tả | Auth? |
|---|---|---|---|
| POST | `/register` | Đăng ký (email + password + displayName) | ❌ |
| POST | `/login` | Đăng nhập → trả JWT access token + refresh token | ❌ |
| PUT | `/refresh-token` | Làm mới access token | ❌ |
| DELETE | `/logout` | Xóa refresh token | ✅ |

### 3.2. Users — `/api/v1/users`

| Method | URL | Mô tả | Auth? |
|---|---|---|---|
| GET | `/me` | Lấy thông tin user đang đăng nhập | ✅ |
| PUT | `/me` | Cập nhật displayName, avatar | ✅ |

### 3.3. Blocks — `/api/v1/blocks`

| Method | URL | Mô tả | Auth? |
|---|---|---|---|
| GET | `/metadata` | Danh sách metadata nhẹ (~2KB) | ❌ |
| POST | `/batch-code` | Lấy code nhiều blocks cùng lúc | ✅ |

### 3.4. Export — `/api/v1/export`

| Method | URL | Mô tả | Auth? |
|---|---|---|---|
| POST | `/html` | Nối HTML từ cache → trả string | ✅ |
| POST | `/save` | Nối HTML + lưu file → trả URL | ✅ |

### 3.5. Apps — `/api/v1/apps`

**Quản lý apps của bản thân (private):**

| Method | URL | Mô tả | Auth? |
|---|---|---|---|
| GET | `/my` | Danh sách apps **của tôi** đã xuất | ✅ |
| DELETE | `/:filename` | Xóa 1 app (kiểm tra ownership) | ✅ |

**Khám phá apps của mọi người (public):**

| Method | URL | Mô tả | Auth? |
|---|---|---|---|
| GET | `/explore?page=1&limit=12&search=NFT&author=nghia&sort=newest` | Duyệt tất cả apps, có phân trang + bộ lọc | ❌ |

**Chi tiết `GET /explore`:**

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `page` | Number | `1` | Trang hiện tại |
| `limit` | Number | `12` | Số app mỗi trang (max 50) |
| `search` | String | `""` | Tìm theo title (regex, không phân biệt hoa thường) |
| `author` | String | `""` | Tìm theo tên người tạo |
| `sort` | String | `"newest"` | Sắp xếp: `"newest"` (mới nhất), `"oldest"` (cũ nhất) |

**Response:**
```json
{
  "apps": [ { "filename", "title", "url", "size", "createdAt", "author" } ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalApps": 156,
    "totalPages": 13
  }
}
```

> **Lưu ý**: File HTML tĩnh vẫn được serve public qua `express.static('apps')` — ai có link trực tiếp vẫn mở được (đúng bản chất dApp). API `/explore` chỉ giúp **khám phá** app, còn `/my` quản lý app của riêng mình.

---

## 4. Database — MongoDB

### 4.1. Collection `users`

| Field | Type | Mô tả |
|---|---|---|
| `_id` | ObjectId | Auto |
| `email` | String | Unique, lowercase |
| `password` | String | Hashed (bcrypt) |
| `displayName` | String | Tên hiển thị |
| `avatar` | String | URL avatar (optional) |
| `role` | String | `student` / `teacher` |
| `createdAt` | Date | Ngày tạo |
| `updatedAt` | Date | Ngày cập nhật |

### 4.2. Collection `apps`

| Field | Type | Mô tả |
|---|---|---|
| `_id` | ObjectId | Auto |
| `userId` | ObjectId | Ref → users (ai đã xuất app này) |
| `filename` | String | Tên file (`app-mnv47cm8.html`) |
| `title` | String | Đọc từ `<title>` khi export |
| `url` | String | `/apps/app-mnv47cm8.html` |
| `size` | Number | Dung lượng file (bytes) |
| `createdAt` | Date | Ngày xuất |

---

## 5. Xác Thực (Auth)

| Hạng mục | Chi tiết |
|---|---|
| **Chiến lược** | JWT (Access Token + Refresh Token) |
| **Hash password** | bcryptjs (10 rounds) |
| **Access Token** | Hết hạn 1h, gửi qua header `Authorization: Bearer <token>` |
| **Refresh Token** | Hết hạn 14 ngày, lưu httpOnly cookie |
| **Middleware** | `authMiddleware.js` verify token trước mỗi protected route |

---

## 6. Block Cache (giữ nguyên)

- Server khởi động → đọc tất cả `data/blocks/*/` → nhét vào HashMap `{}`
- Mọi request đọc từ cache RAM → O(1), ~0ms
- Tổng cache ~105KB → không đáng kể
- Reload cache khi thêm block mới

---

## 7. Dependencies

| Package | Vai trò |
|---|---|
| `express` | Web framework |
| `cors` | Cross-origin |
| `mongodb` | MongoDB driver |
| `bcryptjs` | Hash password |
| `jsonwebtoken` | JWT sign/verify |
| `joi` | Validation schema |
| `dotenv` | Biến môi trường |
| `http-status-codes` | HTTP status constants |

---

## 8. Biến Môi Trường (`.env`)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/stem-web3
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
CLIENT_URL=http://localhost:5173
```

---

## 9. Quy Trình Triển Khai

1. `npm init` + cài dependencies
2. Tạo `.env` + `config/environment.js`
3. Kết nối MongoDB (`config/mongodb.js`)
4. Tạo models (user, project)
5. Tạo auth flow (register → login → JWT → middleware)
6. Di chuyển block cache + assembler engine
7. Tạo export routes
8. Chạy `extract-blocks.js` tách blocks.js
9. Test toàn bộ API với Postman
