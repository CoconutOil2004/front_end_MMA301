import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Các mục cài đặt
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
      { label: "On LinkedIn", screen: "LinkedInNotifications" },
      { label: "Email", screen: "EmailNotifications" },
      { label: "Push", screen: "PushNotifications" },
    ],
  },
  {
    title: "Display",
    icon: "eye-outline",
    items: [{ label: "Dark Mode", screen: "DarkMode" }],
  },
];

const SettingsItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <Text style={styles.itemText}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#666" />
  </TouchableOpacity>
);

const SettingsSection = ({ title, icon, items, navigation }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={22} color="#333" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {items.map((item) => (
      <SettingsItem
        key={item.label}
        label={item.label}
        onPress={() => {
          // Bạn có thể điều hướng đến màn hình chi tiết nếu muốn
          // navigation.navigate(item.screen);
          console.log(`Maps to ${item.screen}`);
        }}
      />
    ))}
  </View>
);

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#000" />
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
            navigation={navigation}
          />
        ))}
        
        {/* Nút đăng xuất (ví dụ) */}
        <TouchableOpacity style={[styles.itemContainer, styles.signOutButton]}>
            <Text style={[styles.itemText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F2EE", // Màu nền giống LinkedIn
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginLeft: 16,
  },
  sectionContainer: {
    backgroundColor: "#FFF",
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
    color: "#000",
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginLeft: 16, // Thụt lề cho các mục
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  signOutButton: {
    marginTop: 16,
    marginLeft: 0, // Không thụt lề
    backgroundColor: '#FFF',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  signOutText: {
    color: "#D11A2A", // Màu đỏ
    fontWeight: '600',
    textAlign: 'center',
  }
});
