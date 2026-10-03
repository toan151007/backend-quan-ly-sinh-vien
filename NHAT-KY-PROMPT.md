# NHẬT KÝ PROMPT — Bài thực hành Chương 2

Ghi lại các yêu cầu đã gửi cho AI, kết quả nhận về, và phần đã điều chỉnh. Theo yêu cầu bài: **một prompt tạo chức năng, một prompt sửa lỗi nếu có, và phần đã điều chỉnh**.

---

## Prompt 0 — Thiết lập cách AI hỗ trợ

**Gửi:** đầu tiên, một lần duy nhất, để chốt vai trò và ràng buộc.

```
ROLE: Bạn là người hướng dẫn Backend cho sinh viên chưa biết lập trình Backend.
CONTEXT: Tôi xây dựng Backend quản lý sinh viên bằng Node.js, Express 5, TypeScript và
pnpm, trên Windows với VS Code. Cấu hình dùng ESM, NodeNext và tsx để chạy lúc phát triển.
TASK: Hỗ trợ tôi từng bước theo nhiệm vụ tôi gửi. Bây giờ chỉ xác nhận cách làm, chưa tạo code.
CONSTRAINT: Dữ liệu SinhVien gồm maSV, hoTen, email, maLop, đều là chuỗi. Cổng 5000.
Chưa dùng database, giao diện, JWT hay Docker. Không tự thêm chức năng. Import nội bộ dùng
đuôi .js theo cấu hình ESM này.
OUTPUT: Mỗi lần hãy giải thích ngắn vì sao cần làm, liệt kê file tạo/sửa, trả đầy đủ nội
dung file cần thay đổi, có chú thích tiếng Việt ở phần quan trọng. Lệnh terminal trình bày
riêng. Không dùng dấu ba chấm thay code.
CHECK: Luôn hướng dẫn cách chạy, kết quả mong đợi và một câu hỏi giúp tôi hiểu phần vừa làm.
Nếu thiếu thông tin dự án, hỏi hoặc yêu cầu tôi cung cấp file liên quan trước khi sửa.
```

**Kết quả:** chốt được ranh giới 6 thành phần prompt (ROLE/CONTEXT/TASK/CONSTRAINT/OUTPUT/CHECK) và quy tắc import đuôi `.js` — vốn là điểm dễ sai nhất của cấu hình NodeNext.

---

## Prompt 2 — Khởi tạo chương trình chạy được (Bài 3)

```
CONTEXT: Tôi đã tạo dự án và cài thư viện theo bài. Đây là package.json và tsconfig.json hiện tại.
TASK: Hướng dẫn tạo server Express tối thiểu, chạy ở cổng 5000.
CONSTRAINT:
- Giữ dependencies đã cài. package.json dùng type=module.
- scripts: dev="tsx watch src/server.ts", build="tsc", start="node dist/server.js".
- src/server.ts dùng import 'dotenv/config', Express, cors, helmet, express.json(). Đọc PORT
  từ .env, mặc định 5000. Chỉ tạo GET / trả HTTP 200 và JSON
  {success:true,message:"Backend quản lý sinh viên đang hoạt động"}.
- Chưa import route sinh viên vì các file đó chưa có.
OUTPUT: Giải thích từng file dùng để làm gì, trả nội dung đầy đủ của các file tạo/sửa.
```

**Kết quả:** tạo được `src/server.ts`, `pnpm build` không lỗi, `GET /` trả đúng JSON. Mốc đối chiếu 1 đạt.

---

## Prompt 4 → 9 — Các chức năng (Bài 5 → 8)

Các prompt tạo Service, Controller, Route, Middleware, AppError đều được gửi theo khuôn
ROLE/CONTEXT/TASK/CONSTRAINT/OUTPUT, với CONSTRAINT chặt tên hàm và tên trường:

- `layDanhSachSinhVien`, `timSinhVienTheoMa`, `themSinhVien`
- `getDanhSachSinhVien`, `getSinhVienTheoMa`, `taoSinhVien`
- `loggerMiddleware`, `errorMiddleware`, `AppError`

