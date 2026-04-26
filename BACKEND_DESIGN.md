# 🏗️ BACKEND DESIGN — STEM Web3 Builder

> **Chuẩn cấu trúc**: TrungQuanDev (Express + MongoDB)  
> **Xác thực**: Email + Password (JWT)

---

## 📋 Changelog

### ✅ 26/04/2026 — Chuẩn hóa Factory & Admin Revoke

**Đã hoàn thành:**
- **Chuẩn hóa Factory**: Chuyển toàn bộ cấu hình địa chỉ contract factory sang `backend/data/contracts/contractFactorys.js` để dễ quản lý và cập nhật.
- **Nâng cấp ERC721 Siêu Cấp**: Tích hợp tính năng **Soulbound (SBT)** vào `StemNFT`. Cho phép tạo bộ sưu tập Chứng chỉ không thể chuyển nhượng.
- **Admin Revoke**: Phát triển khối chức năng **🔥 Thu Hồi Chứng Chỉ** (`admin-revoke.js`) cho phép Admin đốt NFT đã cấp nhầm từ ví học sinh.
- **Bảo mật Marketplace**: Cập nhật khối `market-list.js` để tự động kiểm tra và chặn niêm yết bán các NFT loại Soulbound (Bằng khen).
- **Tối ưu Tủ Kính (Drop Gallery)**: Nâng cấp thuật toán quét NFT trong khối `drop-gallery.js` sử dụng chuẩn `ERC721Enumerable` (`balanceOf` + `tokenOfOwnerByIndex`) giúp hiển thị chính xác 100% trạng thái thực tế trên Blockchain.
- **Dọn dẹp mã nguồn**: Loại bỏ các file cấu hình cũ (`contracts.js` trong data/blocks) để tránh xung đột.

---

### 🔲 Việc cần làm tiếp

- **Phát triển Gacha Drop Factory**: Thiết kế hệ thống Đúc Lười (Lazy Minting). Cho phép giáo viên nạp "bản thiết kế" NFT lên Contract và học sinh vào tự quay Gacha (Claim) ngẫu nhiên.
- **Triển khai ERC1155Factory**: Hoàn thiện bộ công cụ cho chuẩn NFT đa năng (Semi-fungible tokens).

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

---

## 10. Kiến Trúc "Token Siêu Cấp" (Full Option)

Thay vì sử dụng nhiều loại Token khác nhau cho từng tính năng, hệ thống Stem Builder thống nhất sử dụng các **Token Siêu Cấp (Super Token)** tích hợp đầy đủ tính năng ngay từ đầu. Chúng ta **KHÔNG** sử dụng Upgradable Proxy cho các Token Factory (như ERC20 hay ERC721) để đơn giản hóa quá trình triển khai, nhưng bản thân các Token được tạo ra sẽ mang "full tính năng".

### 10.1. `StemToken` (ERC20 Full Option)
Kế thừa đồng thời:
- `ERC20` (Chuyển tiền, Balance, Allowance cho Marketplace/DEX)
- `ERC20Burnable` (Tính năng đốt coin tương lai)
- `ERC20Permit` (Phê duyệt không tốn gas)
- `ERC20Votes` (Sử dụng cho khối Bầu cử DAO, có snapshot/delegate)

Token này tương thích **100% ngược và xuôi** với mọi khối trong hệ thống (từ Cơ bản đến Nâng cao).

### 10.2. `StemNFT` (ERC721 Full Option)
Kế thừa đồng thời:
- `ERC721` (Mint, Transfer, Appprove cho Marketplace)
- `ERC721URIStorage` (Lưu trữ metadata on-chain linh hoạt)
- `ERC721Burnable` (Tính năng đốt NFT)
- `ERC721Enumerable` (Quản lý và duyệt danh sách NFT dễ dàng, quan trọng cho front-end)
- `ERC2981` (Royalty cho NFT Marketplace)

### 10.3. Các bước triển khai (Đang thực hiện)
1. Deploy `ERC20Factory` (thông thường, không proxy) qua Remix IDE.
2. Deploy `ERC721Factory` (thông thường, không proxy) qua Remix IDE.
3. Lưu địa chỉ các Factory vào hệ thống (ghi vào `ContractDeploy.txt`).
4. Cập nhật khối **Máy Tạo Coin** (`backend/data/blocks/erc20-factory.js`) và khối **Tạo Bộ Sưu Tập NFT** (`backend/data/blocks/mint-nft.js` hoặc tương tự) để trỏ đến địa chỉ Factory mới.
5. Test luồng tạo Coin/NFT mới và dùng chúng cho Khối Bầu Cử DAO, Marketplace.
