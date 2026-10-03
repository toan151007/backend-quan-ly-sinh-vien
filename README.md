# Backend Quản Lý Sinh Viên

Bài thực hành Chương 2 — Backend với Node.js, Express 5, TypeScript và Postman.

---

## 1. Yêu cầu trước khi bắt đầu

| Công cụ | Phiên bản | Cách kiểm tra |
|---|---|---|
| Node.js | 22 hoặc 24 | `node -v` |
| pnpm | 10 | `pnpm -v` |

Chưa có thì cài:

```bash
npm install -g pnpm@10
```

Sau khi cài xong, **mở lại terminal** (hoặc mở terminal mới trong VS Code) để lệnh `pnpm` được nhận diện.

> Nếu PowerShell báo lỗi khi chạy `npm` hoặc `pnpm` (liên quan `ExecutionPolicy`), hãy đổi sang **Command Prompt** thay vì sửa chính sách bảo mật của Windows.

---

## 2. Cài đặt lần đầu

Mở terminal **tại thư mục gốc dự án** (thư mục có file `package.json`), rồi chạy:

```bash
pnpm install
```

Lệnh này tải thư viện về `node_modules` và tạo `pnpm-lock.yaml`.

---

## 3. Các lệnh trong dự án

Chạy tất cả lệnh sau tại thư mục gốc dự án.

| Lệnh | Tác dụng | Khi nào dùng |
|---|---|---|
| `pnpm dev` | Chạy `src/server.ts`, tự khởi động lại khi bạn lưu file | Trong lúc phát triển |
| `pnpm build` | Kiểm tra kiểu dữ liệu và chuyển `src` → `dist` | Trước khi chạy `pnpm start` |
| `pnpm start` | Chạy bản JavaScript trong `dist` | Sau khi đã `pnpm build` |
| `pnpm dev` (lần 2) | Dừng server: nhấn `Ctrl + C`, rồi chạy lại `pnpm dev` | Khi cần reset dữ liệu |

### Lưu ý quan trọng

- `pnpm dev` giữ terminal bận, không quay lại dấu nhắc nhập lệnh. **Đó là bình thường** — server đang chờ yêu cầu.
- Muốn chạy `pnpm build` trong khi `pnpm dev` đang chạy, hãy mở **terminal thứ hai** bằng nút `+` cạnh dấu `+` trong VS Code.
- `pnpm start` **yêu cầu build trước**. Nếu không build mà có `dist` từ lần cũ, bạn sẽ chạy code cũ.
- Chỉ chạy **một server trên cùng một cổng**. Nếu gặp lỗi `EADDRINUSE`, hãy dừng terminal cũ.

---

## 4. Khởi động dự án

```bash
pnpm dev
```

Đợi terminal in:

```
Server đang lắng nghe tại http://localhost:5000
```

Mở trình duyệt, gõ chính xác:

```
http://localhost:5000/
```

Kết quả cần thấy:

```json
{
  "success": true,
  "message": "Backend quản lý sinh viên đang hoạt động"
}
```

**Nếu tắt server rồi tải lại trang, sẽ không nhận được dữ liệu.** Vì trang web không tự chạy chương trình — bạn phải chạy `pnpm dev` để máy chủ sẵn sàng nhận yêu cầu.

---

## 5. Đổi cổng (không bắt buộc)

File `.env` ở thư mục gốc chứa:

```
PORT=5000
```

Đổi sang cổng khác, ví dụ `5001`, rồi **dừng server và chạy lại `pnpm dev`** để `.env` được nạp.

Nhớ cập nhật cả hai nơi:
- URL trình duyệt
- Biến `baseUrl` trong Postman

File `.env` không được nộp lên Git (đã nằm trong `.gitignore`). Dùng `.env.example` làm bản mẫu chia sẻ.

---

## 6. Kiểm thử bằng Postman

### 6.1 Import Collection

1. Mở Postman.
2. Chọn **Import** (nút `+` hoặc menu).
3. Kéo thả hoặc chọn file `postman-collection.json` trong thư mục dự án.
4. Collection tên **Backend Sinh Vien - Chuong 2** sẽ xuất hiện trong thanh bên.

### 6.2 Kiểm tra biến `baseUrl`

Mở Collection → tab **Variables**. Biến `baseUrl` phải có giá trị:

```
http://localhost:5000
```

**Không có dấu `/` ở cuối.** Đổi cổng thì chỉ cần sửa biến này, các request khác tự dùng theo.

Nếu Postman báo biến chưa có giá trị, kiểm tra request đã được lưu **đúng vào Collection** và biến đã bấm **Save**.