**Ràng buộc quan trọng được nêu rõ trong từng prompt:**
- Service không import Express, không nhận req/res, không tạo HTTP response.
- Import nội bộ có đuôi `.js`.
- Error middleware đủ 4 tham số và đứng cuối cùng.
- Validate **trước**, rồi mới kiểm tra trùng, rồi mới ghi vào mảng.
- Không thêm đăng nhập, database, Docker, JWT.

**Kết quả:** `pnpm build` sạch, đủ 8 file trong `src`, GET danh sách, GET theo mã, POST thêm mới đều hoạt động. Mốc đối chiếu 2 và 3 đạt.

---

## Prompt 10 — Phân tích hướng Clean Architecture (Bài 9)

```
Đây là Service và DTO hiện tại của tôi. Tôi muốn hiểu cách tiến tới Clean Architecture,
chưa muốn sửa code. Hãy chỉ ra đoạn nào là quy tắc nghiệp vụ, đoạn nào là truy xuất dữ liệu.
Dùng đúng chức năng thêm sinh viên để giải thích Entity, Use Case, Interface và Repository
cho người mới.
```

**Kết quả:** nhận ra Service hiện vừa xử lý nghiệp vụ vừa giữ mảng `sinhVienList`. Đề xuất tách sang `MemorySinhVienRepository` với interface mô tả `list/find/create`. **Chưa refactor** vì bài yêu cầu kiểm thử xong bằng Postman trước.

---

## Prompt 11 — Test Postman cho ca trùng mã (Bài 10)

```
ROLE: Hướng dẫn tôi viết test Postman cho người mới.
CONTEXT: Backend quản lý sinh viên lưu mảng trong bộ nhớ. Tôi đã thêm SV003 thành công.
Đang dùng request POST /api/v1/sinh-vien để gửi lại cùng mã, server chưa restart.
EXPECTED: Phải trả status 409, success=false và message là chuỗi không rỗng. Không được thêm
sinh viên trùng vào danh sách.
ACTUAL: [dán response thực tế]
TASK: Trước tiên đối chiếu kết quả thực tế với yêu cầu; nếu sai thì chỉ ra, không thay kỳ
vọng cho khớp lỗi.
OUTPUT: Giải thích từng test, nơi dán và cách xem Test Results.
```

**Kết quả:** script kiểm tra status 409, `success=false`, message không rỗng và đúng nội dung. Đồng thời bổ sung request GET để xác nhận SV003 chỉ xuất hiện một lần — vì script chỉ đọc response POST chưa đủ chứng minh dữ liệu không bị thêm trùng.

---

## Vấn đề gặp phải và cách sửa

### 1. `pnpm` chưa có trên máy
- **Hiện tượng:** lệnh `pnpm` không được nhận diện.
- **Nguyên nhân:** máy mới chỉ có npm, chưa cài pnpm.
- **Sửa:** `npm install -g pnpm@10` → có pnpm 10.34.6.

### 2. `esbuild` bị pnpm chặn build script
- **Hiện tượng:** cảnh báo `Ignored build scripts: esbuild@0.28.2` ngay sau khi cài `tsx`.
- **Nguyên nhân:** pnpm 10 mặc định không chạy postinstall script của dependency cho đến khi được duyệt. Không có binary esbuild thì `tsx` không chạy được.
- **Sửa:** thêm `"pnpm": { "onlyBuiltDependencies": ["esbuild"] }` vào `package.json` rồi `pnpm install`.
- **Cách kiểm tra:** log phải hiện `esbuild postinstall: Done`.

### 3. Bản build cũ dùng lại
- **Hiện tượng:** sửa code trong `src` nhưng kết quả không đổi.
- **Nguyên nhân:** chạy `node dist/server.js` trong khi `dist` còn bản cũ.
- **Sửa:** luôn chạy `pnpm build` sau khi sửa `src`, hoặc dùng `pnpm dev` (chạy trực tiếp file `.ts`).

---

## Phần đã điều chỉnh

