import { Router } from "express";
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
} from "../controllers/sinhVien.controller.js";

/**
 * Bài 6 - Route nối đường dẫn với Controller
 * Bài 8 - Bổ sung tìm theo mã và thêm sinh viên
 *
 * Route trả lời câu hỏi: yêu cầu ở đường dẫn nào, dùng phương thức nào, sẽ được
 * chuyển đến hàm xử lý nào.
 *
 * Trong file này các đường dẫn viết từ "/". server.ts gắn thêm tiền tố
 * /api/v1/sinh-vien, nên đường dẫn đầy đủ là /api/v1/sinh-vien/...
 * Cách tách này giúp một nhóm chức năng nằm chung một tiền tố.
 */
const router = Router();

// Lấy tất cả: GET /api/v1/sinh-vien
router.get("/", getDanhSachSinhVien);

// Tìm một sinh viên theo mã: GET /api/v1/sinh-vien/SV001
// Phải khai báo sau GET "/", nếu không thì "/SV001" sẽ bị coi như danh sách.
// :maSV là tham số động, giá trị thật lấy từ URL.
router.get("/:maSV", getSinhVienTheoMa);

// Tạo mới: POST /api/v1/sinh-vien
// Dữ liệu sinh viên nằm trong body dạng JSON.
router.post("/", taoSinhVien);

export default router;