### 6.3 Chạy đúng thứ tự

**Trước khi chạy:** restart server để dữ liệu về đúng 2 sinh viên mẫu (SV001, SV002).

```bash
# Dừng server đang chạy
Ctrl + C
pnpm dev
```

Trong Postman, chọn Collection → **Run Collection** (Runner), hoặc bấm **Send** lần lượt theo thứ tự sau:

| # | Request | Method & URL | Kỳ vọng |
|---|---|---|---|
| 01 | Server hoạt động | GET `/` | 200 OK |
| 02 | Danh sách sinh viên | GET `/api/v1/sinh-vien` | 200 · `data` là mảng có SV001, SV002 |
| 03 | Tìm SV001 | GET `/api/v1/sinh-vien/SV001` | 200 · `data` là **một object** |
| 04 | Không có SV999 | GET `/api/v1/sinh-vien/SV999` | 404 · "Không tìm thấy sinh viên" |
| 05 | Đường dẫn không tồn tại | GET `/khong-co` | 404 · "Không tìm thấy đường dẫn" |
| 06 | Thêm SV003 | POST `/api/v1/sinh-vien` | **201 Created** |
| 07 | Đọc lại SV003 | GET `/api/v1/sinh-vien/SV003` | 200 · dữ liệu khớp body đã gửi |
| 08 | Từ chối trùng SV003 | POST `/api/v1/sinh-vien` | **409 Conflict** |
| 09 | Thiếu `hoTen` | POST `/api/v1/sinh-vien` | **400 Bad Request** |
| 10 | Email sai định dạng | POST `/api/v1/sinh-vien` | **400 Bad Request** |
| 11 | `maSV` gửi lên là số | POST `/api/v1/sinh-vien` | **400 Bad Request** |
| 12 | Body JSON hỏng | POST `/api/v1/sinh-vien` | **400** · Content-Type phải là JSON, không phải trang HTML |

### 6.4 Ba luật không được phá vỡ

1. **T05 (thêm SV003) phải chạy trước T06 (trùng SV003).** Đảo thứ tự sẽ nhận 201 ở cả hai.
2. **Không restart server giữa chuỗi.** `tsx watch` khởi động lại server khi bạn lưu file, dẫn đến mất dữ liệu vừa thêm và T06 nhận 201.
3. **Sau mỗi ca bị từ chối (400/409), gửi GET danh sách** để xác nhận dữ liệu không bị thay đổi.

---

## 7. Xem kết quả kiểm thử tự động

Mở request → tab **Scripts → Post-response** (bản cũ gọi là **Tests**) → bấm **Send** → xem vùng **Test Results**.

Đã cài sẵn test script cho cả 12 request:

- **01** — status 200, `success: true`
- **02** — status 200, `data` là array, có SV001, đủ 4 trường
- **03** — status 200, `data` là object **không phải mảng**, đúng Minh Nhật
- **04** — status 404, `success: false`, message không rỗng
- **05** — status 404, thông báo về đường dẫn
- **06** — status 201, `data.maSV: SV003`
- **07** — dữ liệu khớp body đã gửi
- **08** — status 409, `success: false`, message đúng "đã tồn tại"
- **09** — status 400, message nhắc `hoTen`
- **10** — status 400, message nhắc `Email`
- **11** — status 400, message nhắc `maSV`
- **12** — status 400 **và** Content-Type là `application/json`

### Xem một phép kiểm tra FAIL có chủ đích

Mở request 02 → Scripts → Post-response → đổi `200` thành `201` → Send.

Test status phải **FAIL**, vì API danh sách trả 200 chứ không phải 201. Sửa lại `200` sau khi xem.

> Đừng đổi kỳ vọng đúng thành kết quả sai của chương trình chỉ để có PASS. Khi test thất bại, phải đối chiếu yêu cầu đã chốt để xác định lỗi ở chương trình hay ở phép kiểm tra.

---

## 8. Cấu trúc dự án

