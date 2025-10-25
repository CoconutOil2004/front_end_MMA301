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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert("Thành công", "Đăng nhập thành công!");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Sai tài khoản hoặc mật khẩu";
      Alert.alert("Thất bại", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          Chưa có tài khoản? <Text style={styles.linkHighlight}>Đăng ký</Text>
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
    fontSize: 28,
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
