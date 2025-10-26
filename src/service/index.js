// services/index.js
import api from "./api";

// ---- AUTHENTICATION ----
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// ---- FORGOT PASSWORD ----
export const forgotPassword = async (data) => {
  const res = await api.post("/users/forgot-password", data);
  return res.data;
};

// ---- POSTS ----
export const createPost = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};

export const getPosts = async (page = 1, limit = 10) => {
  const res = await api.get(`/posts?page=${page}&limit=${limit}`);
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

export const likePost = async (postId) => {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
};

export const unlikePost = async (postId) => {
  const res = await api.delete(`/posts/${postId}/like`);
  return res.data;
};

export const commentPost = async (postId, data) => {
  const res = await api.post(`/posts/${postId}/comments`, data);
  return res.data;
};

export const getComments = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};
