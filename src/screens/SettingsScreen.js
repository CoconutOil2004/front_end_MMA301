// src/screens/SettingsScreen.js
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useContext(AuthContext);
  const styles = getStyles(theme.colors); // Định nghĩa styles

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => { await logout(); }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      {/* --- SỬA CẤU TRÚC Ở ĐÂY --- */}
      {/* 1. Bọc nội dung bằng một View flex: 1 */}
      <View style={styles.contentContainer}>
        
        {/* 2. ScrollView chỉ bọc các mục cài đặt */}
        <ScrollView>
          {/* Mục Display */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="eye-outline" size={22} color={theme.colors.text} />
              <Text style={styles.sectionTitle}>Display</Text>
            </View>
            <View
              style={[
                styles.itemContainer,
                { justifyContent: 'space-between' }
              ]}
            >
              <Text style={styles.itemText}>Dark Mode</Text>
              <Switch
                trackColor={{ false: "#767577", true: theme.colors.primary }}
                thumbColor={isDark ? theme.colors.primary : "#f4f3f4"}
                onValueChange={toggleTheme}
                value={isDark}
              />
            </View>
          </View>
        </ScrollView>
        
        {/* 3. Nút Sign Out nằm BÊN NGOÀI ScrollView */}
        <TouchableOpacity
          style={styles.signOutButton} // Style này đã được sửa
          onPress={handleLogout}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      {/* --- KẾT THÚC SỬA CẤU TRÚC --- */}
    </SafeAreaView>
  );
}

// --- HÀM STYLES (ĐÃ SỬA LẠI) ---
const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background, // Nền cho khu vực an toàn
    },
    // View bọc ScrollView và Nút Logout
    contentContainer: {
        flex: 1, // Chiếm hết không gian còn lại
        justifyContent: 'space-between', // Đẩy ScrollView lên trên và Nút xuống dưới
    },
    container: {
      // Bỏ flex: 1 khỏi ScrollView để nó không chiếm hết
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 16,
    },
    sectionContainer: {
      backgroundColor: colors.card,
      marginTop: 8,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginLeft: 16,
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
    },
    // Style cho nút Sign Out đã được cập nhật
    signOutButton: {
      backgroundColor: colors.card,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      // Thêm margin và border bottom để tách biệt
      margin: 16, 
      borderRadius: 8, 
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    signOutText: {
      color: colors.danger,
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 16,
    },
  });