import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext'; // 👈 Import context

export default function PostCard({ post }) {
  const { user, avatarUrl } = useContext(AuthContext); // 👈 Lấy từ context

  // Safely extract data with fallbacks
  const postUserId = post.userId?._id || post.userId?.id || post.userId;
  const currentUserId = user?._id || user?.id;
  
  // ✅ Nếu là post của user hiện tại, dùng avatarUrl từ context
  const isCurrentUserPost = postUserId === currentUserId;
  const avatar = isCurrentUserPost 
    ? (avatarUrl || user?.avatar || 'https://via.placeholder.com/50')
    : (post.avatar || post.userId?.avatar || 'https://via.placeholder.com/50');
  
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
          source={{ uri: avatar}}
          style={styles.postAvatar}
          key={avatar} // 👈 Force re-render khi avatar thay đổi
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
            <Ionicons name="earth" size={12} color="#666" />
          </View>
        </View>
        
        <View style={styles.postActions}>
          {!isFollowing && (
            <TouchableOpacity style={styles.followButton}>
              <Ionicons name="add" size={18} color="#0A66C2" />
              <Text style={styles.followText}>Contact</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
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
          <Ionicons name="call-outline" size={14} color="#0A66C2" />
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
            color={likesCount > 0 ? "#0A66C2" : "#666"} 
          />
          <Text style={[
            styles.footerButtonText,
            likesCount > 0 && styles.footerButtonTextActive
          ]}>
            Like {likesCount > 0 && `(${likesCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.footerButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="arrow-redo-outline" size={20} color="#666" />
          <Text style={styles.footerButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="paper-plane-outline" size={20} color="#666" />
          <Text style={styles.footerButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
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
    color: '#000',
  },
  postDegree: {
    fontSize: 12,
    color: '#666',
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
    color: '#0A66C2',
  },
  postTitle: {
    fontSize: 12,
    color: '#666',
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
    color: '#666',
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
    color: '#0A66C2',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  statusBadge: {
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
  },
  postContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A66C2',
    marginLeft: 6,
  },
  translationButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
    backgroundColor: '#E0E0E0',
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
    borderTopColor: '#E0E0E0',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  footerButtonTextActive: {
    color: '#0A66C2',
    fontWeight: '600',
  },
});