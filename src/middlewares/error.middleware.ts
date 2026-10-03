import type { Request, Response, NextFunction } from "express";
import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

/**
 * Bài 7 - Middleware xử lý lỗi
 * Bài 8 - Bổ sung nhận biết AppError
 *
 * Express nhận biết middleware xử lý lỗi nhờ số tham số: phải có ĐỦ BỐN tham số
 * (error, req, res, next). Thiếu một tham số thì Express coi đây là middleware
 * thường và sẽ không bắt lỗi giúp.
 *
 * Chỉ dùng AppError ở đây để phân biệt hai loại lỗi:
 * - AppError: lỗi dự kiến, trả statusCode và message do Service nêu.
 * - Lỗi khác: không lường trước, trả 500 với thông báo chung và chỉ ghi chi tiết ở
 *   terminal của server, không lộ ra ngoài.
 */

/** Nội dung của một lỗi JSON do express.json() tạo ra khi body sai cú pháp. */
interface CoTheLaLoiJson {
  type?: string;
  status?: number;
  message?: string;
}

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Trường hợp 1: lỗi dự kiến do Service ném ra.
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Trường hợp 2: body JSON sai cú pháp, ví dụ {"maSV":"SV004" thiếu dấu }.
  // express.json() ném lỗi trước khi controller kịp chạy, nên Service không có
  // cơ hội xử lý. Đây là lỗi của người gửi nên trả 400, không phải 500.
  const coTheLaLoiJson = error as CoTheLaLoiJson;
  if (
    coTheLaLoiJson &&
    coTheLaLoiJson.type === "entity.parse.failed" &&
    typeof coTheLaLoiJson.status === "number"
  ) {
    res.status(400).json({
      success: false,
      message: "Body không phải JSON hợp lệ, kiểm tra lại cú pháp (thiếu dấu nháy hoặc dấu ngoặc)",
    });
    return;
  }

  // Trường hợp 3: body vượt quá giới hạn kích thước mà express.json() cho phép.
  if (coTheLaLoiJson && coTheLaLoiJson.type === "entity.too.large") {
    res.status(400).json({
      success: false,
      message: "Body quá lớn so với giới hạn cho phép",
    });
    return;
  }

  // Trường hợp 4: lỗi không lường trước. Chi tiết chỉ ghi ở terminal của server,
  // người gọi chỉ nhận thông báo chung để không lộ thông tin kỹ thuật.
  console.error("Lỗi không lường trước:", error);

  res.status(500).json({
    success: false,
    message: "Lỗi hệ thống",
  });
};
