import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext"; // <-- SỬA Ở ĐÂY

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles

  // 🆕 Hàm load dữ liệu
  const fetchNotifications = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      // TODO: thay bằng gọi API khi backend sẵn sàng
      const data = [
        { id: "1", content: "Người dùng A đã like bài đăng của bạn." },
        { id: "2", content: "Bài “Ví màu đen” đã có bình luận mới." },
      ];
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error("⚠️ Lỗi tải notifications:", err);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    await fetchNotifications({ showLoader: false });
    setRefreshing(false);
  }, [refreshing, fetchNotifications]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons name="notifications" size={64} color={theme.colors.placeholder} />
        <View style={styles.headerRow}>
          <Text style={styles.header}>Thông Báo</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing || loading}
            accessibilityRole="button"
            accessibilityLabel="Làm mới thông báo"
          >
            <Ionicons
              name="refresh"
              size={20}
              color={refreshing || loading ? theme.colors.placeholder : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Theo dõi các tương tác mới nhất với bài đăng của bạn và cập nhật kịp thời.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.summaryTitle}>Tổng quan hôm nay</Text>
          </View>
          <Text style={styles.summaryDescription}>
            Kéo xuống để làm mới danh sách thông báo. Các mục sẽ hiển thị theo thời gian nhận được.
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>{item.content}</Text>
                  {item.time ? (
                    <Text style={styles.notificationMeta}>{item.time}</Text>
                  ) : null}
                </View>
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
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && styles.emptyContainer,
            ]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
      paddingTop: 48,
      paddingHorizontal: 24,
      gap: 12,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    header: {
      fontSize: 20,
      color: colors.text,
      fontWeight: '600',
    },
    headerSubtitle: {
      color: colors.placeholder,
      lineHeight: 20,
    },
    summaryCard: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 3,
      gap: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    summaryDescription: {
      color: colors.placeholder,
      lineHeight: 20,
    },
    list: {
      width: '100%',
    },
    listContent: {
      paddingVertical: 12,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 40,
    },
    notificationItem: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    notificationIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationContent: {
      flex: 1,
      gap: 6,
    },
    notificationText: {
      color: colors.text,
      fontWeight: '500',
      lineHeight: 20,
    },
    notificationMeta: {
      color: colors.placeholder,
      fontSize: 12,
    },
    emptyText: {
      marginTop: 20,
      color: colors.placeholder,
      textAlign: 'center',
    },
    refreshButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 8,
    },
    loadingText: {
      color: colors.placeholder,
    },
    errorText: {
      marginTop: 16,
      color: '#ff4d4f',
    },
    separator: {
      height: 12,
    },
  });
