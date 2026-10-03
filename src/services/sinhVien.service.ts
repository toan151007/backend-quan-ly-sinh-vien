import type { ISinhVienDTO } from "../dtos/sinhVien.dto.js";
import { AppError } from "../utils/AppError.js";

/**
 * Bài 5 - Xây dựng Service lấy danh sách
 * Bài 8 - Bổ sung tìm sinh viên theo mã và thêm sinh viên
 *
 * Service thực hiện công việc của chức năng: cung cấp dữ liệu, kiểm tra quy tắc
 * nghiệp vụ và thay đổi dữ liệu. Controller sẽ gọi Service rồi mới tạo câu trả lời HTTP.
 *
 * Vì sao Service không import Express?
 * Service không biết về HTTP, không nhận req/res và không tạo response. Nhờ vậy sau
 * này đổi cách gọi, Service không phải sửa. Service chỉ nhận dữ liệu và trả về
 * dữ liệu, hoặc ném lỗi nghiệp vụ.
 */

/**
 * Dữ liệu mẫu nằm trong bộ nhớ, nên trở về ban đầu mỗi khi server khởi động lại.
 * Dữ liệu này thuộc về Service. Trong dự án thực tế, đây là chỗ sẽ được thay bằng
 * Repository (xem Bài 9 về hướng Clean Architecture).
 */
const sinhVienList: ISinhVienDTO[] = [
  {
    maSV: "SV001",
    hoTen: "Minh Nhật",
    email: "minhnhat@example.com",
    maLop: "25CT114",
  },
  {
    maSV: "SV002",
    hoTen: "Lan Anh",
    email: "lananh@example.com",
    maLop: "25CT114",
  },
];

/**
 * Mã sinh viên phải đúng dạng chữ SV + 3 chữ số.
 * SV003 hợp lệ; ABC004 sai dạng; số 4 không phải chuỗi nên sai cả kiểu dữ liệu.
 */
const MA_SV_REGEX = /^SV[0-9]{3}$/;

/**
 * Kiểm tra email ở mức cơ bản: có dạng tên@miền.phần đuôi và không chứa khoảng trắng.
 * Bài này không kiểm tra hộp thư có thật hay không.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Bài 5 - Lấy danh sách sinh viên.
 *
 * Ai gọi hàm này? Controller getDanhSachSinhVien, sau đó Controller đặt danh sách
 * này vào trường data của câu trả lời JSON.
 */
export function layDanhSachSinhVien(): ISinhVienDTO[] {
  return sinhVienList;
}

/**
 * Bài 8 - Tìm một sinh viên theo mã.
 *
 * @param maSV mã lấy từ phần :maSV của URL, ví dụ "SV001".
 * @returns sinh viên tìm thấy, hoặc undefined nếu không có mã này.
 *
 * Controller sẽ đổi undefined thành phản hồi 404, vì Service không tự tạo HTTP response.
 * Lưu ý: trả về undefined chứ không ném lỗi, vì "không có dữ liệu" là kết quả bình
 * thường của một yêu cầu tìm kiếm, không phải sự cố kỹ thuật.
 */
export function timSinhVienTheoMa(maSV: string): ISinhVienDTO | undefined {
  return sinhVienList.find((sinhVien) => sinhVien.maSV === maSV);
}

/**
 * Bài 8 - Thêm một sinh viên mới.
 *
 * @param input dữ liệu thô lấy từ req.body. Kiểu là unknown vì JSON gửi từ Postman
 *             chưa được TypeScript kiểm tra; mọi thứ phải tự kiểm tra lúc chạy.
 * @returns sinh viên vừa được thêm.
 * @throws {AppError} 400 nếu dữ liệu sai quy tắc, 409 nếu mã sinh viên đã tồn tại.
 *
 * Thứ tự kiểm tra có ý nghĩa:
 * 1. Kiểm tra hình dạng dữ liệu và từng quy tắc -> 400.
 * 2. Chỉ khi dữ liệu hợp lệ mới kiểm tra mã trùng -> 409.
 * 3. Chỉ khi mọi thứ ổn mới ghi vào mảng.
 * Nhờ vậy một phản hồi 400 hoặc 409 không bao giờ để lại dữ liệu rác trong mảng.
 */
export function themSinhVien(input: unknown): ISinhVienDTO {
  // Bước 1: dữ liệu phải là một object, không phải null, không phải mảng.
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new AppError(400, "Dữ liệu sinh viên phải là một đối tượng JSON hợp lệ");
  }

  // Bước 2: đọc từng trường như unknown, vì chưa biết chúng có đúng kiểu string không.
  const duLieu = input as Record<string, unknown>;
  const maSVRaw = duLieu.maSV;
  const hoTenRaw = duLieu.hoTen;
  const emailRaw = duLieu.email;
  const maLopRaw = duLieu.maLop;

  // Thiếu trường hoặc không phải string: không có chuyển kiểu tự động,
  // vì maSV: 4 không được coi là "SV004" và số 0 ở đầu mã cũng sẽ mất.
  const thieu = (ten: string, giaTri: unknown): void => {
    if (giaTri === undefined || giaTri === null || giaTri === "") {
      throw new AppError(400, `Thiếu trường bắt buộc: ${ten}`);
    }
    if (typeof giaTri !== "string") {
      throw new AppError(400, `Trường ${ten} phải là chuỗi (string)`);
    }
  };

  thieu("maSV", maSVRaw);
  thieu("hoTen", hoTenRaw);
  thieu("email", emailRaw);
  thieu("maLop", maLopRaw);

  // Bước 3: cắt khoảng trắng thừa ở hai đầu trước khi kiểm tra và lưu.
  const maSV = (maSVRaw as string).trim();
  const hoTen = (hoTenRaw as string).trim();
  const email = (emailRaw as string).trim();
  const maLop = (maLopRaw as string).trim();

  if (!MA_SV_REGEX.test(maSV)) {
    throw new AppError(400, "Mã sinh viên phải đúng định dạng SV + 3 chữ số, ví dụ SV003");
  }
  if (hoTen.length === 0) {
    throw new AppError(400, "Họ tên không được để trống hoặc chỉ chứa khoảng trắng");
  }
  if (maLop.length === 0) {
    throw new AppError(400, "Mã lớp không được để trống hoặc chỉ chứa khoảng trắng");
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(400, "Email không hợp lệ, cần có dạng tên@miền.phầnđuôi");
  }

  // Bước 4: dữ liệu đã hợp lệ, mới kiểm tra trùng mã.
  if (sinhVienList.some((sinhVien) => sinhVien.maSV === maSV)) {
    throw new AppError(409, "Mã sinh viên đã tồn tại");
  }

  // Bước 5: chỉ lưu đúng bốn trường DTO, bỏ mọi trường thừa trong body.
  const sinhVienMoi: ISinhVienDTO = { maSV, hoTen, email, maLop };
  sinhVienList.push(sinhVienMoi);

  return sinhVienMoi;
}
