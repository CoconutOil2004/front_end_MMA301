import React, { useRef, useEffect, useContext } from "react";
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
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
const { width } = Dimensions.get("window");
const DRAWER_WIDTH = 320;
export default function DrawerContent({ isOpen, onClose }) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  const { user, avatarUrl } = useContext(AuthContext);
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
  const handleNavigateToSettings = () => {
    onClose();
    navigation.navigate("Settings");
  };

  if (!isOpen) return null;
  const displayAvatar = avatarUrl || user?.avatar || DEFAULT_AVATAR;
  const displayName = user?.name || "Người dùng";
  const displayJobTitle =
    user?.headline || user?.jobTitle || "Software Engineer";
  const displayLocation = user?.location || "Hanoi, Vietnam";
  const displayCompany = user?.company || "FPT Software";
  const displayCompanyInitial = displayCompany.charAt(0).toUpperCase();

  const menuItems = [{ icon: "bookmark-outline", label: "Saved posts" }];

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: translateX.interpolate({
                inputRange: [-DRAWER_WIDTH, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.placeholder} />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleNavigateToProfile}>
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToProfile}>
            <Text style={styles.name}>{displayName}</Text>
          </TouchableOpacity>

          <Text style={styles.jobTitle}>{displayJobTitle}</Text>
          <Text style={styles.location}>{displayLocation}</Text>

          <View style={styles.companyBadge}>
            <View style={styles.companyIcon}>
              <Text style={styles.companyIconText}>
                {displayCompanyInitial}
              </Text>
            </View>
            <Text style={styles.companyName}>{displayCompany}</Text>
          </View>
        </View>

        <View style={styles.profileViews}>
          <Text style={styles.viewsText}>
            <Text style={styles.viewsNumber}>{user?.profileViews || 13}</Text>{" "}
            profile viewers
          </Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={onClose}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={theme.colors.placeholder}
                />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              {item.hasChevron && (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.placeholder}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSection}>
          {/* 2. Cập nhật onPress cho nút Settings */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleNavigateToSettings}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.colors.placeholder}
            />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// 4. Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      // flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    drawer: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      backgroundColor: colors.card,
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
      borderBottomColor: colors.border,
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
      color: colors.text,
      marginBottom: 4,
    },
    jobTitle: {
      fontSize: 14,
      color: colors.placeholder,
      marginBottom: 2,
    },
    location: {
      fontSize: 14,
      color: colors.placeholder,
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
      color: colors.text,
    },
    profileViews: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    viewsText: {
      fontSize: 14,
      color: colors.placeholder,
    },
    viewsNumber: {
      color: colors.primary,
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
      color: colors.text,
      marginLeft: 12,
    },
    bottomSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingsButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    settingsText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    premiumContainer: {
      padding: 16,
    },
    premiumButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.secondary,
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    premiumText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.activeText,
      marginLeft: 8,
    },
  });
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
    backgroundColor: "#e5e7eb",
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
    backgroundColor: "#0A66C2",
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
    backgroundColor: "#FFD93D",
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
