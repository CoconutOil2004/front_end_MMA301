import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser, getProfile } from "../service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null); // 👈 State riêng cho avatar

  useEffect(() => {
    console.log("🧠 AuthContext user thay đổi:", user);
  }, [user]);

  // ✅ Load avatar từ AsyncStorage
  const loadAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  // ✅ Kiểm tra token khi mở app
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const profile = await getProfile();
          setUser(profile.user || profile);
          await loadAvatar(); // 👈 Load avatar
        } catch (err) {
          console.log("❌ Lỗi load profile:", err.message);
        }
      }
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  // ✅ Xử lý login
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      await AsyncStorage.setItem("userToken", res.token);
      setIsLoggedIn(true);

      const profile = await getProfile();
      setUser(profile.user || profile);
      await loadAvatar(); // 👈 Load avatar sau khi login
      return true;
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Xử lý register
  const register = async (name, email, password, phone) => {
    try {
      const res = await registerUser({ name, email, password, phone });
      await AsyncStorage.setItem("userToken", res.token);
      setIsLoggedIn(true);
      setUser(res.user);
      return true;
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Xử lý logout
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userAvatar"); // 👈 Xóa avatar
    setIsLoggedIn(false);
    setUser(null);
    setAvatarUrl(null); // 👈 Clear avatar state
  };

  // ✅ Update avatar (function mới)
  const updateAvatar = async (newAvatarUrl) => {
    try {
      await AsyncStorage.setItem('userAvatar', newAvatarUrl);
      setAvatarUrl(newAvatarUrl); // 👈 Update state để trigger re-render
      console.log('✅ Avatar updated globally:', newAvatarUrl);
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isLoggedIn, 
        user, 
        loading, 
        avatarUrl, // 👈 Expose avatar
        login, 
        register, 
        logout,
        updateAvatar, // 👈 Expose update function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};