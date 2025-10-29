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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường!");
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, phone);
      Alert.alert("Thành công", "Đăng ký thành công!");
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi đăng ký";
      Alert.alert("Thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ tên"
        placeholderTextColor={theme.colors.placeholder}
        value={name}
        onChangeText={setName}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor={theme.colors.placeholder}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.activeText} />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>
          Đã có tài khoản? <Text style={styles.linkHighlight}>Đăng nhập</Text>
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
      fontSize: 26,
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
      height: 50,
      justifyContent: "center",
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