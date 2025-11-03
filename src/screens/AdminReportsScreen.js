import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getAllReports, approveReport, rejectReport } from "../service";

export default function AdminReportsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await getAllReports();
      const list = Array.isArray(data) ? data : data.reports || [];
      setReports(list);
    } catch (error) {
      console.error("❌ Lỗi tải báo cáo:", error.message);
      Alert.alert("Lỗi", "Không thể tải danh sách báo cáo.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports({ showLoading: true });
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveReport(id, "");
      loadReports();
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id) => {
    Alert.prompt(
      "Từ chối báo cáo",
      "Nhập lý do từ chối (tùy chọn):",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: async (reason) => {
            try {
              await rejectReport(id, reason);
              Alert.alert("🛑 Đã từ chối", "Báo cáo đã bị từ chối.");
              loadReports();
            } catch (error) {
              Alert.alert("❌ Lỗi", "Không thể từ chối báo cáo.");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* 🔹 Thông tin người báo cáo */}
      <View style={styles.reporterRow}>
        <Image
          source={{
            uri:
              item.reporterId?.avatar ||
              "https://via.placeholder.com/50x50?text=User",
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{item.reporterId?.name || "Ẩn danh"}</Text>
          <Text style={styles.email}>{item.reporterId?.email || ""}</Text>
        </View>
      </View>

      {/* 🔹 Bài viết liên quan */}
      <View style={styles.postSection}>
        <Text style={styles.postTitle}>
          📰 {item.postId?.title || "Không có tiêu đề"}
        </Text>
        {item.postId?.imageUrl ? (
          <Image
            source={{ uri: item.postId.imageUrl }}
            style={styles.postImage}
          />
        ) : null}
      </View>

      <Text style={styles.reason}>📝 {item.reason}</Text>
      <Text style={styles.status}>
        Trạng thái:{" "}
        <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
          {item.status}
        </Text>
      </Text>

      {/* 🔹 Nút thao tác */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleApprove(item._id)}
        >
          <Text style={styles.btnText}>Duyệt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.colors.danger }]}
          onPress={() => handleReject(item._id)}
        >
          <Text style={styles.btnText}>Từ chối</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 8 }}>
          Đang tải danh sách báo cáo...
        </Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{
          padding: 16,
          flexGrow: reports.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: theme.colors.placeholder }}>
              Không có báo cáo nào.
            </Text>
          </View>
        }
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
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    reporterRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 10,
    },
    name: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 15,
    },
    email: {
      color: colors.placeholder,
      fontSize: 12,
    },
    postSection: {
      marginVertical: 8,
    },
    postTitle: {
      fontWeight: "600",
      fontSize: 14,
      color: colors.text,
    },
    postImage: {
      width: "100%",
      height: 150,
      borderRadius: 8,
      marginTop: 6,
    },
    reason: {
      color: colors.placeholder,
      fontSize: 13,
      marginTop: 6,
    },
    status: {
      fontSize: 13,
      color: colors.placeholder,
      marginTop: 6,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
    },
    btn: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    btnText: {
      color: "#fff",
      fontWeight: "600",
    },
  });
