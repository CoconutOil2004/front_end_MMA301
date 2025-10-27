// services/index.js
import api from "./api";

// ---- REGISTER ----
export const registerUser = async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

// ---- LOGIN ----
export const loginUser = async (data) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

// ---- GET PROFILE ----
export const getProfile = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};

// ---- FORGOT PASSWORD ----
export const forgotPassword = async (data) => {
  const res = await api.post("/users/forgot-password", data);
  return res.data;
};
// =========================
// 💬 CHAT SYSTEM (Conversation + Message)
// =========================

// ---- Tạo hoặc lấy lại hội thoại giữa 2 người ----
export const createOrGetConversation = async (senderId, receiverId) => {
  const res = await api.post("/conversations", { senderId, receiverId });
  return res.data;
};

// ---- Lấy danh sách hội thoại của 1 user ----
export const getConversations = async (userId) => {
  try {
    const res = await api.get(`/conversations/${userId}`);
    console.log("✅ [Frontend] Data:", res.data);
    return res.data;
  } catch (error) {
    console.log(
      "❌ [Frontend] API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ---- Xóa hội thoại ----
export const deleteConversation = async (conversationId) => {
  const res = await api.delete(`/conversations/${conversationId}`);
  return res.data;
};

// ---- Lấy tất cả tin nhắn trong 1 cuộc hội thoại ----
export const getMessages = async (conversationId) => {
  const res = await api.get(`/messages/${conversationId}`);
  return res.data;
};

// ---- Gửi tin nhắn mới ----
export const sendMessage = async (conversationId, senderId, text) => {
  const res = await api.post("/messages", { conversationId, senderId, text });
  return res.data;
};

// ---- Đánh dấu tin nhắn là đã đọc ----
export const markMessagesAsRead = async (conversationId, userId) => {
  const res = await api.put("/messages/read", { conversationId, userId });
  return res.data;
};