```
backend-quan-ly-sinh-vien/
├── src/
│   ├── server.ts                        Khởi tạo Express, gắn middleware/route, mở cổng
│   ├── dtos/
│   │   └── sinhVien.dto.ts              Khai báo 4 trường của sinh viên
│   ├── services/
│   │   └── sinhVien.service.ts          Giữ dữ liệu mẫu, kiểm tra quy tắc, thêm sinh viên
│   ├── controllers/
│   │   └── sinhVien.controller.ts       Nhận request, gọi Service, trả JSON
│   ├── routes/
│   │   └── sinhVien.routes.ts           Ghép method + đường dẫn với Controller
│   ├── middlewares/
│   │   ├── logger.middleware.ts         Ghi method và đường dẫn
│   │   └── error.middleware.ts          Trả lỗi theo quy ước chung
│   └── utils/
│       └── AppError.ts                  Lỗi dự kiến kèm statusCode
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
├── postman-collection.json
├── minh-chung/
│   ├── 01-T05-thanh-cong-201.png        Ca thành công: 201 Created
│   ├── 02-T06-tu-choi-trung-ma-409.png  Bị từ chối: trùng mã, 409 Conflict
│   └── 03-T07-du-lieu-sai-400.png       Bị từ chối: thiếu hoTen, 400 Bad Request
├── BAO-CAO-KET-QUA.md
└── NHAT-KY-PROMPT.md
```

File **tự sinh** (không sửa tay): `pnpm-lock.yaml`, `node_modules/`, `dist/`

### Luồng xử lý một request

```
Trình duyệt / Postman
        ↓
Route         biết đường dẫn này gọi hàm nào
        ↓
Controller     đặt mã trạng thái, dựng JSON
        ↓
Service        kiểm tra quy tắc, lấy/thay đổi dữ liệu
        ↓
Controller trả JSON về người gọi
```

---

## 9. Các API

### GET `/`

Kiểm tra server đã chạy. Trả `200` với lời chào.

### GET `/api/v1/sinh-vien`

Lấy danh sách sinh viên. `data` là **mảng**.

```json
{
  "success": true,
  "message": "Lấy danh sách sinh viên thành công",
  "data": [
    { "maSV": "SV001", "hoTen": "Minh Nhật", "email": "minhnhat@example.com", "maLop": "25CT114" },
    { "maSV": "SV002", "hoTen": "Lan Anh", "email": "lananh@example.com", "maLop": "25CT114" }
  ]
}
```

### GET `/api/v1/sinh-vien/:maSV`

Tìm một sinh viên theo mã. `data` là **một object**, không phải mảng.

- Tìm thấy → `200`, `"Tìm sinh viên thành công"`
- Không có → `404`, `"Không tìm thấy sinh viên"`

### POST `/api/v1/sinh-vien`

Thêm sinh viên mới. Dữ liệu gửi trong body dạng JSON:

```json
{
  "maSV": "SV003",
  "hoTen": "Ngọc Mai",
  "email": "ngocmai@example.com",
  "maLop": "25CT114"
}
```

| Kết quả | Status | Message |
|---|---|---|
| Thành công | `201` | "Thêm sinh viên thành công" |
| Thiếu / sai dữ liệu | `400` | Nêu rõ trường nào sai |
| Mã đã tồn tại | `409` | "Mã sinh viên đã tồn tại" |

**Quy tắc kiểm tra:**

| Điều kiện | Ví dụ hợp lệ |
|---|---|
| Cả 4 trường là chuỗi | `maSV: "SV003"` ✓ — `maSV: 3` ✗ |
| `maSV` đúng dạng SV + 3 số | `SV003` ✓ — `ABC004` ✗ |
| `hoTen`, `maLop` không rỗng sau khi trim | `"Bình An"` ✓ — `"   "` ✗ |
| `email` dạng cơ bản | `a@b.com` ✓ — `khong-phai-email` ✗ |
| `maSV` chưa tồn tại | `SV003` chưa có ✓ |

Chuỗi được cắt khoảng trắng ở hai đầu trước khi kiểm tra và lưu. Kiểm tra diễn ra **trước** khi ghi vào mảng — phản hồi `400`/`409` không bao giờ để lại dữ liệu rác.

### Đường dẫn không tồn tại

Trả `404` với `"Không tìm thấy đường dẫn"`.

> Cùng status `404` nhưng khác nguyên nhân: `/api/v1/sinh-vien/SV999` là đường dẫn **có** chức năng nhưng không có dữ liệu; `/khong-co` là đường dẫn **không có** chức năng. Đọc `message` để phân biệt.

---

## 10. Chạy kiểm thử tự động bằng Node

Không dùng Postman thì chạy script có sẵn:

```bash
# Terminal 1
pnpm dev

# Terminal 2
node test-t01-t11.mjs
```

Script chạy đúng thứ tự T01 → T11 rồi in kết quả từng ca. Hiện tại **16/16 ca đạt**.

Kiểm tra các test script Postman không cần mở app:

```bash
node verify-postman-tests.mjs
```

Script này chạy đúng đoạn `pm.test` trong `postman-collection.json` và in PASS/FAIL. Hiện tại **31/31 PASS**.

