import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // 1. Import

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm loading
  const { login } = useContext(AuthContext);
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles động

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      Alert.alert("Thành công", "Đăng nhập thành công!");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Sai tài khoản hoặc mật khẩu";
      Alert.alert("Thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email FPT..."
        placeholderTextColor={theme.colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.activeText} />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          Chưa có tài khoản?{" "}
          <Text style={styles.linkHighlight}>Đăng ký</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 4. Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 24,
    },
    input: {
      width: "100%",
      height: 50,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
      marginTop: 8,
    },
    buttonText: {
      color: colors.activeText,
      fontWeight: "600",
      fontSize: 16,
    },
    link: {
      marginTop: 16,
      color: colors.text,
    },
    linkHighlight: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
