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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { getMessages, sendMessage } from "../service";

export default function ChatDetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { conversationId, receiver } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);
  console.log("🧾 route.params:", route.params);
  console.log("👤 receiver:", receiver);
  console.log("🪪 user:", user);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages(conversationId);
        setMessages(data);
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

  const renderMessage = ({ item }) => {
    const isMe = item.senderId._id === user._id;
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {!isMe && (
          <Image source={{ uri: receiver?.avatar }} style={styles.avatarSmall} />
        )}
        <View
          style={[
            styles.messageContent,
            isMe ? styles.myMessageContent : styles.otherMessageContent,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myText : styles.otherText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Image source={{ uri: receiver?.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{receiver?.name}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  avatar: { width: 42, height: 42, borderRadius: 21, marginLeft: 10 },
  username: { fontSize: 18, fontWeight: "600", marginLeft: 10 },
  chatContainer: { padding: 16 },
  messageBubble: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  myBubble: { justifyContent: "flex-end" },
  otherBubble: { justifyContent: "flex-start" },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  messageContent: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myMessageContent: {
    backgroundColor: "#0A66C2",
    borderTopRightRadius: 4,
    marginLeft: "auto",
  },
  otherMessageContent: { backgroundColor: "#E8E8E8", borderTopLeftRadius: 4 },
  myText: { color: "#fff" },
  otherText: { color: "#111" },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#0A66C2",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
