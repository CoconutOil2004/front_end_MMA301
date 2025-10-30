// src/screens/SettingsScreen.js
import React, { useContext } from "react"; // Thêm useContext
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert, // Thêm Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

// Các mục cài đặt (giữ ở ngoài)
const settingsOptions = [
  {
    title: "Account",
    icon: "person-circle-outline",
    items: [
      { label: "Sign-in & security", screen: "SignInSecurity" },
      { label: "Account preferences", screen: "AccountPreferences" },
    ],
  },
  {
    title: "Privacy",
    icon: "lock-closed-outline",
    items: [
      { label: "Edit your public profile", screen: "EditPublicProfile" },
      { label: "Who can see your activity", screen: "ActivityVisibility" },
      { label: "Data privacy", screen: "DataPrivacy" },
    ],
  },
  {
    title: "Notifications",
    icon: "notifications-outline",
    items: [
      { label: "On App", screen: "AppNotifications" },
      { label: "Email", screen: "EmailNotifications" },
      { label: "Push", screen: "PushNotifications" },
    ],
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useContext(AuthContext); // Sửa: dùng useContext

  // --- SỬA LỖI ---
  // 1. Định nghĩa `styles` ở đây, TRƯỚC khi dùng
  const styles = getStyles(theme.colors);

  // 2. Di chuyển các component con vào BÊN TRONG SettingsScreen
  // Giờ chúng có thể thấy biến `styles`
  const SettingsItem = ({ label, onPress }) => (
    <TouchableOpacity
      // 3. Sửa cách gọi: styles.itemContainer là object, không phải function
      style={[
        styles.itemContainer,
        { marginLeft: 16 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.itemText}>{label}</Text>
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={theme.colors.placeholder}
      />
    </TouchableOpacity>
  );

  const SettingsSection = ({ title, icon, items }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {items.map((item) => (
        <SettingsItem
          key={item.label}
          label={item.label}
          onPress={() => {
            console.log(`Maps to ${item.screen}`);
          }}
        />
      ))}
    </View>
  );
  // --- KẾT THÚC SỬA LỖI ---

  const handleLogout = () => {
    logout();
    Alert.alert("Đã đăng xuất");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
      <ScrollView style={styles.container}>
        {settingsOptions.map((section) => (
          <SettingsSection
            key={section.title}
            title={section.title}
            icon={section.icon}
            items={section.items}
            // không cần truyền 'colors' nữa
          />
        ))}

        {/* Render mục Display với Switch */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={22} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Display</Text>
          </View>
          <View
            style={[
              styles.itemContainer, // Sửa: Dùng object
              { marginLeft: 16 },
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

        {/* Nút đăng xuất */}
        <TouchableOpacity
          style={[
            styles.itemContainer, // Sửa: Dùng object
            styles.signOutButton,
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.itemText, styles.signOutText]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// 4. Sửa hàm getStyles: các thuộc tính phải là object, không phải function
const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
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
    sectionContainer: { // Sửa: bỏ (colors)
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
    sectionTitle: { // Sửa: bỏ (colors)
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
    },
    itemContainer: { // Sửa: bỏ (colors)
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemText: { // Sửa: bỏ (colors)
      fontSize: 16,
      color: colors.text,
    },
    signOutButton: {
      marginTop: 16,
      marginLeft: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      justifyContent: "center",
    },
    signOutText: {
      color: colors.danger,
      fontWeight: "600",
      textAlign: "center",
    },
  });