import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // <-- 1. IMPORT IONICONS
import { AuthContext } from "../context/AuthContext";
import { getConversations } from "../service";

export default function MessagesScreen({ navigation }) {
  const { user } = useContext(AuthContext); // lấy userId từ context sau login
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      console.log("⚠️ user chưa sẵn sàng:", user);
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
        <ActivityIndicator size="large" color="#0A66C2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversations.length > 0 ? (
        <>
          {/* 2. THÊM NÚT BACK */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color="#444" />
          </TouchableOpacity>

          <Text style={styles.header}>Messages</Text>
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        </>
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
            Reach out and start a conversation. Great things might happen.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center", // <-- 3. CĂN GIỮA TIÊU ĐỀ
  },
  // 4. THÊM STYLE CHO NÚT BACK
  backButton: {
    position: "absolute",
    top: 60, // Giống paddingTop của container
    left: 16, // Giống paddingHorizontal của container
    zIndex: 10,
    padding: 4, // Tăng vùng có thể bấm
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E9E9E9",
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
    color: "#111",
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#999",
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
    color: "#111",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
