# BÁO CÁO KẾT QUẢ KIỂM THỬ — T01 đến T11

**Dự án:** Backend quản lý sinh viên
**Công nghệ:** Node.js 24, Express 5, TypeScript 5 (ESM/NodeNext), pnpm 10, tsx
**Server:** http://localhost:5000
**Ngày chạy:** 02/10/2026

---

## Điều kiện chạy

- Server khởi động bằng `pnpm dev` tại thư mục gốc dự án.
- Dữ liệu trong bộ nhớ, nên **trước khi chạy chuỗi test phải restart server** (`Ctrl+C` rồi `pnpm dev`) để trở về đúng dữ liệu mẫu SV001, SV002.
- **Không sửa hoặc lưu file giữa các ca phụ thuộc dữ liệu**, vì `tsx watch` sẽ khởi động lại server và làm mất dữ liệu vừa thêm.
- Thứ tự bắt buộc: **T05 (POST lần đầu) phải chạy trước T06 (POST trùng)**. Nếu đã thêm SV003 mà chưa reset thì T05 nhận 409 — đó là sai điều kiện chạy test, không phải lỗi chương trình.

## Cách chạy lại

```bash
pnpm dev                  # terminal 1: khởi động server
node test-t01-t11.mjs     # terminal 2: chạy toàn bộ ca kiểm thử
```

Trên Postman: import `postman-collection.json` (12 request, phủ T01–T11), chạy Run Collection theo thứ tự 01 → 12.

---

## Kết quả

| ID | Điều kiện ban đầu | Method & URL | Body | Kết quả mong đợi | Kết quả thực tế | Đạt? |
|---|---|---|---|---|---|---|
| T01 | Server vừa khởi động | GET `/` | — | 200; đúng lời chào | 200; `success:true`, "Backend quản lý sinh viên đang hoạt động" | Đạt |
| T02 | Seed mới (2 SV) | GET `/api/v1/sinh-vien` | — | 200; đúng 2 sinh viên mẫu | 200; `data` là mảng, có SV001 và SV002 | Đạt |
| T03 | Seed mới | GET `/api/v1/sinh-vien/SV001` | — | 200; đúng Minh Nhật | 200; `data` là **một object**, `maSV: SV001`, `hoTen: Minh Nhật` | Đạt |
| T04 | Seed mới | GET `/api/v1/sinh-vien/SV999` | — | 404; `success=false` | 404; "Không tìm thấy sinh viên" | Đạt |
| T05 | Chưa có SV003 | POST `/api/v1/sinh-vien` | SV003 hợp lệ | 201; đọc lại được SV003 | 201; `data.maSV=SV003`, và GET lại `/SV003` trả đúng thông tin | Đạt |
| T06 | **Đã có SV003, chưa restart** | POST `/api/v1/sinh-vien` | SV003 (lặp lại) | 409; SV003 vẫn chỉ có một | 409; "Mã sinh viên đã tồn tại"; GET danh sách vẫn đúng 3 sinh viên | Đạt |
| T07 | Chưa có SV004 | POST `/api/v1/sinh-vien` | thiếu `hoTen` | 400; không lưu | 400; "Thiếu trường bắt buộc: hoTen"; GET `/SV004` → 404 | Đạt |
| T08 | Chưa có SV004 | POST `/api/v1/sinh-vien` | email sai | 400; không lưu | 400; "Email không hợp lệ, cần có dạng tên@miền.phầnđuôi" | Đạt |
| T09 | Chưa có SV004 | POST `/api/v1/sinh-vien` | `maSV: 4` (số) | 400; không lưu | 400; "Trường maSV phải là chuỗi (string)" | Đạt |
| T10 | — | POST `/api/v1/sinh-vien` | `{"maSV":"SV004"` hở ngoặc | 400; phản hồi JSON dễ hiểu | 400; JSON `success:false`, không phải trang HTML | Đạt |
| T11 | — | GET `/khong-co` | — | 404; thông báo đường dẫn | 404; "Không tìm thấy đường dẫn" | Đạt |

