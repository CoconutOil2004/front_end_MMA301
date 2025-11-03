// src/screens/EditProfileScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { useNavigation } from '@react-navigation/native';
import { DEFAULT_AVATAR } from '../utils/constants'; // Import avatar mặc định

// Component con InputRow (thêm keyboardType)
const InputRow = ({ label, value, onChangeText, multiline = false, placeholder, styles, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={multiline ? styles.inputMultiline : styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={styles.label.color}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
      keyboardType={keyboardType}
    />
  </View>
);

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  const navigation = useNavigation();
  
  // Lấy đúng các hàm từ context
  const { user, updateProfile, updateAvatar, getDisplayAvatar } = useContext(AuthContext); 

  // --- SỬA STATE ĐỂ KHỚP VỚI BACKEND ---
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || ''); // THÊM phone
  const [bio, setBio] = useState(user?.bio || user?.about || ''); // SỬA about -> bio
  // (Bỏ headline và location vì backend không nhận)
  
  const [avatar, setAvatar] = useState(getDisplayAvatar()); // State avatar riêng
  
  const [isUploading, setIsUploading] = useState(false); // Loading khi upload ảnh
  const [isSaving, setIsSaving] = useState(false); // Loading khi bấm Lưu

  // Hàm xử lý chọn ảnh
  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Tải ảnh lên Cloudinary VÀ cập nhật backend ngay khi chọn
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi chọn ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  // --- SỬA HÀM TẢI AVATAR LÊN ---
  const handleUploadAvatar = async (uri) => {
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const userId = user?._id || user?.id || 'unknown';
      
      // 1. Tải lên Cloudinary
      const response = await uploadToCloudinary(uri, {
        folder: 'avatars',
        publicId: `avatar_${userId}_${timestamp}`,
      });
      if (!response?.secure_url) {
        throw new Error('Upload ảnh lên Cloudinary thất bại.');
      }
      
      const newAvatarUrl = `${response.secure_url}?t=${timestamp}`;
      
      // 2. Gọi hàm updateAvatar từ context (để gọi API /update-avatar)
      await updateAvatar(newAvatarUrl); 
      
      // 3. Cập nhật UI ngay lập tức
      setAvatar(newAvatarUrl); 
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
      
    } catch (error) {
      console.error('❌ Lỗi tải avatar lên:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải avatar lên.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- SỬA HÀM LƯU (CHỈ LƯU TEXT) ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Chỉ chuẩn bị data text mà backend nhận
      const updatedData = {
        name,
        phone,
        bio,
        // education: (bạn có thể thêm trường này nếu muốn)
      };
      
      // 2. Gọi hàm updateProfile từ AuthContext (để gọi API /update)
      await updateProfile(updatedData);
      
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
      navigation.goBack(); // Quay lại trang Profile
      
    } catch (error) {
      console.error('Lỗi lưu thông tin:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header (Nút Lưu chỉ gọi handleSave) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSave} disabled={isSaving || isUploading}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Giúp input không bị mất focus
      >
        {/* Phần Avatar (Nút Đổi ảnh chỉ gọi handleImagePick) */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar || DEFAULT_AVATAR }} style={styles.profilePhoto} />
          <TouchableOpacity 
            style={styles.editAvatarButton} 
            onPress={handleImagePick} 
            disabled={isUploading} // Vô hiệu hóa khi đang upload
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.editAvatarText}>Đổi ảnh</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* --- SỬA LẠI CÁC TRƯỜNG INPUT --- */}
        <View style={styles.card}>
          <InputRow
            label="Họ và tên"
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ tên của bạn"
            styles={styles}
          />
          <InputRow
            label="Số điện thoại" // THÊM SĐT
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại liên lạc"
            styles={styles}
            keyboardType="phone-pad" // Bàn phím số
          />
          {/* (Đã BỎ headline và location) */}
        </View>

        {/* Card Giới thiệu (SỬA thành bio) */}
        <View style={styles.card}>
          <InputRow
            label="Giới thiệu (Bio)" // SỬA TÊN
            value={bio} // SỬA STATE
            onChangeText={setBio} // SỬA STATE
            placeholder="Viết một chút về bản thân bạn..."
            multiline={true}
            styles={styles}
          />
        </View>
        
        {/* Card Email (Hiển thị, không sửa) */}
         <View style={styles.card}>
            <Text style={styles.label}>Email (Không thể thay đổi)</Text>
            <Text style={[styles.input, styles.readOnlyInput]}>{user?.email || ''}</Text>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Hàm styles động (Cập nhật style cho input)
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerButton: {
      padding: 4,
      minWidth: 40,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 24,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
    },
    profilePhoto: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.inputBg,
      marginBottom: 16,
    },
    editAvatarButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editAvatarText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    card: {
      backgroundColor: colors.card,
      marginBottom: 8,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      color: colors.placeholder,
      marginBottom: 6,
    },
    input: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputMultiline: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      height: 100,
    },
    // Style cho trường chỉ đọc (Email)
    readOnlyInput: {
        backgroundColor: colors.background, // Nền xám hơn
        color: colors.placeholder, // Chữ mờ
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    infoTextContainer: {
      marginLeft: 16,
      flex: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    infoSubText: {
      fontSize: 14,
      color: colors.placeholder,
    },
    infoDate: {
      fontSize: 13,
      color: colors.placeholder,
      marginTop: 2,
    },
    noteText: {
        fontSize: 12,
        color: colors.placeholder,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 16,
    }
  });