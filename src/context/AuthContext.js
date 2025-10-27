import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser, getProfile } from "../service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // 👈 thêm user
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("🧠 AuthContext user thay đổi:", user);
  }, [user]);
  // ✅ kiểm tra token khi mở app
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setIsLoggedIn(true);
        // gọi API profile để lấy thông tin user
        try {
          const profile = await getProfile(); // API phải trả về user info
          setUser(profile.user || profile);
        } catch (err) {
          console.log("❌ Lỗi load profile:", err.message);
        }
      }
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  // ✅ xử lý login
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      await AsyncStorage.setItem("userToken", res.token);
      setIsLoggedIn(true);

      // gọi API lấy user chi tiết
      const profile = await getProfile();
      setUser(profile.user || profile);
      return true;
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ xử lý register
  const register = async (name, email, password, phone) => {
    try {
      const res = await registerUser({ name, email, password, phone });
      await AsyncStorage.setItem("userToken", res.token);
      setIsLoggedIn(true);
      setUser(res.user); // 👈 lưu luôn user
      return true;
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ xử lý logout
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setIsLoggedIn(false);
    setUser(null); // 👈 xóa user luôn
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
