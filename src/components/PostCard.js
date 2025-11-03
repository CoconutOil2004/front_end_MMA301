import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking, Modal, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { DEFAULT_AVATAR } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";
import { likePost } from "../service/posts";
import { createReport } from "../service/reports";

export default function PostCard({ post, onPostUpdate }) {
  const { user, avatarUrl } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  
  // State để quản lý like
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => 
      (like._id || like.id || like) === (user?._id || user?.id)
    ) || false
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);

  // State cho Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

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
  const status = post.status || "open";
  const contactPhone = post.contactPhone || "";

  // Xử lý like/unlike
  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      const postId = post._id || post.id;
      const response = await likePost(postId);
      
      if (response.success && response.data) {
        setLikesCount(response.data.likes?.length || newLikesCount);
        setIsLiked(response.data.likes?.some(like => 
          (like._id || like.id || like) === currentUserId
        ) || newIsLiked);
      }

      if (onPostUpdate) {
        onPostUpdate(response.data);
      }
      
    } catch (error) {
      console.error("Error liking post:", error);
      setIsLiked(!isLiked);
      setLikesCount(likesCount);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể thực hiện. Vui lòng thử lại!");
    } finally {
      setIsLiking(false);
    }
  };

  // Xử lý gọi điện thoại
  const handleContactPress = () => {
    if (!contactPhone) {
      Alert.alert("Thông báo", "Không có số điện thoại");
      return;
    }

    Linking.openURL(`tel:${contactPhone}`).catch(err => {
      console.error("Error opening phone app:", err);
      Alert.alert('Lỗi', 'Không thể mở ứng dụng gọi điện');
    });
  };

  // Xử lý gửi báo cáo
  const handleSubmitReport = async () => {
    if (isSubmittingReport) return;

    if (!reportReason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập lý do báo cáo");
      return;
    }

    try {
      setIsSubmittingReport(true);
      
      const reportData = {
        reporterId: currentUserId,
        postId: post._id || post.id,
        reason: reportReason.trim(),
      };

      const response = await createReport(reportData);
      
      if (response.message) {
        Alert.alert("Thành công", "Đã gửi báo cáo thành công!");
        setShowReportModal(false);
        setReportReason(""); // Reset input
      }
      
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Lỗi", 
        error.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại!"
      );
    } finally {
      setIsSubmittingReport(false);
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
      {/* Post Header */}
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
          <TouchableOpacity 
            style={styles.followButton}
            onPress={handleContactPress}
          >
            <Ionicons
              name="call-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.followText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setShowReportModal(true)}
          >
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
              console.log("Error loading post image:", image, e.nativeEvent.error)
            }
          />
          {hasHD && (
            <View style={styles.hdBadge}>
              <Text style={styles.hdText}>HD</Text>
            </View>
          )}
        </View>
      )}

      {/* Post Footer */}
      <View style={styles.postFooter}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={handleLike}
          disabled={isLiking}
        >
          <Ionicons
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={20}
            color={isLiked ? theme.colors.primary : theme.colors.placeholder}
          />
          <Text
            style={[
              styles.footerButtonText,
              isLiked && styles.footerButtonTextActive,
            ]}
          >
            Like {likesCount > 0 ? `(${likesCount})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton}>
          <Ionicons
            name="paper-plane-outline"
            size={20}
            color={theme.colors.placeholder}
          />
          <Text style={styles.footerButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowReportModal(false);
          setReportReason("");
        }}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setShowReportModal(false);
                setReportReason("");
              }}
            />
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Báo cáo bài viết</Text>
                <Text style={styles.modalSubtitle}>
                  Vui lòng cho chúng tôi biết lý do bạn muốn báo cáo bài viết này
                </Text>
              </View>

              {/* Input Reason */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập lý do báo cáo..."
                  placeholderTextColor={theme.colors.placeholder}
                  value={reportReason}
                  onChangeText={setReportReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>{reportReason.length}/500</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    styles.submitButton,
                    (!reportReason.trim() || isSubmittingReport) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmitReport}
                  disabled={!reportReason.trim() || isSubmittingReport}
                >
                  {isSubmittingReport ? (
                    <Text style={styles.submitButtonText}>Đang gửi...</Text>
                  ) : (
                    <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
      marginLeft: 12,
    },
    postNameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    postName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    postDegree: {
      fontSize: 13,
      color: colors.placeholder,
      marginLeft: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3,
    },
    postType: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
    postTitle: {
      fontSize: 13,
      color: colors.placeholder,
      marginLeft: 4,
      flexShrink: 1,
    },
    postMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },
    postTime: {
      fontSize: 13,
      color: colors.placeholder,
    },
    postActions: {
      marginLeft: "auto",
      alignItems: "flex-end",
    },
    followButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: 8,
    },
    followText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 4,
    },
    moreButton: {
      padding: 4,
    },
    statusBadge: {
      backgroundColor: colors.success + "30",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.success,
    },
    postContent: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 10,
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
      backgroundColor: colors.inputBg,
    },
    postImage: {
      width: "100%",
      aspectRatio: 16 / 9,
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
      paddingVertical: 4,
    },
    footerButtonText: {
      fontSize: 14,
      color: colors.placeholder,
      marginLeft: 6,
    },
    footerButtonTextActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    // Modal Styles
    modalSafeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
    },
    modalHeader: {
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: "center",
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.placeholder,
      borderRadius: 2,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.placeholder,
      textAlign: "center",
      lineHeight: 20,
    },
    inputContainer: {
      padding: 20,
    },
    textInput: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      padding: 16,
      fontSize: 15,
      color: colors.text,
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.border,
    },
    characterCount: {
      fontSize: 12,
      color: colors.placeholder,
      textAlign: "right",
      marginTop: 8,
    },
    modalActions: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    submitButtonDisabled: {
      backgroundColor: colors.placeholder,
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#fff",
    },
  });