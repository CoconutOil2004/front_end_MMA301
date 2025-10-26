import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../service';
import ImagePicker from '../components/ImagePicker';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài viết!');
      return;
    }

    setIsPosting(true);
    
    try {
      const postData = {
        content: content.trim(),
        image: selectedImage,
        privacy: 'public', // Có thể thêm tùy chọn privacy sau
      };
      
      await createPost(postData);
      
      Alert.alert('Thành công', 'Bài viết đã được đăng!');
      
      // Reset form
      setContent('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Lỗi đăng bài:', error);
      const errorMessage = error.response?.data?.message || 'Không thể đăng bài. Vui lòng thử lại!';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = (imageUri) => {
    setSelectedImage(imageUri);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity 
            style={[styles.postButton, isPosting && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={isPosting}
          >
            <Text style={styles.postButtonText}>
              {isPosting ? 'Đang đăng...' : 'Đăng'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Nguyễn Văn A</Text>
            <Text style={styles.userTitle}>Software Engineer at FPT Software</Text>
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.characterCount}>
            {content.length}/2000
          </Text>
        </View>

        {/* Image Picker */}
        <ImagePicker
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleImageSelect}>
            <Ionicons name="image-outline" size={24} color="#0A66C2" />
            <Text style={styles.actionButtonText}>Ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="videocam-outline" size={24} color="#0A66C2" />
            <Text style={styles.actionButtonText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-outline" size={24} color="#0A66C2" />
            <Text style={styles.actionButtonText}>Tài liệu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={24} color="#0A66C2" />
            <Text style={styles.actionButtonText}>Sự kiện</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Settings */}
        <View style={styles.privacyContainer}>
          <View style={styles.privacyRow}>
            <Ionicons name="earth-outline" size={20} color="#666" />
            <Text style={styles.privacyText}>Mọi người</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2EF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  postButton: {
    backgroundColor: '#0A66C2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  userTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contentInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F2EF',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#0A66C2',
    fontWeight: '500',
  },
  privacyContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  privacyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});
