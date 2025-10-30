// src/styles/theme.js
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

// 1. Định nghĩa các màu tùy chỉnh của bạn
const customLightColors = {
  background: "#FFFFFF",
  text: "#1E293B",
  card: "#FFFFFF",
  border: "#E0E0E0",
  primary: "#F97316",
  success: "#22C55E",
  danger: "#EF4444",
  inputBg: "#F3F2EF",
  placeholder: "#666666",
  activeText: "#FFFFFF",
  secondary: "#FDBA74",
};

const customDarkColors = {
  background: "#121212",
  text: "#F8FAFC",
  card: "#1E1E1E",
  border: "#3A3A3A",
  primary: "#FB923C",
  success: "#4ADE80",
  danger: "#F87171",
  inputBg: "#2C2C2C",
  placeholder: "#A0A0A0",
  activeText: "#121212",
  secondary: "#FBBF24",
};

// 2. Tạo theme hoàn chỉnh
export const LIGHT_THEME = {
  ...DefaultTheme, // Kế thừa tất cả thuộc tính (fonts, roundness,...)
  colors: {
    ...DefaultTheme.colors, // Kế thừa màu mặc định
    ...customLightColors, // Ghi đè bằng màu tùy chỉnh
  },
};
export const DARK_THEME = {
  ...DarkTheme, // Kế thừa tất cả thuộc tính (fonts, roundness,...)
  colors: {
    ...DarkTheme.colors, // Kế thừa màu mặc định
    ...customDarkColors, // Ghi đè bằng màu tùy chỉnh
  },
};