**Tổng: 16/16 ca đạt** (11 ca chính + 5 ca kiểm tra bổ sung).

## Ca kiểm tra bổ sung (theo bảng trang 28)

| Ca | Thay đổi trong body hợp lệ | Mong đợi | Thực tế | Đạt? |
|---|---|---|---|---|
| X1 | `maSV: "ABC004"` (sai dạng) | 400; không thêm | 400; "Mã sinh viên phải đúng định dạng SV + 3 chữ số, ví dụ SV003" | Đạt |
| X2 | `hoTen: "   "` (chỉ khoảng trắng) | 400; không thêm | 400; "Họ tên không được để trống hoặc chỉ chứa khoảng trắng" | Đạt |
| X3 | Xóa trường `maLop` | 400; không thêm | 400; "Thiếu trường bắt buộc: maLop" | Đạt |

## Phân biệt hai loại 404

| Ca | Nguyên nhân | Message |
|---|---|---|
| T04 | Đường dẫn đúng, có chức năng, nhưng không có dữ liệu | "Không tìm thấy sinh viên" |
| T11 | Đường dẫn không có chức năng nào đáp ứng | "Không tìm thấy đường dẫn" |

Cùng status 404 nhưng nguyên nhân khác nhau. Đọc `message` để xác định request đã tới đúng chức năng hay chưa.

---

## Ảnh minh chứng

Theo yêu cầu bài: đính kèm ảnh rõ status và body cho **ít nhất một ca thành công** và **hai ca bị từ chối**.

Ảnh nằm trong thư mục `minh-chung/`, chụp từ Postman sau khi bấm **Send**:

| Ảnh | Ca | Request | Status hiển thị | Body hiển thị |
|---|---|---|---|---|
| `minh-chung/01-T05-thanh-cong-201.png` | Thành công | `06 - T05 Them SV003 (201)` | `201 Created` | `success: true`, `message: "Thêm sinh viên thành công"`, kèm `data.maSV = SV003` |
| `minh-chung/02-T06-tu-choi-trung-ma-409.png` | Bị từ chối — trùng mã | `08 - T06 Tu choi trung ma (409)` | `409 Conflict` | `success: false`, `message: "Mã sinh viên đã tồn tại"` |
| `minh-chung/03-T07-du-lieu-sai-400.png` | Bị từ chối — dữ liệu sai | `09 - T07 Thieu ho ten (400)` | `400 Bad Request` | `success: false`, `message: "Thiếu trường bắt buộc: hoTen"` |

Cả ba ảnh đều chụp được vùng response đang hiển thị trên màn hình Postman: dòng status (mã + tên + thời gian + dung lượng) nằm ngay trên khung body JSON.

**Thứ tự chạy để tái lập đúng kết quả trong ảnh:**

1. Tắt server cũ, chạy `pnpm dev` để dữ liệu trở về 2 sinh viên mẫu `SV001`, `SV002`.
2. Bấm Send lần lượt: request `06` → `08` → `09`. Không restart server giữa chuỗi.

Không restart giữa chuỗi là điều kiện bắt buộc: request `06` tạo mới `SV003`, chỉ khi đó request `08` mới nhận `409`. Nếu restart, `SV003` biến mất và `08` sẽ trả `201`.

Ngoài ra nên chụp thêm vùng **Test Results** của request 02 và request 08 để chứng minh các phép kiểm tra tự động đều PASS.

---

## Giới hạn của bằng chứng này

- Một ảnh status 200 không chứng minh toàn bộ Backend đúng. Mỗi ca chỉ cung cấp bằng chứng cho đúng yêu cầu và dữ liệu đã thử.
- Chưa kiểm thử bảo mật, hiệu năng, hoặc mọi tình huống có thể xảy ra trong thực tế.
- Chưa kiểm tra HTTP method sai (ví dụ PUT/PATCH/DELETE trên các đường dẫn hiện có).
- Dữ liệu nằm trong bộ nhớ nên restart là mất; kết quả này không áp dụng được khi đã chuyển sang database.
