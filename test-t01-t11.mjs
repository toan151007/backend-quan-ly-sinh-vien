// Kiểm thử T01-T11 đúng theo bảng kết quả trong tài liệu bài tập Chương 2.
// Chạy với: node test-t01-t11.mjs   (server phải đang chạy ở http://localhost:5000)

const BASE = "http://localhost:5000";
const results = [];

async function call(id, desc, method, url, body, note = "") {
  const opt = { method, headers: {} };
  if (body !== undefined) {
    opt.headers["Content-Type"] = "application/json";
    opt.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  let status = null, payload = null, raw = "";
  try {
    const r = await fetch(BASE + url, opt);
    status = r.status;
    raw = await r.text();
    try { payload = JSON.parse(raw); } catch { payload = null; }
  } catch (e) {
    results.push({ id, desc, expected: note, actual: "Không kết nối được: " + e.message, ok: false });
    return null;
  }
  const ok = note ? note.split(";").every((exp) => {
    const [k, v] = exp.split("=").map((s) => s.trim());
    if (k === "status") return String(status) === v;
    if (k === "success") return payload?.success === (v === "true");
    if (k === "message") return String(payload?.message ?? "").toLowerCase().includes(v.toLowerCase());
    if (k === "array") return Array.isArray(payload?.data);
    if (k === "maSV") return payload?.data?.maSV === v || (Array.isArray(payload?.data) && payload.data.some((s) => s.maSV === v));
    if (k === "object") return payload?.data !== null && typeof payload?.data === "object" && !Array.isArray(payload?.data);
    if (k === "hoTen") return payload?.data?.hoTen === v;
    if (k === "count") return Array.isArray(payload?.data) && payload.data.length === Number(v);
    return false;
  }) : false;

  results.push({ id, desc, method, url, body: body !== undefined ? body : null, expected: note, status, actual: raw.slice(0, 160), ok });
  return { status, payload };
}

const sv003 = { maSV: "SV003", hoTen: "Ngọc Mai", email: "ngocmai@example.com", maLop: "25CT114" };
const sv004 = { maSV: "SV004", hoTen: "Bình An", email: "binhan@example.com", maLop: "25CT114" };

console.log("=== KIỂM THỬ T01 - T11 ===\n");

// T01
await call("T01", "GET /", "GET", "/", undefined, "status=200; success=true; message=hoạt động");
// T02
await call("T02", "GET danh sách (seed mới)", "GET", "/api/v1/sinh-vien", undefined, "status=200; success=true; array=true; maSV=SV001; count=2");
// T03
// data phải là MỘT object (không phải mảng) và đúng là Minh Nhật.
await call("T03", "GET SV001", "GET", "/api/v1/sinh-vien/SV001", undefined, "status=200; success=true; object=true; maSV=SV001; hoTen=Minh Nhật");
// T04
await call("T04", "GET SV999", "GET", "/api/v1/sinh-vien/SV999", undefined, "status=404; success=false; message=Không tìm thấy sinh viên");
// T05
await call("T05", "POST SV003 lần đầu", "POST", "/api/v1/sinh-vien", sv003, "status=201; success=true; maSV=SV003; message=thêm sinh viên thành công");
// T06 - ngay sau T05, chưa restart
await call("T06", "POST lại SV003, chưa restart", "POST", "/api/v1/sinh-vien", sv003, "status=409; success=false; message=đã tồn tại");
await call("T06b", "GET danh sách sau T06 (xác nhận không trùng)", "GET", "/api/v1/sinh-vien", undefined, "status=200; maSV=SV003; count=3");
// T07 - thiếu họ tên
const { hoTen: _h, ...thieuTen } = sv004;
await call("T07", "POST thiếu họ tên, mã mới", "POST", "/api/v1/sinh-vien", thieuTen, "status=400; success=false");
await call("T07b", "GET SV004 sau T07 (phải 404)", "GET", "/api/v1/sinh-vien/SV004", undefined, "status=404");
// T08 - email sai
await call("T08", "POST email sai, mã mới", "POST", "/api/v1/sinh-vien", { ...sv004, email: "khong-phai-email" }, "status=400; success=false");
// T09 - mã kiểu number
await call("T09", "POST mã kiểu number", "POST", "/api/v1/sinh-vien", { ...sv004, maSV: 4 }, "status=400; success=false");
// T10 - JSON hỏng
await call("T10", "POST JSON hỏng", "POST", "/api/v1/sinh-vien", '{"maSV":"SV004"', "status=400; success=false");
// T11
await call("T11", "GET đường dẫn không có", "GET", "/khong-co", undefined, "status=404; success=false; message=Không tìm thấy đường dẫn");

// Ca bổ sung theo bảng trang 28
console.log("\n--- Ca bổ sung (bảng trang 28) ---");
await call("X1", "Sai dạng mã ABC004", "POST", "/api/v1/sinh-vien", { ...sv004, maSV: "ABC004" }, "status=400; success=false");
await call("X2", "Tên chỉ có khoảng trắng", "POST", "/api/v1/sinh-vien", { ...sv004, hoTen: "   " }, "status=400; success=false");
const { maLop: _m, ...thieuLop } = sv004;
await call("X3", "Thiếu mã lớp", "POST", "/api/v1/sinh-vien", thieuLop, "status=400; success=false");

console.log("\n=== KẾT QUẢ ===");
let pass = 0;
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.id.padEnd(5)} ${String(r.desc).padEnd(42)} ${r.expected}`);
  console.log(`           status=${r.status ?? "-"} actual=${r.actual}`);
  if (r.ok) pass++;
}
console.log(`\nTổng: ${pass}/${results.length} đạt`);
