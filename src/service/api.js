// services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// 🔧 CÁC IP BẠN HAY DÙNG (thêm/bớt tùy ý)
const IP_CONFIGS = {
  SCHOOL: "10.33.6.13",      // Mạng trường
  HOME: "192.168.1.184",     // Mạng nhà
  HOTSPOT: "172.20.10.2",
  KHANHHOME:"192.168.1.22",
  MinhanhHome:"192.168.1.11",  
  QuanVHHome:"192.168.0.111"
};
//VÍ DỤ : MUỐN ĐỔI IP THÌ THÊM IP VÀO ĐÂY

// 👇 ĐỔI IP Ở ĐÂY - chỉ cần đổi key
const CURRENT_IP = IP_CONFIGS.QuanVHHome; // ← VÀ ĐỔI Ở ĐÂY LÀ XONG
const PORT = 9999;

// 🧭 Xác định BASE_URL
const getBaseURL = () => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return `http://${CURRENT_IP}:${PORT}`;
  } else {
    return `http://localhost:${PORT}`;
  }
};

const BASE_URL = getBaseURL();

// 🪵 In ra BASE_URL để kiểm tra
console.log("🔗 API Base URL:", BASE_URL);
console.log("📱 Platform:", Platform.OS);
console.log("🕐 Loaded at:", new Date().toLocaleTimeString());

// 🧩 Tạo instance axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // ⏱️ Tăng lên 30s
});

// 🪄 Gắn token vào header tự động
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("⚠️ Lỗi lấy token từ AsyncStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Xử lý lỗi response toàn cục
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("⚠️ Không nhận được phản hồi từ server:", error.message);
    } else {
      console.error("🔥 Lỗi khác:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;