/**
 * Bài 4 - Thiết kế dữ liệu sinh viên
 *
 * DTO (Data Transfer Object) mô tả cấu trúc dữ liệu được trao đổi giữa các phần
 * của chương trình. File này KHÔNG tạo database và KHÔNG lưu danh sách sinh viên,
 * nó chỉ khai báo một sinh viên gồm bốn trường, tất cả đều là chuỗi (string).
 *
 * Vì sao cần interface?
 * - Mọi tên trường (maSV, hoTen, email, maLop) được khai báo đúng một chỗ, nên các
 *   Service, Controller cùng hiểu một kiểu dữ liệu.
 * - Lỡ một file dùng "name" còn file khác dùng "hoTen", TypeScript sẽ báo lỗi ngay
 *   lúc kiểm tra code, thay vì để chương trình chạy sai lúc chạy.
 *
 * Lưu ý: khai báo interface KHÔNG tự kiểm tra JSON người dùng gửi vào.
 * Kiểu dữ liệu chỉ được bảo vệ khi dữ liệu được đưa vào đúng kiểu đó từ trong code.
 * JSON gửi từ Postman là kiểu unknown, nên chức năng thêm sinh viên (Bài 8) phải
 * kiểm tra thủ công trong Service.
 */
export interface ISinhVienDTO {
  /** Mã sinh viên, ví dụ "SV001". Dùng string vì có chữ và có thể có số 0 ở đầu. */
  maSV: string;

  /** Họ và tên, ví dụ "Minh Nhật". */
  hoTen: string;

  /** Email liên hệ, ví dụ "minhnhat@example.com". */
  email: string;

  /** Mã lớp, ví dụ "25CT114". */
  maLop: string;
}
