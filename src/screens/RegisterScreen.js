import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường!");
      return;
    }

    try {
      await register(name, email, password, phone);
      Alert.alert("Thành công", "Đăng ký thành công!");
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi đăng ký";
      Alert.alert("Thất bại", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ tên"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email FPT..."
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#9CA3AF"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>
          Đã có tài khoản? <Text style={styles.linkHighlight}>Đăng nhập</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#F97316",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF4E6",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  button: {
    backgroundColor: "#F97316",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    color: "#475569",
  },
  linkHighlight: {
    color: "#F97316",
    fontWeight: "600",
  },
});
