# QUY TẮC VÀNG THIẾT KẾ KHỐI (BLOCKS) CHO STEM WEB3 BUILDER

> Tài liệu này đóng vai trò là "Kim chỉ nam" cho việc sáng tạo và đóng gói các tính năng mới vào nền tảng kéo-thả No-Code Web3 trong tương lai.

---

## 🏗️ 1. TRIẾT LÝ CỐT LÕI: "MỘT KHỐI = MỘT HÀNH ĐỘNG TRỌN VẸN CỦA CON NGƯỜI"
Mỗi Khối (Block) được kéo ra phải đại diện cho một hành động có ý nghĩa từ phía người dùng cuối (Học sinh/Người chơi). 

### ❌ Tránh thiết kế Khối Quá To (Monolithic):
- Không nhồi nhét quá nhiều tính năng (Vừa bán, vừa mua, vừa bầu cử) vào chung 1 khối.
- Giao diện sẽ bị ngợp, mất đi khả năng sáng tạo và tính lắp ghép "Lego" của ứng dụng.
- Code xuất ra HTML sẽ phình to, rối rắm khó bảo trì.

### ❌ Tránh thiết kế Khối Quá Nhỏ (Micro):
- Không tách các bước kỹ thuật rườm rà thành khối riêng (VD: Khối Cấp Quyền Dàn Xếp Token - Approve, rớt khỏi Khối Mua).
- Học sinh không rành kỹ thuật sẽ bị chìm nghỉm trong ma trận Logic.

### ✅ ĐÚNG CHUẨN: Hành Động Cấp Vĩ Mô (Macro-Action):
- **Ví dụ chuẩn:** `Khối Trạm Ký Gửi`, `Khối Cửa Hàng Mua Bán`, `Khối Rút Hàng (Cancel)`, `Khối Điểm Danh Lấy Token`.
- Mỗi khối tự bao bọc toàn bộ kỹ thuật ngầm (Approve, Query, Parsing) ở bên trong. Đầu ra chỉ là: **"Bấm Nút -> Kết Quả"**.

---

## 🛠️ 2. QUY TẮC ĐÓNG GÓI CODE TRONG `blocks.js`

### A. Tự động hóa Kỹ thuật ngầm (Under-the-hood):
Nếu một nút bấm yêu cầu chuỗi thao tác kỹ thuật liền kề trên Smart Contract (Gọi hàm A đợi xong mới gọi hàm B), **PHẢI** đóng gói tất cả vào một hàm duy nhất trong `engineCode`.
*Ví dụ:* Trước khi Mua (Buy) thì cần phải Duyệt chi tiêu (Approve ERC20). Khối Mua Hàng phải tự giác gọi `Approve` rồi mới gọi `Buy`. Không bắt học sinh phải kéo 2 khối khác nhau ra ghép.

### B. Tham số động qua Cấu hình (Configurator):
Khối cần có khả năng tái sử dụng tối đa bằng cách mở tham số cho học sinh tự điều chỉnh ở Panel Cấu Hình bên phải.
*Ví dụ:* Contract Address, Chế độ (Admin/User), Màu sắc, Tiêu đề.

### C. Độc lập Cục bộ (Isolation):
- Khi xuất HTML, Khối A không được phép phụ thuộc vào việc *"Học sinh có kéo Khối B ra hay không"*.
- Javascript/CSS của Khối A phải chạy trơn tru dù nó nằm một mình hay ôm chung cùng chục khối khác (Sử dụng kỹ thuật Tiền tố `pfx` để tránh đụng độ ID DOM).

### D. Xử lý Lỗi (Error Handling) thân thiện:
- Báo lỗi phải dùng ngôn ngữ "Người thường" (Học sinh/giáo viên hiểu được) thay vì in nguyên mớ rác Error của Metamask.
- *Ví dụ:* Thay vì báo `execution reverted: ERC20: transfer amount exceeds balance`, hãy ghi: `❌ Ví không đủ Token để nộp! Hãy Điểm Danh thêm.`

---

## 🌍 3. TƯ DUY KIẾN TRÚC MỞ (WEB3 COMPOSABILITY)

Khuyến khích thiết kế các Khối dựa trên các Chuẩn Mực của Thế giới Web3 (Standard ERCs) để học sinh **tuỳ ý kết hợp các Hợp đồng khác nhau** (Smart Contract Lego pieces).
- **Tiền Tệ:** Thiết kế khối chuẩn theo ERC20. (Áp dụng được cho Điểm, Xu lớp học, Vé...)
- **Tài Sản hiếm / Thẻ Bài:** Thiết kế khối chuẩn theo ERC721/ERC1155.
- **Thương Mại:** Sử dụng các chuẩn giao dịch chung như MarketplaceV3.

Nhờ Tuân thủ Chuẩn mực này, Học sinh có thể dùng **"Tiền Lớp A"** đi sang Ứng dụng để Mua **"Thẻ Bài Lớp B"** trên Chợ Sàn **"Do Lớp C tạo ra"**. Đây chính là Sức mạnh Cốt Lõi của Blockchain! 🚀
