import type { Request, Response, NextFunction } from "express";
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
} from "../services/sinhVien.service.js";

/**
 * Bài 6 - Controller tiếp nhận và phản hồi
 * Bài 8 - Bổ sung tìm theo mã và thêm sinh viên
 *
 * Ba tên thường gặp:
 * - req  : yêu cầu gửi đến (request).
 * - res  : phương tiện tạo câu trả lời (response).
 * - next : chuyển tiếp sang middleware kế tiếp, hoặc chuyển lỗi sang nơi xử lý lỗi.
 *
 * Phân biệt rõ ai làm gì:
 * - Service biết cách lấy dữ liệu và kiểm tra quy tắc nghiệp vụ.
 * - Controller biết cách trả lời HTTP: đặt mã trạng thái và dựng JSON.
 * Khi dữ liệu sai, xem Service. Khi câu trả lời API sai, xem Controller.
 *
 * Controller không tự tạo mảng sinh viên và không tự viết quy tắc kiểm tra, vì
 * như vậy nghiệp vụ sẽ bị lặp ở nhiều nơi.
 */

/**
 * Bài 6 - GET danh sách sinh viên.
 *
 * Luồng: Route gọi hàm này -> gọi Service lấy dữ liệu -> đặt status 200 -> gửi JSON.
 */
export function getDanhSachSinhVien(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // _req có gạch dưới đầu dòng vì hàm này chưa cần đọc tham số từ request.
    const danhSach = layDanhSachSinhVien();

    // Ba trường trong JSON: success theo quy ước ứng dụng, message mô tả kết quả,
    // data chứa dữ liệu thật. 200 là mã trạng thái của phản hồi, không phải
    // một trường bắt buộc phải nằm trong JSON.
    res.status(200).json({
      success: true,
      message: "Lấy danh sách sinh viên thành công",
      data: danhSach,
    });
  } catch (error) {
    // Không tự dựng câu trả lời lỗi ở đây. next(error) chuyển lỗi sang
    // error.middleware, để mọi lỗi trả về theo một quy ước chung.
    next(error);
  }
}

/**
 * Bài 8 - GET một sinh viên theo mã: /api/v1/sinh-vien/SV001
 *
 * :maSV là vị trí thay bằng mã thật. Express đưa giá trị đó vào req.params.maSV.
 */
export function getSinhVienTheoMa(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Với Express 5, req.params có kiểu string | string[] nên cần kiểm tra kiểu cho
    // chắc. Nếu không phải string thì coi như không có mã hợp lệ.
    const maSV = req.params.maSV;
    if (typeof maSV !== "string") {
      res.status(400).json({
        success: false,
        message: "Thiếu mã sinh viên trên đường dẫn",
      });
      return;
    }

    const sinhVien = timSinhVienTheoMa(maSV);

    if (!sinhVien) {
      // 404 ở đây nghĩa là đường dẫn đúng và có chức năng, nhưng không có sinh viên
      // đó. Khác với 404 của middleware đường dẫn không tồn tại.
      res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
      return;
    }

    // data là một object, không phải mảng: đây là điểm khác biệt so với
    // endpoint lấy danh sách.
    res.status(200).json({
      success: true,
      message: "Tìm sinh viên thành công",
      data: sinhVien,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bài 8 - POST thêm sinh viên: /api/v1/sinh-vien
 *
 * Vì sao phải dùng POST có body?
 * Thông tin của một sinh viên gồm bốn trường, quá dài và phức tạp để đặt trên URL,
 * và cần chỗ mở rộng. Ngoài ra GET được hiểu là chỉ đọc, nên hành động tạo dữ liệu
 * mới phải dùng POST.
 */
export function taoSinhVien(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // req.body chỉ có dữ liệu khi express.json() được đặt TRƯỚC route này trong
    // server.ts. Đó là lý do thứ tự middleware quan trọng.
    // Service nhận unknown và tự kiểm tra, vì JSON từ Postman không được
    // TypeScript bảo vệ.
    const sinhVienMoi = themSinhVien(req.body);

    // 201 Created là mã chuẩn cho trường hợp tạo mới thành công, khác 200
    // (đã có sẵn) và 200 vẫn được dùng phổ biến nhưng không nói rõ điều gì xảy ra.
    res.status(201).json({
      success: true,
      message: "Thêm sinh viên thành công",
      data: sinhVienMoi,
    });
  } catch (error) {
    // Service ném AppError với statusCode 400 hoặc 409. error.middleware đọc
    // AppError và trả statusCode tương ứng, nên Controller không cần tự xử lý.
    next(error);
  }
}