| Điều chỉnh | Vì sao | Đã chứng minh bằng |
|---|---|---|
| Thêm `onlyBuiltDependencies` cho esbuild | pnpm 10 chặn postinstall, `tsx` không chạy được | `pnpm dev` khởi động thành công |
| Tách `AppError` khỏi Express | Service ném lỗi nghiệp vụ nhưng không được phụ thuộc tầng HTTP | T06 trả 409, T07–T10 trả 400 đúng `statusCode` |
| Thêm nhánh `entity.parse.failed` trong error middleware | `express.json()` ném lỗi trước khi controller chạy, không qua được AppError | T10 trả 400 JSON thay vì trang HTML |
| Kiểm `typeof maSV !== "string"` thay vì ép kiểu | `maSV: 4` không được coi là `"SV004"`; số 0 ở đầu mã sẽ bị mất | T09 trả 400, danh sách không tăng |
| Kiểm trùng mã **sau** validation | Phản hồi 400/409 không được để lại dữ liệu rác trong mảng | T07b: GET `/SV004` trả 404 sau khi POST thiếu tên |
| Thêm nhánh 404 trong `server.ts` | Phân biệt "không có sinh viên" với "không có đường dẫn" | T04 và T11 cùng 404 nhưng message khác nhau |
| Dùng `unknown` cho `req.body` trong Service | JSON từ Postman không được TypeScript bảo vệ | T08, T09 trả 400 với thông báo đúng nguyên nhân |

---

## Tự giải thích trước khi nộp

**1. Route, Controller và Service của chức năng lấy danh sách nằm ở đâu?**

- Route: `src/routes/sinhVien.routes.ts` — dòng `router.get("/", getDanhSachSinhVien)`, nối `GET /api/v1/sinh-vien` với hàm xử lý.
- Controller: `src/controllers/sinhVien.controller.ts` — hàm `getDanhSachSinhVien` đặt status 200 rồi gửi JSON.
- Service: `src/services/sinhVien.service.ts` — hàm `layDanhSachSinhVien` trả về mảng `sinhVienList`.

Luồng: `Trình duyệt/Postman → Route → Controller → Service → dữ liệu về Controller → JSON`.

**2. Vì sao thêm sinh viên phải dùng POST có body?**

Thông tin sinh viên gồm bốn trường, quá dài và phức tạp để đặt trên URL, và cần chỗ mở rộng. GET được hiểu là chỉ đọc, không tạo dữ liệu mới. Nên hành động tạo mới phải dùng POST, với dữ liệu đặt trong body dạng JSON.

**3. Vì sao nhận 409 có thể là một test đạt?**

Kỳ vọng đã chốt trước là "gửi mã đã tồn tại sẽ nhận 409". Nếu nhận đúng 409 thì chương trình đã làm đúng. Test đạt nghĩa là kết quả khớp kỳ vọng, không phải luôn nhận 200. Nếu lần thứ hai vẫn nhận 201 thì chương trình chưa kiểm tra trùng và ca đó mới thất bại.

**4. Vì sao phải GET lại sau khi POST?**

Status 201 chỉ chứng minh server trả lời thành công, chưa chứng minh dữ liệu thực sự được ghi vào hệ thống. Gọi GET lại là cách độc lập xác nhận dữ liệu tồn tại và đúng giá trị. Sau các ca bị từ chối cũng phải GET lại để chứng minh danh sách không bị thay đổi.

**5. Vì sao restart server làm mất sinh viên vừa thêm?**

Dữ liệu nằm trong biến `sinhVienList` trong bộ nhớ của tiến trình. Khi khởi động lại server, tiến trình mới được tạo, biến này được khai báo lại từ đầu nên chỉ còn SV001 và SV002. Muốn dữ liệu tồn tại lâu dài phải lưu ra database.

**6. Bạn đã thay đổi gì trong yêu cầu gửi AI, và chứng minh thay đổi đó hoạt động ra sao?**

Xem bảng "Phần đã điều chỉnh" ở trên. Mỗi dòng đều có cột chứng minh tương ứng một ca kiểm thử cụ thể. Rõ nhất là: thêm nhánh `entity.parse.failed` vào error middleware để bắt lỗi JSON hỏng — chứng minh bằng T10, nơi POST với `{"maSV":"SV004"` hở ngoặc trả 400 dạng JSON thay vì trang HTML lỗi mặc định của Express.
