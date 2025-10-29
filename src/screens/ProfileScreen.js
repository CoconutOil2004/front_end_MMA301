// src/screens/ProfileScreen.js
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useTheme } from "../context/ThemeContext"; // <-- SỬA Ở ĐÂY

export default function ProfileScreen() {
  const { logout, user } = useContext(AuthContext);
  const { theme } = useTheme(); // Dòng này cần 'useTheme'
  const styles = getStyles(theme.colors);

  const userName = user?.name || "Người dùng";
  const userAvatar = user?.avatar
    ? { uri: user.avatar }
    : require("../../assets/logo.jpg");
  const userHeadline = user?.headline || "Software Engineer";
  const userLocation = user?.location || "Hanoi, Vietnam";

  const handleLogout = async () => {
    await logout();
    Alert.alert("Đăng xuất", "Bạn đã đăng xuất thành công!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* === Header: Cover Photo === */}
        <View style={styles.header}>
          <Image
            style={styles.coverPhoto}
            source={{ uri: "https://picsum.photos/seed/cover/400/200" }}
          />
        </View>

        {/* === Profile Info: Pic, Name, Headline === */}
        <View style={styles.profileInfoContainer}>
          <Image style={styles.profilePhoto} source={userAvatar} />
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.headline}>{userHeadline}</Text>
          <Text style={styles.location}>{userLocation} • 500+ connections</Text>
        </View>

        {/* === Action Buttons === */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* === About Card === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.aboutText}>
            Passionate software engineer with 5+ years of experience in mobile
            development using React Native.
          </Text>
        </View>

        {/* === Experience Card === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Experience</Text>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="work"
              size={32}
              color={theme.colors.placeholder}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Senior React Native Developer</Text>
              <Text style={styles.infoSubText}>Google • Full-time</Text>
              <Text style={styles.infoDate}>Jan 2023 - Present</Text>
            </View>
          </View>
        </View>

        {/* === Education Card === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Education</Text>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="school"
              size={32}
              color={theme.colors.placeholder}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>FPT University</Text>
              <Text style={styles.infoSubText}>
                Bachelor's degree, Computer Science
              </Text>
              <Text style={styles.infoDate}>2019 - 2023</Text>
            </View>
          </View>
        </View>

        {/* === Activity / Posts === */}
        <View style={styles.activityTitleContainer}>
          <Text style={styles.cardTitle}>Activity</Text>
        </View>
        {/* (Bạn có thể fetch và list các bài post của user ở đây) */}

        {/* Nút đăng xuất */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      height: 180,
      backgroundColor: colors.inputBg,
    },
    coverPhoto: {
      width: "100%",
      height: "100%",
    },
    profileInfoContainer: {
      alignItems: "center",
      marginTop: -60,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profilePhoto: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderColor: colors.card,
      borderWidth: 4,
      backgroundColor: colors.inputBg,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 12,
      color: colors.text,
    },
    headline: {
      fontSize: 16,
      color: colors.placeholder,
      marginTop: 4,
      textAlign: "center",
    },
    location: {
      fontSize: 14,
      color: colors.placeholder,
      marginTop: 4,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      flex: 1,
    },
    primaryButtonText: {
      color: colors.activeText,
      fontWeight: "bold",
      fontSize: 14,
    },
    secondaryButton: {
      backgroundColor: colors.inputBg,
      borderColor: colors.border,
      borderWidth: 1,
      width: 50,
    },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      marginTop: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
    },
    aboutText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    infoTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: colors.text,
    },
    infoSubText: {
      fontSize: 14,
      color: colors.placeholder,
    },
    infoDate: {
      fontSize: 13,
      color: colors.placeholder,
      marginTop: 2,
    },
    activityTitleContainer: {
      paddingHorizontal: 16,
      marginTop: 8,
      backgroundColor: colors.card,
      paddingTop: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logoutButton: {
      backgroundColor: colors.danger,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      width: "90%",
      alignItems: "center",
    },
    logoutButtonText: {
      color: colors.activeText,
      fontSize: 16,
      fontWeight: "600",
    },
  });