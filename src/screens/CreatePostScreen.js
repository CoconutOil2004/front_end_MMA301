import React, { useState, useEffect,useContext } from 'react';
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
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../service';
import ImagePicker from '../components/ImagePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLOUDINARY_CONFIG } from '../../config/cloudinary.config';
import { AuthContext } from "../context/AuthContext";
import { DEFAULT_AVATAR } from "../utils/constants"; // 👈 Import
export default function CreatePostScreen({ navigation }) {
  const { logout, user, avatarUrl, updateAvatar } = useContext(AuthContext);
  const [type, setType] = useState('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState({
    placeName: '',
    lat: null,
    lng: null,
  });
  const displayAvatar = avatarUrl || user?.avatar || DEFAULT_AVATAR;
  const [userInfo, setUserInfo] = useState({
    name: 'Người dùng',
    avatar: null,
  });
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const postTypes = [
    { value: 'lost', label: 'Đã mất', icon: 'sad-outline', color: '#EF4444' },
    { value: 'found', label: 'Tìm thấy', icon: 'happy-outline', color: '#10B981' },
    { value: 'picked', label: 'Đã nhặt', icon: 'hand-left-outline', color: '#3B82F6' },
    { value: 'returned', label: 'Đã trả', icon: 'checkmark-circle-outline', color: '#8B5CF6' },
  ];

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserInfo({
          name: userData.name || 'Người dùng',
          avatar: userData.avatar || null,
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
    }
  };

  /**
   * Upload ảnh lên Cloudinary
   * @param {string} uri - URI của ảnh từ ImagePicker
   * @returns {Promise<string>} - URL của ảnh đã upload
   */
  const uploadImageToCloudinary = async (uri) => {
    setIsUploading(true);

    try {
      // Tạo FormData để upload
      const formData = new FormData();

      // Lấy tên file và extension
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Thêm file vào FormData
      formData.append('file', {
        uri: uri,
        type: type,
        name: filename || `photo_${Date.now()}.jpg`,
      });

      // Thêm upload preset
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

      // Thêm folder (tùy chọn)
      formData.append('folder', 'lost-and-found');

      // Thêm timestamp cho unique filename
      formData.append('public_id', `post_${Date.now()}`);

      console.log('Đang upload ảnh lên Cloudinary...');

      // Gửi request lên Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload thất bại');
      }

      console.log('Upload thành công:', data.secure_url);
      setIsUploading(false);

      // Trả về URL ảnh
      return data.secure_url;

    } catch (error) {
      console.error('Lỗi upload ảnh lên Cloudinary:', error);
      setIsUploading(false);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại!');
    }
  };

  // Validate dữ liệu
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề!');
      return false;
    }
    if (title.trim().length < 5) {
      Alert.alert('Lỗi', 'Tiêu đề phải có ít nhất 5 ký tự!');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả!');
      return false;
    }
    if (description.trim().length < 10) {
      Alert.alert('Lỗi', 'Mô tả phải có ít nhất 10 ký tự!');
      return false;
    }
    if (!selectedImage) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh!');
      return false;
    }
    if (contactPhone.trim() && !/^[0-9]{10,11}$/.test(contactPhone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ! (10-11 chữ số)');
      return false;
    }
    return true;
  };

  const handlePost = async () => {
    if (!validateForm()) {
      return;
    }

    setIsPosting(true);
    let imageUrl = null;

    try {
      // 1. Upload ảnh lên Cloudinary
      console.log('Đang tải ảnh lên Cloudinary...');
      imageUrl = await uploadImageToCloudinary(selectedImage);
      console.log('URL ảnh:', imageUrl);

      // 2. Chuẩn bị dữ liệu bài viết
      const postData = {
        type,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl,
      };

      // Thêm số điện thoại nếu có
      if (contactPhone.trim()) {
        postData.contactPhone = contactPhone.trim();
      }

      // Thêm location nếu có
      if (location.placeName && location.placeName.trim()) {
        postData.location = {
          placeName: location.placeName.trim(),
          lat: location.lat || null,
          lng: location.lng || null,
        };
      }

      console.log('Dữ liệu gửi đi:', postData);

      // 3. Gọi API tạo bài viết
      const response = await createPost(postData);
      console.log('Phản hồi từ server:', response);

      // 4. Thông báo thành công
      Alert.alert(
        'Thành công',
        'Bài viết đã được đăng!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Lỗi đăng bài:', error);

      // Xử lý lỗi chi tiết
      let errorMessage = 'Không thể đăng bài. Vui lòng thử lại!';

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        console.error('Lỗi từ server:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!';
        console.error('Không nhận được phản hồi:', error.request);
      } else {
        errorMessage = error.message || errorMessage;
        console.error('Lỗi:', error.message);
      }

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedImage(null);
    setContactPhone('');
    setLocation({ placeName: '', lat: null, lng: null });
    setType('lost');
  };

  const handleImageSelect = (imageUri) => {
    setSelectedImage(imageUri);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const getCurrentType = () => {
    return postTypes.find(t => t.value === type);
  };

  const isButtonDisabled =
    isPosting ||
    isUploading ||
    !title.trim() ||
    !description.trim() ||
    !selectedImage;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity
            style={[styles.postButton, isButtonDisabled && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={isButtonDisabled}
          >
            {(isPosting || isUploading) ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Đăng</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Info */}
          <View style={styles.userInfo}>
            <Image
              style={styles.avatar}
              source={{ uri: displayAvatar }}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userInfo.name}</Text>

              {/* Post Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: getCurrentType().color + '20' }
                  ]}
                  onPress={() => setShowBottomSheet(true)}
                >
                  <Ionicons
                    name={getCurrentType().icon}
                    size={16}
                    color={getCurrentType().color}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: getCurrentType().color }
                    ]}
                  >
                    {getCurrentType().label}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={getCurrentType().color}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Tiêu đề (ví dụ: Mất ví da màu đen)"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{title.length}/100</Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Mô tả chi tiết về vật phẩm..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.characterCount}>{description.length}/2000</Text>
          </View>

          {/* Image Picker */}
          <View style={styles.imagePickerWrapper}>
            <ImagePicker
              selectedImage={selectedImage}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              isUploading={isUploading}
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <TextInput
                style={styles.phoneInput}
                placeholder="Số điện thoại liên hệ (tùy chọn)"
                placeholderTextColor="#9CA3AF"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <TextInput
                style={styles.phoneInput}
                placeholder="Địa điểm (tùy chọn)"
                placeholderTextColor="#9CA3AF"
                value={location.placeName}
                onChangeText={(text) =>
                  setLocation({ ...location, placeName: text })
                }
                maxLength={200}
              />
            </View>
          </View>

          {/* Loading Indicator */}
          {(isPosting || isUploading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0A66C2" />
              <Text style={styles.loadingText}>
                {isUploading ? 'Đang tải ảnh lên...' : 'Đang đăng bài...'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Sheet for Post Type Selection */}
        <Modal
          visible={showBottomSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBottomSheet(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBottomSheet(false)}
          >
            <View
              style={styles.bottomSheet}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>Chọn loại bài viết</Text>

              {postTypes.map((postType) => (
                <TouchableOpacity
                  key={postType.value}
                  style={[
                    styles.bottomSheetItem,
                    type === postType.value && styles.bottomSheetItemSelected
                  ]}
                  onPress={() => {
                    setType(postType.value);
                    setShowBottomSheet(false);
                  }}
                >
                  <View
                    style={[
                      styles.typeIconContainer,
                      { backgroundColor: postType.color + '20' }
                    ]}
                  >
                    <Ionicons
                      name={postType.icon}
                      size={24}
                      color={postType.color}
                    />
                  </View>
                  <Text style={styles.bottomSheetItemText}>
                    {postType.label}
                  </Text>
                  {type === postType.value && (
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color={postType.color}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A66C2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  imagePickerWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    marginTop: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingVertical: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    paddingVertical: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  bottomSheetItemSelected: {
    backgroundColor: '#F3F2EF',
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});