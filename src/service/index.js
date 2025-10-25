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
