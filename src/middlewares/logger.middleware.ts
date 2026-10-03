import type { Request, Response, NextFunction } from "express";

/**
 * Bài 7 - Middleware ghi nhận request
 *
 * Middleware là hàm được chạy giữa lúc yêu cầu đến và lúc route xử lý nó.
 * Việc lặp lại với mọi yêu cầu, như ghi log, được đặt ở đây một lần thay vì
 * lặp trong từng controller.
 *
 * Điểm dễ sai: nếu quên gọi next(), yêu cầu sẽ treo mãi không có phản hồi.
 */
export function loggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // Chỉ ghi method và đường dẫn, không ghi body vì body có thể chứa dữ liệu nhạy cảm.
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Bắt buộc: chuyển yêu cầu sang bước kế tiếp.
  next();
}
