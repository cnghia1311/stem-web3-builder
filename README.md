# 🚀 STEM Web3 Builder

Một nền tảng **Xếp hình Lập trình Phi tập trung (No-code DApp Builder)** được thiết kế riêng biệt cho học sinh Trung học và giáo dục STEM. Triết lý của dự án là loại bỏ mọi rào cản về mã nguồn (Cú pháp, Lỗi cài đặt, Thuật ngữ hàn lâm), cho phép học sinh tương tác trực tiếp với không gian Web3 thông qua trải nghiệm **lắp ghép kéo-thả (Drag & Drop) siêu trực quan**.

_"Chúng ta không dạy học sinh cách chế tạo động cơ đốt trong, chúng ta đưa cho các em vô lăng để tập làm Tài xế lái chiếc xe Web3."_

---

## 🎯 Triết lý & Kiến trúc Cốt lõi (Core Philosophy)

1. **Học qua Dự án (Project-Based Learning / Top-Down):** Thay vì vật lộn 30 phút với lỗi Dấu phẩy (`,`) khi code `ethers.js`, học sinh dùng 5 phút để xây thành công 1 App Ngân hàng Web3 bằng Khối Lego. Từ sự phấn khích đó, các em mới lật ngược lại tìm hiểu Bản chất của Blockchain phi tập trung.
2. **Kiến trúc Sinh HTML Tĩnh (Static HTML Engine):** Hệ thống không xuất ra một thư mục React nặng nề hay bắt cài Node.js. Nó "rút ruột" và tối ưu hóa logic xuất ra duy nhất **1 file tĩnh `.html`**. File này lưu ở USB hay chạy Offline trên mọi máy tính đều tự động kết nối với mạng lưới Blockchain toàn cầu.
3. **Cơ chế Cô lập thông minh (IIFE Isolation & Global Deduplication):** Cho phép học sinh tùy ý kéo 10 "Khối Số Dư" khác nhau quăng vào cùng 1 màn hình mà không sợ bị xung đột biến. Hệ thống tự động gộp các lệnh tốn tài nguyên (RPC Polling) thành một đồng hồ tổng để chống nghẽn mạng.

---

## 🛠️ Trạng thái Tính năng Hiện tại (Version 1.0)

- [x] **Trải nghiệm Kéo - Thả mượt mà:** Khung nền tảng React với hệ thống kéo thả trực quan phân ô (Grid System).
- [x] **Chế độ Lọc bài học kép (Dual-Mode Sidebar):**
  - **Bài học (Guided):** Sidebar chỉ lọc ra ĐÚNG 3 khối cần thiết cho bài giảng để chống làm rối trí học sinh.
  - **Sáng tạo (Sandbox):** Sidebar mở bung tất cả các khối theo dạng Accordion kèm Thanh Tìm kiếm để học sinh tự do sáng chế.
- [x] **Khối Ví MetaMask:** Kết nối và cắt ghép địa chỉ ví cực kỳ nhanh gọn.
- [x] **Khối Số Dư Đa Năng:** Hỗ trợ menu Dropdown cho phép người dùng đổi token qua lại (USDT, LINK, ETH) trực tiếp trên trang tĩnh của học sinh, kèm khả năng tự dò tên Token `symbol()` tự động từ Smart contract.
- [x] **Khối Chuyển Tiền:** Cho phép dán ví người nhận và thực thi giao dịch chuỗi khối.
- [x] **Khối Nhận Lương (Faucet):** Chữa cháy nhanh cho học sinh hết tiền làm phí Gas.
- [x] **Khối Đúc NFT Cơ bản:** Mảnh ghép mở đầu cho thế giới nghệ thuật số.

---

## 🔮 Kế hoạch Tương lai & Tầm nhìn Mở rộng (Roadmap)

Dự án này sẽ tiếp tục được nâng cấp thành một Hệ sinh thái Sư phạm Toàn diện:

### 🌟 Tính năng Sắp Tới (Sắp triển khai)
- [ ] **Khối Vạn Năng (Generic ABI Block):** 
  - *Mô tả:* "Trùm cuối" của công cụ. Học sinh chỉ việc dán `Contract Address` và mã cấu trúc `JSON ABI` của bất kỳ hợp đồng thông minh nào trên thế giới vào. Khối này sẽ tự động đọc hiểu và "thiết kế ngược" sinh ra các Ô nhập liệu và Nút bấm tương ứng với các hàm Dữ liệu. (Làm 1 lần, xài vĩnh viễn với mọi dự án).
- [ ] **Bổ sung các Web-Template Ứng dụng STEM:**
  - *Thùng Phiếu (DAO Voting):* Ứng phó môn Giáo dục Công dân (Bầu ban cán sự).
  - *Gây Quỹ Lớp (Crowdfunding):* Ứng phó môn Toán học (Tính tổng quỹ, chạy thanh tiến độ).
  - *Sàn Đổi Kẹo (Mini DEX Swap):* Ứng phó bài học tỷ giá.
  - *Triển lãm Ảnh (NFT Gallery):* Ứng phó môn Mỹ Thuật (Vẽ tranh AI rồi gắn lên tường Web3).

### 🚀 Tầm nhìn Dài hạn (Hạ tầng 2.0)
- [ ] **Xưởng Đúc Code-Free (Smart Contract Forge):** 
  - Thay vì học sinh phải qua một trang web khác để Deploy (Chạy) hợp đồng lên mạng, Builder sẽ có 1 cái nút cho phép học sinh gõ chữ "Tên Token của em" rồi bấm Búa Đúc. Hệ thống tự đem hợp đồng lên mạng, lấy địa chỉ về nhét thẳng vào Builder.
- [ ] **Đăng tải Vũ Trụ IPFS (1-Click Decentralized Deployment):**
  - Giúp học sinh vứt bỏ mạng lưới Web2 truyền thống. Ấn nút xuất bản, file HTML sẽ bay thẳng lên máy chủ phi tập trung Pinata (IPFS). Học sinh lấy được "Link URL xịn xò" cho dự án để gửi vào Zalo Bố mẹ ngay lập tức.
- [ ] **Mở Khóa Theo Tiến Độ (Gamification Unlock):**
  - Mới vào học lớp 1 học sinh chỉ thấy Khối Ví và Chuyển tiền. Làm xong bài tập, màn hình pháo hoa nổ ra và thông báo *"Bạn đã mở khóa Khái niệm Token ERC20"*.

---

### 📄 Bản quyền
Sản phẩm được cấp phép dưới **MIT License**. Mọi thầy cô, lập trình viên trên toàn cầu đều được phép sao chép, tùy chỉnh và đem về giảng dạy hoàn toàn Miễn phí.

**Người Sáng Lập / Giám Đốc Kỹ Thuật:** [Tên Của Bạn / cnghia1311]
