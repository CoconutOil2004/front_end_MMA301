// services/index.js
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const res = await api.get("/users/profile"); // ✅ Fixed: removed 'data' param
  return res.data;
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("userToken");
  return { message: "Logged out successfully" };
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

export const createPost = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};
export const getPostByUserId = async (userId) => {
  const res = await api.get(`/posts/user/${userId}`);
  return res.data;
};

export const getPosts = async (page = 1, limit = 10) => {
  const res = await api.get(`/posts?page=${page}&limit=${limit}`);
  return res.data;
};

// ✅ New: Get all posts without pagination
export const getAllPosts = async () => {
  const res = await api.get("/posts/all"); // hoặc set limit rất lớn
  return res.data;
};

export const getPostById = async (postId) => {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
};

export const updatePost = async (postId, data) => {
  const res = await api.put(`/posts/${postId}`, data);
  return res.data;
};

export const deletePost = async (postId) => {
  const res = await api.delete(`/posts/${postId}`);
  return res.data;
};

// ---- Xóa hội thoại ----
export const deleteConversation = async (conversationId) => {
  const res = await api.delete(`/conversations/${conversationId}`);
  return res.data;
};

export const getConversations = async (userId) => {
  const res = await api.get(`/conversations/${userId}`);
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
