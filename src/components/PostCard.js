import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext";

export default function PostCard({ post }) {
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles động

  // Safely extract data with fallbacks
  const avatar = post.avatar || post.userId?.avatar || 'https://via.placeholder.com/50';
  const name = post.name || post.userId?.name || 'Anonymous User';
  const degree = post.degree || null;
  const title = post.title || '';
  const timeAgo = post.timeAgo || 'now';
  const isEdited = post.isEdited || false;
  const content = post.content || post.description || '';
  const showTranslation = post.showTranslation || false;
  const image = post.image || post.imageUrl || null;
  const hasHD = post.hasHD || false;
  const isFollowing = post.isFollowing || false;
  const likesCount = post.likes?.length || 0;
  const status = post.status || 'open';
  const contactPhone = post.contactPhone || '';

  // Format post type display
  const getPostTypeDisplay = () => {
    const type = post.type || 'lost';
    const typeMap = {
      'lost': '🔍 Mất đồ',
      'found': '✨ Nhặt được',
      'other': '📌 Khác'
    };
    return typeMap[type] || typeMap['lost'];
  };

  // Format status badge
  const getStatusBadge = () => {
    if (status === 'closed') {
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
              {isEdited && ' · Edited'} · 
            </Text>
            <Ionicons name="earth" size={12} color={theme.colors.placeholder} />
          </View>
        </View>

        <View style={styles.postActions}>
          {!isFollowing && (
            <TouchableOpacity style={styles.followButton}>
              <Ionicons name="add" size={18} color={theme.colors.primary} />
              <Text style={styles.followText}>Contact</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.placeholder} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Badge */}
      {getStatusBadge()}

      {/* Post Content */}
      <Text style={styles.postContent}>{content}</Text>

      {/* Contact Info */}
      {contactPhone && (
        <View style={styles.contactInfo}>
          <Ionicons name="call-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.contactPhone}>{contactPhone}</Text>
        </View>
      )}

      {/* Translation Button */}
      {showTranslation && (
        <TouchableOpacity style={styles.translationButton}>
          <Text style={styles.translationText}>Show translation</Text>
        </TouchableOpacity>
      )}

      {/* Post Image */}
      {image && (
        <View style={styles.postImageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.postImage}
            resizeMode="cover"
          />
          {hasHD && (
            <View style={styles.hdBadge}>
              <Text style={styles.hdText}>HD</Text>
            </View>
          )}
        </View>
      )}

      {/* Post Footer - Actions */}
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons
            name={likesCount > 0 ? "thumbs-up" : "thumbs-up-outline"}
            size={20}
            color={likesCount > 0 ? theme.colors.primary : theme.colors.placeholder}
          />
          <Text
            style={[
              styles.footerButtonText,
              likesCount > 0 && styles.footerButtonTextActive
          ]}>
            Like {likesCount > 0 && `(${likesCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.placeholder} />
          <Text style={styles.footerButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="arrow-redo-outline" size={20} color={theme.colors.placeholder} />
          <Text style={styles.footerButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="paper-plane-outline" size={20} color={theme.colors.placeholder} />
          <Text style={styles.footerButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. Hàm styles động
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
    flexDirection: 'row',
      marginBottom: 12,
    },
    postAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBg,
    },
    postInfo: {
      flex: 1,
      marginLeft: 8,
    },
    postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    },
    postName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    postDegree: {
      fontSize: 12,
      color: colors.placeholder,
      marginLeft: 4,
    },
    titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
      marginTop: 2,
    },
    postType: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    postTitle: {
      fontSize: 12,
      color: colors.placeholder,
      marginLeft: 4,
      flex: 1,
    },
    postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
      marginTop: 4,
    },
    postTime: {
      fontSize: 12,
      color: colors.placeholder,
    },
    postActions: {
    alignItems: 'flex-end',
    },
    followButton: {
    flexDirection: 'row',
    alignItems: 'center',
      marginBottom: 8,
    },
    followText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 4,
    },
    moreButton: {
      padding: 4,
    },
    statusBadge: {
      backgroundColor: colors.success + "30", // Thêm độ mờ
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    alignSelf: 'flex-start',
      marginBottom: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.success,
    },
    postContent: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    contactInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + "20", // Thêm độ mờ
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.primary + "50",
    },
    contactPhone: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 6,
    },
    translationButton: {
    alignSelf: 'flex-start',
      marginBottom: 12,
    },
    translationText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.placeholder,
    },
    postImageContainer: {
    position: 'relative',
      borderRadius: 8,
    overflow: 'hidden',
      marginBottom: 12,
    },
    postImage: {
    width: '100%',
      height: 400,
      backgroundColor: colors.inputBg,
    },
    hdBadge: {
    position: 'absolute',
      top: 8,
      left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    hdText: {
    color: '#fff',
      fontSize: 12,
    fontWeight: '600',
    },
    postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    },
    footerButtonText: {
      fontSize: 14,
      color: colors.placeholder,
      marginLeft: 4,
    },
    footerButtonTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
  });