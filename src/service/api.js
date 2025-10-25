// services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_URL } from "@env";
// Nếu không có API_URL trong .env thì fallback theo nền tảng
let BASE_URL = API_URL || "";

if (!BASE_URL) {
  if (Platform.OS === "android") {
    BASE_URL = "http://10.0.2.2:9999/api"; // Android Emulator
  } else if (Platform.OS === "ios") {
    BASE_URL = "http://127.0.0.1:9999/api"; // iOS Simulator
  } else {
    BASE_URL = "http://localhost:9999/api"; // Web
  }
}

// 👉 Nếu bạn dùng EXPO GO trên điện thoại thật:
// Cập nhật BASE_URL trong .env = http://192.168.x.x:9999/api
// (thay 192.168.x.x bằng IP máy tính thật, xem bằng ipconfig hoặc ifconfig)

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🪄 Tự động đính kèm token từ AsyncStorage
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
