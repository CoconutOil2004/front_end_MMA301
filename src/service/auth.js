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
  const res = await api.get("/users/profile");
  return res.data;
};

// ---- UPDATE AVATAR ----
export const updateAvatar = async (avatarUrl) => {
  const res = await api.patch("/users/update-avatar", { avatar: avatarUrl });
  return res.data;
};

// ---- LOGOUT ----
export const logoutUser = async () => {
  await AsyncStorage.removeItem("userToken");
  return { message: "Logged out successfully" };
};

// ---- FORGOT PASSWORD ----
export const forgotPassword = async (data) => {
  const res = await api.post("/users/forgot-password", data);
  return res.data;
};
