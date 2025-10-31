import api from "./api";

// 🟢 Lấy tất cả report (admin)
export const getAllReports = async () => {
  const res = await api.get("/reports/all");
  return res.data;
};

// 🟢 Tạo report (user)
export const createReport = async (data) => {
  const res = await api.post("/reports/create", data);
  return res.data;
};

// 🟢 Admin duyệt report
export const approveReport = async (reportId, adminNote = "") => {
  const res = await api.patch(`/reports/accept`, { id: reportId, adminNote });
  return res.data;
};

// 🟠 Admin từ chối report
export const rejectReport = async (reportId, adminNote = "") => {
  const res = await api.patch(`/reports/reject/${reportId}`, { adminNote });
  return res.data;
};
