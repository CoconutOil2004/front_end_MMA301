import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  getProfile,
  updateUserProfile,
  updateAvatar as updateAvatarAPI,
} from "../service";
import { DEFAULT_AVATAR } from "../utils/constants";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  useEffect(() => {
    console.log("🧠 AuthContext user thay đổi:", user);
    console.log("🧠 Role hiện tại:", role);
  }, [user, role]);
  const syncAvatarFromUser = async (userData) => {
    if (userData?.avatar) {
      await AsyncStorage.setItem("userAvatar", userData.avatar);
      setAvatarUrl(userData.avatar);
      console.log("✅ Avatar synced from user data:", userData.avatar);
    } else {
      await AsyncStorage.removeItem("userAvatar");
      setAvatarUrl(null);
      console.log("ℹ️ No avatar in database, using default");
    }
  };
  const loadAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem("userAvatar");
      if (savedAvatar) setAvatarUrl(savedAvatar);
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const profile = await getProfile();
          const userData = profile.user || profile;
          setUser(userData);
          setRole(userData.role || "user");
          await AsyncStorage.setItem("userRole", userData.role || "user");
          await syncAvatarFromUser(userData);
        } catch (err) {
          console.log("❌ Lỗi load profile:", err.message);
          const savedRole = await AsyncStorage.getItem("userRole");
          if (savedRole) setRole(savedRole);
          await loadAvatar();
        }
      }
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      await AsyncStorage.setItem("userToken", res.token);
      setIsLoggedIn(true);

      const profile = await getProfile();
      const userData = profile.user || profile;
      setUser(userData);

      setRole(userData.role || "user");
      await AsyncStorage.setItem("userRole", userData.role || "user");

      await syncAvatarFromUser(userData);
      return true;
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await registerUser({ name, email, password, phone });
      await AsyncStorage.setItem("userToken", res.token);
      setIsLoggedIn(true);
      setUser(res.user);

      setRole(res.user.role || "user");
      await AsyncStorage.setItem("userRole", res.user.role || "user");

      await syncAvatarFromUser(res.user);
      return true;
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      throw err;
    }
  };
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userAvatar");
    await AsyncStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    setAvatarUrl(null);
  };

  const updateProfile = async (data) => { // data = { name, phone, bio }
    try {
      console.log("🔄 Đang cập nhật profile (text fields):", data);
      const response = await updateUserProfile(data); // Gọi API /users/update

      if (!response || !response.user) {
        throw new Error("Phản hồi từ API cập nhật profile không hợp lệ");
      }
      
      const updatedUser = response.user;
      
      // Cập nhật state (quan trọng)
      setUser(updatedUser); 
      setRole(updatedUser.role || "user");
      
      // Cập nhật storage (đồng bộ với logic của bạn)
      await AsyncStorage.setItem("userRole", updatedUser.role || "user");
      // Mặc dù API này không đổi avatar, ta vẫn sync để đảm bảo
      // (Hoặc có thể chỉ cần: setUser(updatedUser);)
      await syncAvatarFromUser(updatedUser); 
      
      console.log("✅ Context: Cập nhật profile (text) thành công.");
      
    } catch (error) {
      console.error("Lỗi updateProfile (context):", error.response?.data || error.message);
      throw error; // Ném lỗi ra để màn hình EditProfile xử lý
    }
  };

const updateAvatar = async (newAvatarUrl) => {
    try {
      console.log("🔄 Đang cập nhật avatar:", newAvatarUrl);
      
      // 1. Gọi API và *lấy kết quả*
      const response = await updateAvatarAPI(newAvatarUrl); // Sửa: Dùng tên import
      
      // 2. Kiểm tra kết quả trả về
      if (!response || !response.user) {
          throw new Error("Phản hồi từ API cập nhật avatar không hợp lệ");
      }

      // 3. Lấy user đã được cập nhật đầy đủ từ backend
      const updatedUser = response.user;
      
      // 4. Cập nhật state và storage bằng dữ liệu mới nhất
      await AsyncStorage.setItem("userAvatar", updatedUser.avatar);
      setAvatarUrl(updatedUser.avatar);
      setUser(updatedUser); // <-- Sửa: Dùng updatedUser
      
      console.log("✅ Avatar updated globally:", updatedUser.avatar);
    } catch (error) {
      console.error("❌ Error updating avatar:", error);
      throw error;
    }
  };
  const getDisplayAvatar = () => {
    return avatarUrl || user?.avatar || DEFAULT_AVATAR;
  };
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        role,
        loading,
        avatarUrl,
        login,
        register,
        logout,
        updateAvatar,
        getDisplayAvatar,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
