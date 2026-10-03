import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import sinhVienRouter from "./routes/sinhVien.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

/**
 * Bài 3 - Khởi tạo chương trình chạy được
 * Bài 6 - Gắn route sinh viên
 * Bài 7 - Gắn middleware ghi log và xử lý lỗi
 *
 * Server là chương trình chờ nhận yêu cầu HTTP. Nếu server không chạy, trình duyệt
 * hay Postman không có chương trình nào để gọi.
 */

/**
 * Đọc cổng từ .env, mặc định 5000 nếu biến không có.
 * import "dotenv/config" ở dòng trên phải nằm trước để .env được nạp trước khi
 * đọc process.env.
 */
const PORT = Number(process.env.PORT ?? 5000);

const app = express();

/**
 * THỨ TỰ ĐĂNG KÝ MIDDLEWARE RẤT QUAN TRỌNG.
 * Express chạy theo thứ tự khai báo, từ trên xuống. Sai thứ tự sẽ ra kết quả sai.
 *
 * 1. loggerMiddleware: đặt đầu tiên để ghi lại mọi yêu cầu, kể cả những yêu cầu
 *    không tồn tại và không có route nào xử lý.
 * 2. helmet: thiết lập các HTTP header bảo mật.
 * 3. cors: cho phép gọi API từ giao diện web khác nguồn.
 *    Lưu ý: Postman không thực thi cơ chế CORS như trình duyệt.
 * 4. express.json(): đọc và chuyển body JSON thành req.body.
 *    PHẢI đặt TRƯỚC các route, nếu không req.body sẽ là undefined.
 * 5. GET "/" và route sinh viên.
 * 6. Middleware 404 cho đường dẫn không có.
 * 7. errorMiddleware: CUỐI CÙNG, để bắt được lỗi phát sinh ở mọi tầng trên.
 */
app.use(loggerMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());

// Địa chỉ kiểm tra đơn giản, tạo ở Bài 3 để xác nhận server đã chạy.
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Backend quản lý sinh viên đang hoạt động",
  });
});

// Tiền tố /api/v1/sinh-vien cộng với đường dẫn trong file route ("/" và "/:maSV").
app.use("/api/v1/sinh-vien", sinhVienRouter);

// 404 cho đường dẫn không tồn tại.
// Khác với 404 của endpoint /:maSV: đây là đường dẫn không có chức năng nào đáp ứng,
// chứ không phải đường dẫn đúng nhưng không có dữ liệu.
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Không tìm thấy đường dẫn",
  });
});

// Phải đứng cuối cùng. Express yêu cầu middleware lỗi có đủ 4 tham số.
app.use(errorMiddleware);

/**
 * Mở cổng. Chỉ sau khi gọi listen thì chương trình mới thực sự chờ yêu cầu.
 * Terminal sẽ không quay lại dấu nhắc nhập lệnh: đó là bình thường, vì server đang
 * chạy liên tục.
 */
app.listen(PORT, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
});
