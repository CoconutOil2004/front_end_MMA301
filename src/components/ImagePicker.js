// components/ImagePicker.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePickerExpo from 'expo-image-picker';
import { useTheme } from "../context/ThemeContext"; // 1. Import

export default function ImagePicker({
  selectedImage,
  onImageSelect,
  onImageRemove,
  isUploading
}) {
  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles động

  // Xin quyền truy cập camera
  const requestCameraPermission = async () => {
    const { status } = await ImagePickerExpo.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập',
        'Ứng dụng cần quyền truy cập camera để chụp ảnh!'
      );
      return false;
    }
    return true;
  };

  // Xin quyền truy cập thư viện ảnh
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập',
        'Ứng dụng cần quyền truy cập thư viện ảnh!'
      );
      return false;
    }
    return true;
  };

  // Chụp ảnh từ camera
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePickerExpo.launchCameraAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại!');
    }
  };

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi khi chọn ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại!');
    }
  };

  // Hiển thị tùy chọn chọn ảnh
  const showImageOptions = () => {
    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn lấy ảnh từ đâu?',
      [
        {
          text: 'Chụp ảnh',
          onPress: takePhoto,
        },
        {
          text: 'Chọn từ thư viện',
          onPress: pickImage,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />

          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.uploadingText}>Đang tải lên...</Text>
            </View>
          )}

          {!isUploading && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onImageRemove}
            >
              <Ionicons name="close-circle" size={32} color={theme.colors.danger} />
            </TouchableOpacity>
          )}

          {!isUploading && (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={showImageOptions}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changeButtonText}>Đổi ảnh</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholderContainer}
          onPress={showImageOptions}
          disabled={isUploading}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera-outline" size={48} color={theme.colors.placeholder}/>
          </View>
          <Text style={styles.placeholderText}>Thêm ảnh</Text>
          <Text style={styles.placeholderSubText}>
            Chụp ảnh hoặc chọn từ thư viện
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// 4. Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
    width: '100%',
    },
    imageContainer: {
    position: 'relative',
    width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBg,
    },
    image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    },
    uploadingOverlay: {
      ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    },
    uploadingText: {
    color: '#fff',
      fontSize: 16,
    fontWeight: '600',
      marginTop: 12,
    },
    removeButton: {
    position: 'absolute',
      top: 12,
      right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 16,
    shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    changeButton: {
    position: 'absolute',
      bottom: 12,
      right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    changeButtonText: {
    color: '#fff',
      fontSize: 14,
    fontWeight: '600',
    },
    placeholderContainer: {
    width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    placeholderText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    placeholderSubText: {
      fontSize: 14,
      color: colors.placeholder,
      marginTop: 4,
    },
  });