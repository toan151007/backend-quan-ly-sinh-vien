/**
 * Bài 8 - Biểu diễn lỗi dự kiến cùng statusCode.
 *
 * Vì sao cần class riêng?
 * Chương trình có hai loại lỗi:
 * - Lỗi dự kiến: chúng ta biết trước và muốn trả về cho người gọi, ví dụ "mã đã
 *   tồn tại" (409) hay "thiếu họ tên" (400). Đây không phải sự cố kỹ thuật.
 * - Lỗi không lường trước: ví dụ server ngã, hết bộ nhớ. Khi đó không nên lộ chi tiết
 *   kỹ thuật ra ngoài.
 *
 * AppError đánh dấu loại thứ nhất bằng statusCode. error.middleware sẽ nhận biết
 * AppError và trả statusCode kèm message; còn lại thì trả 500 với thông báo chung.
 *
 * Vì sao không phụ thuộc Express?
 * Service ném AppError, nhưng Service không biết HTTP là gì. Nếu AppError kéo theo
 * Express thì Service lại dính vào tầng HTTP. Giữ class này độc lập giúp Service
 * và tầng HTTP tương tác qua statusCode mà không cần biết nhau.
 */
export class AppError extends Error {
  /** Mã trạng thái HTTP cần trả về, ví dụ 400, 404, 409. */
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    // Gọi super(message) để kế thừa hành vi của Error và có đúng thông điệp.
    super(message);

    this.statusCode = statusCode;
    this.name = "AppError";

    // Cần cho đích Object.setPrototypeOf khi class được biên dịch sang ES5 trở về trước,
    // để instanceof hoạt động đúng. Ở target ES2022 thì đã mặc định đúng, nhưng giữ lại
    // cho an toàn khi cấu hình thay đổi.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
