import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { DEFAULT_AVATAR } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { createOrGetConversation } from "../service";
export default function PostCard({ post }) {
  const { user, avatarUrl } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  const navigation = useNavigation();
  const [startingChat, setStartingChat] = useState(false);
  const postUserId = post.userId?._id || post.userId?.id || post.userId;
  const currentUserId = user?._id || user?.id;
  const defaultAvatarUri = DEFAULT_AVATAR || "https://via.placeholder.com/48";
  const isCurrentUserPost = postUserId === currentUserId;
  const avatar = isCurrentUserPost
    ? avatarUrl || user?.avatar || defaultAvatarUri
    : post.avatar || post.userId?.avatar || defaultAvatarUri;

  const name = post.name || post.userId?.name || "Anonymous User";
  const degree = post.degree || null;
  const title = post.title || "";
  const timeAgo = post.timeAgo || "now";
  const isEdited = post.isEdited || false;
  const content = post.content || post.description || "";
  const showTranslation = post.showTranslation || false;
  const image = post.image || post.imageUrl || null;
  const hasHD = post.hasHD || false;
  const isFollowing = post.isFollowing || false;
  const likesCount = post.likes?.length || 0;
  const status = post.status || "open";
  const contactPhone = post.contactPhone || "";

  const postOwner = useMemo(
    () => ({
      _id: postUserId,
      name,
      avatar,
      phone: contactPhone,
    }),
    [avatar, contactPhone, name, postUserId]
  );

  const handleSendPress = async () => {
    if (startingChat) return;

    if (!currentUserId) {
      Alert.alert("Bạn cần đăng nhập", "Đăng nhập để nhắn tin với người đăng bài.");
      return;
    }

    if (!postUserId) {
      Alert.alert("Không tìm thấy người nhận", "Bài viết chưa có thông tin người đăng.");
      return;
    }

    if (postUserId === currentUserId) {
      Alert.alert("Thông báo", "Bạn không thể nhắn tin với chính mình.");
      return;
    }

    try {
      setStartingChat(true);
      const conversation = await createOrGetConversation(currentUserId, postUserId);
      if (!conversation?._id) {
        throw new Error("Conversation response missing id");
      }

      const receiverFromConversation = conversation.participants?.find(
        (participant) => {
          const participantId = participant?._id || participant;
          return participantId && participantId !== currentUserId;
        }
      );

      const receiver = receiverFromConversation
        ? {
            _id: receiverFromConversation._id || receiverFromConversation,
            name: receiverFromConversation.name || postOwner.name,
            avatar: receiverFromConversation.avatar || postOwner.avatar,
            phone: receiverFromConversation.phone || postOwner.phone,
          }
        : (typeof post.userId === "object" && {
            _id: post.userId._id || post.userId.id,
            name: post.userId.name || postOwner.name,
            avatar: post.userId.avatar || postOwner.avatar,
            phone: post.userId.phone || postOwner.phone,
          }) || postOwner;

      navigation.navigate("ChatDetail", {
        conversationId: conversation._id,
        receiver,
        originPost: {
          id: post.id || post._id || conversation._id,
          title,
        },
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      Alert.alert("Không thể mở đoạn chat", "Vui lòng thử lại sau.");
    } finally {
      setStartingChat(false);
    }
  };

  const getPostTypeDisplay = () => {
    const type = post.type || "lost";
    const typeMap = {
      lost: "🔍 Mất đồ",
      found: "✨ Nhặt được",
      other: "📌 Khác",
    };
    return typeMap[type] || typeMap["lost"];
  };
  const getStatusBadge = () => {
    if (status === "closed") {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✓ Đã giải quyết</Text>
        </View>
      );
    }
    return null;
  };
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: avatar }}
          style={styles.postAvatar}
          onError={(e) =>
            console.log("Error loading avatar:", avatar, e.nativeEvent.error)
          }
        />
        <View style={styles.postInfo}>
          <View style={styles.postNameRow}>
            <Text style={styles.postName}>{name}</Text>
            {degree && <Text style={styles.postDegree}>· {degree}</Text>}
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.postType}>{getPostTypeDisplay()}</Text>
            {title && (
              <Text style={styles.postTitle} numberOfLines={1}>
                · {title}
              </Text>
            )}
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.postTime}>
              {timeAgo}
              {isEdited && " · Edited"} ·
            </Text>
            <Ionicons name="earth" size={12} color={theme.colors.placeholder} />
          </View>
        </View>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.followButton}>
            <Ionicons
              name="call-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.followText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        </View>
      </View>
      {getStatusBadge()}
      <Text style={styles.postContent}>{content}</Text>
      {contactPhone ? (
        <View style={styles.contactInfo}>
          <Ionicons
            name="call-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text style={styles.contactPhone}>{contactPhone}</Text>
        </View>
      ) : null}
      {showTranslation && (
        <TouchableOpacity style={styles.translationButton}>
          <Text style={styles.translationText}>Show translation</Text>
        </TouchableOpacity>
      )}
      {image && (
        <View style={styles.postImageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.postImage}
            resizeMode="cover"
            onError={(e) =>
              console.log(
                "Error loading post image:",
                image,
                e.nativeEvent.error
              )
            } // Debug lỗi ảnh
          />
          {hasHD && (
            <View style={styles.hdBadge}>
              <Text style={styles.hdText}>HD</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons
            name={likesCount > 0 ? "thumbs-up" : "thumbs-up-outline"}
            size={20}
            color={
              likesCount > 0 ? theme.colors.primary : theme.colors.placeholder
            }
          />
          <Text
            style={[
              styles.footerButtonText,
              likesCount > 0 && styles.footerButtonTextActive,
            ]}
          >
            Like {likesCount > 0 ? `(${likesCount})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleSendPress}
          disabled={startingChat}
        >
          {startingChat ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons
              name="paper-plane-outline"
              size={20}
              color={theme.colors.placeholder}
            />
          )}
          <Text
            style={[
              styles.footerButtonText,
              startingChat && styles.footerButtonTextDisabled,
            ]}
          >
            {startingChat ? "Đang mở" : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    postCard: {
      backgroundColor: colors.card,
      marginTop: 8,
      padding: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    postHeader: {
      flexDirection: "row",
      marginBottom: 12,
      alignItems: "center",
    },
    postAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBg,
    },
    postInfo: {
      flex: 1,
      marginLeft: 12, // Tăng khoảng cách
    },
    postNameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    postName: {
      fontSize: 15, // Tăng cỡ chữ
      fontWeight: "600",
      color: colors.text,
    },
    postDegree: {
      fontSize: 13, // Tăng cỡ chữ
      color: colors.placeholder,
      marginLeft: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3, // Tăng khoảng cách
    },
    postType: {
      fontSize: 13, // Tăng cỡ chữ
      fontWeight: "600",
      color: colors.primary,
    },
    postTitle: {
      fontSize: 13, // Tăng cỡ chữ
      color: colors.placeholder,
      marginLeft: 4,
      flexShrink: 1, // Cho phép text co lại nếu quá dài
    },
    postMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5, // Tăng khoảng cách
    },
    postTime: {
      fontSize: 13, // Tăng cỡ chữ
      color: colors.placeholder,
    },
    postActions: {
      marginLeft: "auto", // Đẩy nút sang phải
      alignItems: "flex-end",
    },
    followButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4, // Thêm padding cho dễ bấm
      paddingHorizontal: 8,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: 8, // Giảm khoảng cách dưới
    },
    followText: {
      fontSize: 13, // Giảm cỡ chữ
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 4,
    },
    moreButton: {
      padding: 4, // Tăng vùng bấm
    },
    statusBadge: {
      backgroundColor: colors.success + "30",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: "flex-start",
      marginBottom: 10, // Tăng khoảng cách
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.success,
    },
    postContent: {
      fontSize: 15, // Tăng cỡ chữ
      color: colors.text,
      lineHeight: 22, // Tăng khoảng cách dòng
      marginBottom: 10, // Tăng khoảng cách
    },
    contactInfo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "15", // Giảm độ đậm nền
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 10, // Tăng khoảng cách
      borderWidth: 1,
      borderColor: colors.primary + "40", // Giảm độ đậm viền
      alignSelf: "flex-start", // Chỉ rộng bằng nội dung
    },
    contactPhone: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 6,
    },
    translationButton: {
      alignSelf: "flex-start",
      marginBottom: 12,
    },
    translationText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.placeholder,
    },
    postImageContainer: {
      position: "relative",
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 12,
      backgroundColor: colors.inputBg, // Thêm màu nền
    },
    postImage: {
      width: "100%",
      aspectRatio: 16 / 9, // Tỉ lệ phổ biến hơn
      // height: 400, // Bỏ height cố định, dùng aspectRatio
    },
    hdBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    hdText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },
    postFooter: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4, // Thêm padding cho dễ bấm
    },
    footerButtonText: {
      fontSize: 14,
      color: colors.placeholder,
      marginLeft: 6, // Tăng khoảng cách
    },
    footerButtonTextDisabled: {
      color: colors.placeholder,
      opacity: 0.7,
    },
    footerButtonTextActive: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
