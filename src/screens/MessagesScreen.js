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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import {
  createOrGetConversation,
  getConversations,
  searchUsers,
} from "../service";
import { useTheme } from "../context/ThemeContext";

export default function MessagesScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);

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

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await searchUsers(text.trim());
      setSearchResults(res);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    try {
      const conversation = await createOrGetConversation({
        senderId: user._id,
        receiverId: selectedUser._id,
      });
      navigation.navigate("ChatDetail", {
        conversationId: conversation._id,
        receiver: selectedUser,
      });
    } catch (err) {
      console.error("❌ Lỗi khi tạo hội thoại:", err);
    }
  };

  const renderConversation = ({ item }) => {
    const otherUser = item.participants.find((p) => p._id !== user._id);
    if (!otherUser) return null;

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
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.header}>Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.placeholder}
            style={{ marginHorizontal: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email hoặc SĐT..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.placeholder}
                style={{ marginHorizontal: 8 }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading search */}
        {searching && (
          <ActivityIndicator
            style={{ marginVertical: 8 }}
            color={theme.colors.primary}
          />
        )}

        {/* Search Results */}
        {searchText.length > 0 ? (
          searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSelectUser(item)}
                >
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.message}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            !searching && (
              <Text style={styles.noResults}>Không tìm thấy người dùng phù hợp.</Text>
            )
          )
        ) : conversations.length > 0 ? (
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

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      marginBottom: 10,
    },
    backButton: {
      position: "absolute",
      left: 16,
      padding: 4,
    },
    header: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 16,
      paddingHorizontal: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 8,
    },
    chatCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
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
    searchResultItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    noResults: {
      textAlign: "center",
      color: colors.placeholder,
      marginTop: 20,
      fontSize: 14,
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
