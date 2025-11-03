import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import {
  getNotificationsByUser,
  markAsRead,
  deleteNotification,
} from "../service";

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);
  const styles = getStyles(theme.colors);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsByUser(user._id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải thông báo:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đánh dấu đã đọc.");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Xóa thông báo", "Bạn có chắc muốn xóa thông báo này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa thông báo.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item._id)}
      onLongPress={() => handleDelete(item._id)}
      style={[styles.notificationItem, item.isRead && { opacity: 0.6 }]}
    >
      <View style={styles.row}>
        <Ionicons
          name={
            item.type === "system"
              ? "megaphone"
              : item.type === "like"
              ? "heart"
              : item.type === "report_update"
              ? "alert-circle"
              : "notifications"
          }
          size={22}
          color={theme.colors.primary}
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleString("vi-VN")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>
          Đang tải thông báo...
        </Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name="notifications-off"
              size={60}
              color={theme.colors.placeholder}
            />
            <Text style={{ color: theme.colors.placeholder, marginTop: 8 }}>
              Hiện chưa có thông báo mới.
            </Text>
          </View>
        }
        contentContainerStyle={{
          padding: 16,
          flexGrow: notifications.length === 0 ? 1 : 0,
        }}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    notificationItem: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 15,
      marginBottom: 4,
    },
    message: {
      color: colors.placeholder,
      fontSize: 13,
    },
    time: {
      color: colors.placeholder,
      fontSize: 12,
      marginTop: 6,
      textAlign: "right",
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    refreshText: {
      color: colors.primary,
      fontWeight: '500',
    },
  });
