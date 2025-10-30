import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { getConversations } from "../service"; // Giả sử service
import { useTheme } from "../context/ThemeContext"; // 1. Import

export default function MessagesScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles

  useEffect(() => {
    if (!user?._id) {
      console.log("⚠️ user chưa sẵn sàng:", user);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        console.log("📦 Gọi API với userId:", user._id);
        const data = await getConversations(user._id);
        setConversations(data);
      } catch (error) {
        console.error("Lỗi lấy danh sách hội thoại:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const renderConversation = ({ item }) => {
    // lấy người còn lại trong participants
    const otherUser = item.participants.find((p) => p._id !== user._id);
    if (!otherUser) return null; // Tránh crash

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          navigation.navigate("ChatDetail", {
            conversationId: item._id,
            receiver: otherUser,
          })
        }
      >
        <Image source={{ uri: otherUser?.avatar }} style={styles.avatar} />
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{otherUser?.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
        <Text style={styles.time}>
          {new Date(item.updatedAt).toLocaleDateString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Messages</Text>

        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/3209/3209265.png",
              }}
              style={styles.illustration}
            />
            <Text style={styles.emptyTitle}>No messages — yet!</Text>
            <Text style={styles.emptyText}>
              Reach out and start a conversation.
            </Text>
          </View>
        )}
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
      backgroundColor: colors.background,
      paddingTop: 30,
      paddingHorizontal: 16,
    },
    header: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 16,
      textAlign: "center",
      color: colors.text,
    },
    backButton: {
      position: "absolute",
      top: 33,
      left: 16,
      zIndex: 10,
      padding: 4,
    },
    chatCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 27,
    },
    chatInfo: {
      flex: 1,
      marginLeft: 12,
    },
    name: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    message: {
      fontSize: 14,
      color: colors.placeholder,
      marginTop: 2,
    },
    time: {
      fontSize: 12,
      color: colors.placeholder,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },
    illustration: {
      width: 160,
      height: 160,
      marginBottom: 20,
      opacity: 0.8,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
      color: colors.placeholder,
      marginBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
  });
