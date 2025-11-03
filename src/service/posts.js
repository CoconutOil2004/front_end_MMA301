import api from "./api";

export const createPost = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};

export const getPosts = async (page = 1, limit = 10) => {
  const res = await api.get(`/posts?page=${page}&limit=${limit}`);
  return res.data;
};

export const getPostById = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const getAllPosts = async () => {
  const res = await api.get("/posts/all");
  return res.data;
};

export const getPostByUserId = async (userId) => {
  const res = await api.get(`/posts/user/${userId}`);
  return res.data;
};

export const updatePost = async (id, data) => {
  const res = await api.put(`/posts/${id}`, data);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};
