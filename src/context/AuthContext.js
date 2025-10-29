import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser, getProfile, updateAvatar as updateAvatarAPI } from "../service";
import { DEFAULT_AVATAR } from "../utils/constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    console.log("🧠 AuthContext user thay đổi:", user);
  }, [user]);

  // ✅ Sync avatar từ user data
  const syncAvatarFromUser = async (userData) => {
    if (userData?.avatar) {
      await AsyncStorage.setItem('userAvatar', userData.avatar);
      setAvatarUrl(userData.avatar);
      console.log('✅ Avatar synced from user data:', userData.avatar);
    } else {
      // ❌ Nếu không có avatar trong database, xóa cache và dùng default
      await AsyncStorage.removeItem('userAvatar');
      setAvatarUrl(null);
      console.log('ℹ️ No avatar in database, using default');
    }
  };

  // ✅ Load avatar từ AsyncStorage (fallback)
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
          const userData = profile.user || profile;
          setUser(userData);
          
          // 👉 Sync avatar từ API response
          await syncAvatarFromUser(userData);
        } catch (err) {
          console.log("❌ Lỗi load profile:", err.message);
          // Nếu API fail, load avatar từ AsyncStorage
          await loadAvatar();
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
      const userData = profile.user || profile;
      setUser(userData);
      
      // 👉 Sync avatar từ API response
      await syncAvatarFromUser(userData);
      
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
      
      // 👉 Sync avatar từ API response (mới đăng ký chưa có avatar)
      await syncAvatarFromUser(res.user);
      
      return true;
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Xử lý logout
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userAvatar");
    setIsLoggedIn(false);
    setUser(null);
    setAvatarUrl(null);
  };

  // ✅ Update avatar (khi user tự upload mới)
  const updateAvatar = async (newAvatarUrl) => {
    try {
      console.log('🔄 Đang cập nhật avatar:', newAvatarUrl);

      // 1️⃣ Gọi API để lưu vào database
      await updateAvatarAPI(newAvatarUrl);
      console.log('✅ Đã lưu avatar vào database');

      // 2️⃣ Lưu vào AsyncStorage
      await AsyncStorage.setItem('userAvatar', newAvatarUrl);
      
      // 3️⃣ Update state để trigger re-render
      setAvatarUrl(newAvatarUrl);
      
      // 4️⃣ Update user object
      if (user) {
        setUser({ ...user, avatar: newAvatarUrl });
      }
      
      console.log('✅ Avatar updated globally:', newAvatarUrl);
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      throw error;
    }
  };

  // ✅ Helper function để lấy avatar hiển thị
  const getDisplayAvatar = () => {
    return avatarUrl || user?.avatar || DEFAULT_AVATAR;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        avatarUrl,
        login,
        register,
        logout,
        updateAvatar,
        getDisplayAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};