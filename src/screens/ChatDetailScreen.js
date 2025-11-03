import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { getMessages, sendMessage } from "../service";
import { useTheme } from "../context/ThemeContext";
import { summarizeChat } from "../service/aiService";

export default function ChatDetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { conversationId, receiver } = route.params;
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles
  console.log("🧾 route.params:", route.params);
  console.log("👤 receiver:", receiver);
  console.log("🪪 user:", user);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages(conversationId);
        setMessages(data || []);
      } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
      }
    };
    fetchMessages();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;
    try {
      const newMsg = await sendMessage(conversationId, user._id, inputText);
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");

      // tự cuộn xuống cuối
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };
  const handleSummarize = async () => {
    setLoadingSummary(true);
    try {
      const formattedMessages = messages.map((m) => ({
        senderName:
          m.senderId?._id === user._id
            ? user.name || "Tôi"
            : receiver?.name || "Người kia",
        text: m.text,
      }));

      const summary = await summarizeChat(formattedMessages);

      if (summary) {
        const aiMsg = {
          _id: Date.now().toString(),
          senderId: "AI",
          text: `🧠 ${summary}`,
          type: "summary",
        };
        setMessages((prev) => [...prev, aiMsg]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.error("Lỗi summarize:", err);
    } finally {
      setLoadingSummary(false);
    }
  };
  const renderMessage = ({ item }) => {
    // 🧠 Nếu là tin nhắn AI summary
    if (item.senderId === "AI" || item.type === "summary") {
      return (
        <View style={styles.aiBubble}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setMessages((prev) => prev.filter((msg) => msg._id !== item._id));
            }}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.aiText}>{item.text}</Text>
        </View>
      );
    }

    // 💬 Tin nhắn bình thường
    const senderId = item.senderId?._id || item.senderId;
    const isMe = senderId === user._id;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {!isMe && (
          <Image
            source={{
              uri: receiver?.avatar || "https://via.placeholder.com/28",
            }}
            style={styles.avatarSmall}
          />
        )}
        <View
          style={[
            styles.messageContent,
            isMe ? styles.myMessageContent : styles.otherMessageContent,
          ]}
        >
          <Text style={isMe ? styles.myText : styles.otherText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // Đặt offset là 0 vì header nằm bên trong KAV
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Image
            source={{
              uri: receiver?.avatar || "https://via.placeholder.com/42",
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{receiver?.name || "Người nhận"}</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          // onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={22} color={theme.colors.activeText} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {messages.length >= 7 && (
        <TouchableOpacity
          onPress={handleSummarize}
          style={styles.summarizeButton}
          disabled={loadingSummary}
        >
          <Text style={styles.summarizeText}>
            {loadingSummary ? "🤖 AI đang tóm tắt..." : "🧠 Tóm tắt đoạn chat"}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.card,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 10,
      paddingTop: 10, // Giữ khoảng cách vừa phải cho header
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      marginLeft: 10,
      backgroundColor: colors.inputBg, // Màu nền placeholder
    },
    username: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 10,
      color: colors.text,
    },
    chatContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      // Thêm padding dưới để tin nhắn cuối không bị che lấp
      paddingBottom: 10,
    },
    messageBubble: {
      flexDirection: "row",
      marginBottom: 12,
      alignItems: "flex-end",
    },
    myBubble: {
      justifyContent: "flex-end",
    },
    otherBubble: {
      justifyContent: "flex-start",
    },
    avatarSmall: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 8,
      backgroundColor: colors.inputBg, // Màu nền placeholder
    },
    messageContent: {
      maxWidth: "75%",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    myMessageContent: {
      backgroundColor: colors.primary,
      borderTopRightRadius: 4,
      marginLeft: "auto",
    },
    otherMessageContent: {
      backgroundColor: colors.inputBg,
      borderTopLeftRadius: 4,
    },
    myText: { color: colors.activeText },
    otherText: { color: colors.text },
    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      paddingBottom: Platform.OS === "ios" ? 8 : 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      height: 40,
      backgroundColor: colors.inputBg,
      borderRadius: 20,
      paddingHorizontal: 14,
      marginRight: 8,
      color: colors.text,
      fontSize: 16, // Thêm cỡ chữ cho dễ nhìn
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    aiBubble: {
      backgroundColor: "#FFEFD5",
      borderRadius: 12,
      padding: 10,
      marginVertical: 6,
      alignSelf: "center",
      maxWidth: "90%",
    },
    aiText: {
      fontStyle: "italic",
      color: "#333",
      fontSize: 14,
      textAlign: "center",
    },
    summarizeButton: {
      backgroundColor: "#F97316",
      marginHorizontal: 16,
      marginBottom: 12,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: "center",
    },
    summarizeText: {
      color: "#fff",
      fontWeight: "600",
    },
    closeButton: {
      position: "absolute",
      top: 4,
      right: 6,
      zIndex: 10,
      padding: 4,
    },
    closeText: {
      fontSize: 16,
      color: "#555",
      fontWeight: "bold",
    },
  });
