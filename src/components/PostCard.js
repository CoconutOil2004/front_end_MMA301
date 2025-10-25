import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PostCard({ post }) {
  const {
    avatar,
    name,
    degree,
    title,
    timeAgo,
    isEdited,
    content,
    showTranslation,
    image,
    hasHD,
    isFollowing,
  } = post;

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
          <Text style={styles.postTitle} numberOfLines={1}>
            {title}
          </Text>
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
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{content}</Text>

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
          <Ionicons name="thumbs-up-outline" size={20} color="#666" />
          <Text style={styles.footerButtonText}>Like</Text>
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
  postTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  postContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
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
    height: 200,
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
});