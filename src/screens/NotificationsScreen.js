import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // 🆕 Hàm load dữ liệu
  const fetchNotifications = async () => {
    const data = [
      { id: '1', content: 'Người dùng A đã like bài đăng của bạn.' },
      { id: '2', content: 'Bài “Ví màu đen” đã có bình luận mới.' },
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
    <View style={styles.container}>
      <Ionicons name="notifications" size={64} color="#9ca3af" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Hiện chưa có thông báo mới.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  header: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 12,
  },
  notificationItem: {
    backgroundColor: '#fff',
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
    color: '#111827',
  },
  emptyText: {
    marginTop: 20,
    color: '#6b7280',
  },
});
