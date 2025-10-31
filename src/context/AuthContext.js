import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  getProfile,
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
  const updateAvatar = async (newAvatarUrl) => {
    try {
      console.log("🔄 Đang cập nhật avatar:", newAvatarUrl);
      await updateAvatarAPI(newAvatarUrl);
      await AsyncStorage.setItem("userAvatar", newAvatarUrl);
      setAvatarUrl(newAvatarUrl);
      if (user) setUser({ ...user, avatar: newAvatarUrl });
      console.log("✅ Avatar updated globally:", newAvatarUrl);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