> Cả hai script đều cần server đang chạy ở dữ liệu sạch (đúng 2 sinh viên mẫu). Nếu `test-t01-t11.mjs` báo T05 nhận 409 thay vì 201, hãy `Ctrl+C` rồi chạy lại `pnpm dev`.

---

## 11. Xử lý sự cố

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `pnpm` không được nhận diện | Chưa cài, hoặc terminal mở trước khi cài | `pnpm -v`; mở terminal mới |
| `Cannot find module` | Sai đường dẫn import, tên file, hoặc `export`/`import` không khớp | Kiểm tra lại tên file và đuôi `.js` trong import nội bộ |
| `EADDRINUSE` | Cổng đã có server khác chạy | Dừng terminal cũ, hoặc đổi `PORT` **và** `baseUrl` cùng lúc |
| `Could not send request` (Postman) | Server chưa chạy, hoặc sai cổng/giao thức | Kiểm tra terminal có `pnpm dev` không; xem lại `baseUrl` phải có `http://` |
| Biến `baseUrl` báo chưa có giá trị | Request chưa lưu đúng Collection, hoặc biến chưa Save | Kiểm tra lại tab Variables của Collection |
| `req.body` là `undefined` | `express.json()` đặt **sau** route, hoặc Postman chưa chọn raw JSON | Đặt `express.json()` trước route; chọn Body → raw → JSON |
| Request chờ mãi, không trả lời | Middleware không gọi `next()` | Kiểm tra `loggerMiddleware` có `next()` không |
| Log lặp nhiều lần một request | Logger bị gắn trùng | Kiểm tra `app.use(loggerMiddleware)` chỉ xuất hiện một lần |
| POST lần đầu đã nhận 409 | Mã đó đã được thêm từ trước | Restart server để reset dữ liệu trong bộ nhớ |
| Thêm xong rồi không thấy | Watch restart khi lưu file, hoặc POST không ghi vào mảng | Không sửa file giữa chuỗi test; kiểm tra Service có `push` vào mảng không |
| Test FAIL dù status đúng | `body`, kiểu dữ liệu hoặc giá trị không khớp | Đọc tên phép kiểm tra FAIL để biết sai ở đâu |
| `pnpm build` báo chưa tìm thấy đầu vào | Chưa có file `.ts` trong `src` | Tạo `src/server.ts` trước rồi build lại |

---

## 12. Về dữ liệu trong bộ nhớ

Dữ liệu sinh viên nằm trong biến `sinhVienList` trong `src/services/sinhVien.service.ts`.

**Restart server là mất hết** — biến được khai báo lại từ đầu, chỉ còn SV001 và SV002. Đây là hành vi mong muốn của bài, không phải lỗi.

Khi cần lưu lâu dài, thay phần giữ mảng bằng **Repository** (xem `NHAT-KY-PROMPT.md`, phần Bài 9).

---

## 13. File cần nộp

| File | Ghi chú |
|---|---|
| `src/` | Toàn bộ mã nguồn |
| `package.json`, `pnpm-lock.yaml`, `tsconfig.json` | Cấu hình dự án |
| `.env.example`, `.gitignore` | **Không nộp `.env` thật** |
| `postman-collection.json` | 12 request, phủ T01–T11, đã có test script |
| `minh-chung/` | 3 ảnh minh chứng: 1 ca thành công, 2 ca bị từ chối |
| `BAO-CAO-KET-QUA.md` | Bảng kết quả T01–T11 + ảnh minh chứng |
| `NHAT-KY-PROMPT.md` | Nhật ký prompt và phần điều chỉnh |

**Không nộp:** `node_modules/`, `dist/`, `.env`

---

## 14. Câu hỏi tự kiểm tra

Trước khi nộp, trả lời bằng lời của bạn:

1. Route, Controller và Service của chức năng lấy danh sách nằm ở đâu?
2. Vì sao thêm sinh viên phải dùng POST có body?
3. Vì sao nhận 409 có thể là một test **đạt**?
4. Vì sao phải GET lại sau khi POST?
5. Vì sao restart server làm mất sinh viên vừa thêm?
6. Bạn đã thay đổi gì trong yêu cầu gửi AI, và đã chứng minh thay đổi đó hoạt động ra sao?

Câu trả lời tham khảo nằm ở cuối `NHAT-KY-PROMPT.md`.

---

## 15. Tài liệu tham khảo

- Node.js — https://nodejs.org/
- pnpm — https://pnpm.io/installation
- TypeScript — https://www.typescriptlang.org/docs/
- tsx — https://tsx.is/faq
- Postman bắt đầu — https://learning.postman.com/docs/getting-started/quick-start
- Postman test scripts — https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/
