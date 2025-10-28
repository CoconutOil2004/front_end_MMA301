import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = 320;

export default function DrawerContent({ isOpen, onClose }) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleNavigateToProfile = () => {
    onClose();
    navigation.navigate("Profile");
  };

  // 1. Tạo hàm xử lý điều hướng cho Settings
  const handleNavigateToSettings = () => {
    onClose(); // Đóng drawer
    navigation.navigate("Settings"); // Điều hướng đến màn hình 'Settings'
  };

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: "bar-chart-outline",
      label: "View all analytics",
      hasChevron: true,
    },
    { icon: "game-controller-outline", label: "Puzzle games" },
    { icon: "bookmark-outline", label: "Saved posts" },
    { icon: "people-outline", label: "Groups" },
  ];

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleNavigateToProfile}>
            <Image
              // Giả sử bạn có logo.jpg trong assets, nếu không hãy thay đổi đường dẫn
              source={require("../../../assets/logo.jpg")}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToProfile}>
            <Text style={styles.name}>Duy Hung Tran</Text>
          </TouchableOpacity>

          <Text style={styles.jobTitle}>Software Engineer at FPT Software</Text>
          <Text style={styles.location}>Hanoi Capital Region</Text>

          <View style={styles.companyBadge}>
            <View style={styles.companyIcon}>
              <Text style={styles.companyIconText}>F</Text>
            </View>
            <Text style={styles.companyName}>FPT Software</Text>
          </View>
        </View>

        {/* Profile Views */}
        <View style={styles.profileViews}>
          <Text style={styles.viewsText}>
            <Text style={styles.viewsNumber}>13</Text> profile viewers
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={onClose} // Giữ nguyên hoặc thay đổi nếu cần
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color="#666" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              {item.hasChevron && (
                <Ionicons name="chevron-forward" size={20} color="#999" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.bottomSection}>
          {/* 2. Cập nhật onPress cho nút Settings */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleNavigateToSettings}
          >
            <Ionicons name="settings-outline" size={22} color="#666" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>

          <View style={styles.premiumContainer}>
            <TouchableOpacity style={styles.premiumButton}>
              <Ionicons name="ribbon-outline" size={20} color="#000" />
              <Text style={styles.premiumText}>Try Premium for đ0</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ... (Styles giữ nguyên)
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginTop: 40,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
  },
  companyBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  companyIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#0A66C2", // LinkedIn blue
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  companyIconText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  profileViews: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  viewsText: {
    fontSize: 14,
    color: "#666",
  },
  viewsNumber: {
    color: "#0A66C2",
    fontWeight: "600",
  },
  menuSection: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  premiumContainer: {
    padding: 16,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD93D", // Màu vàng premium của LinkedIn
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
});
