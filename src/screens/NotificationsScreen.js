import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext"; // <-- SỬA Ở ĐÂY

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles

  // 🆕 Hàm load dữ liệu
  const fetchNotifications = async () => {
    const data = [
      { id: "1", content: "Người dùng A đã like bài đăng của bạn." },
      { id: "2", content: "Bài “Ví màu đen” đã có bình luận mới." },
    ];
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons name="notifications" size={64} color={theme.colors.placeholder} />
        <Text style={styles.header}>Thông Báo</Text>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationText}>{item.content}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Hiện chưa có thông báo mới.</Text>
          }
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

// 4. Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingTop: 50,
    alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 20,
      color: colors.text,
    fontWeight: '600',
      marginBottom: 12,
    },
    list: {
      width: '100%',
    },
    notificationItem: {
      backgroundColor: colors.card,
      borderRadius: 8,
      marginVertical: 6,
      padding: 12,
    width: '90%',
    shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    notificationText: {
      color: colors.text,
    },
    emptyText: {
      marginTop: 20,
      color: colors.placeholder,
      textAlign: 'center',
    },
  });
