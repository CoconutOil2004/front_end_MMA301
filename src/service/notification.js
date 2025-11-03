// services/notification.js
import api from "./api";

// 📬 2. Lấy thông báo của user hiện tại
export const getNotificationsByUser = async (userId) => {
  const res = await api.get(`/notifications/${userId}`);
  return res.data;
};

// ✅ 3. Đánh dấu đã đọc
export const markAsRead = async (notificationId) => {
  const res = await api.post(`/notifications/marked/${notificationId}`);
  return res.data;
};

// 🗑 4. Xóa thông báo
export const deleteNotification = async (notificationId) => {
  const res = await api.delete(`/notifications/${notificationId}`);
  return res.data;
};
