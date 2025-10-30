// src/screens/CreatePostScreen.js
import React, { useState, useEffect, useContext } from "react";
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
import { useTheme } from "../context/ThemeContext"; // Import useTheme
import { AuthContext } from "../context/AuthContext";
// Giả sử bạn có file này, nếu không thì dùng URL placeholder
import { DEFAULT_AVATAR } from "../utils/constants";

export default function CreatePostScreen({ navigation }) {
  // --- SỬA LỖI: Di chuyển useContext lên đầu ---
  const { user } = useContext(AuthContext); // Lấy user trước
  const { theme } = useTheme(); // Lấy theme
  const styles = getStyles(theme.colors); // Tạo styles
  // --- KẾT THÚC SỬA LỖI ---

  // Lấy các giá trị khác từ AuthContext nếu cần (ví dụ avatarUrl)
  // Lưu ý: AuthContext của bạn không có avatarUrl, nên dòng dưới có thể gây lỗi
  // const { avatarUrl } = useContext(AuthContext);

  const [type, setType] = useState('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [contactPhone, setContactPhone] = useState("");
  const [location, setLocation] = useState({
    placeName: "",
    lat: null,
    lng: null,
  });

  // Sử dụng user đã lấy được ở trên
  const displayAvatar = user?.avatar || DEFAULT_AVATAR || 'https://via.placeholder.com/48'; // Thêm fallback cuối

  // State userInfo có thể không cần thiết nữa nếu bạn dùng trực tiếp 'user' từ context
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "Người dùng", // Lấy tên từ context user
    avatar: displayAvatar, // Lấy avatar đã tính toán
  });

  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const postTypes = [
    { value: "lost", label: "Đã mất", icon: "sad-outline", color: theme.colors.danger },
    { value: "found", label: "Tìm thấy", icon: "happy-outline", color: theme.colors.success },
    { value: "picked", label: "Đã nhặt", icon: "hand-left-outline", color: "#3B82F6" },
    { value: "returned", label: "Đã trả", icon: "checkmark-circle-outline", color: "#8B5CF6" },
  ];

  // Bỏ useEffect loadUserInfo vì đã lấy trực tiếp từ context user
  // useEffect(() => {
  //   loadUserInfo();
  // }, []);
  // const loadUserInfo = async () => { ... };

  // Cập nhật lại userInfo nếu user từ context thay đổi (ví dụ sau khi login/profile update)
  useEffect(() => {
     if(user) {
        setUserInfo({
            name: user.name || "Người dùng",
            avatar: user.avatar || DEFAULT_AVATAR || 'https://via.placeholder.com/48'
        })
     }
  }, [user])


  // ... (Các hàm uploadImageToCloudinary, validateForm, handlePost, resetForm, v.v. giữ nguyên) ...
  const uploadImageToCloudinary = async (uri) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("file", { uri: uri, type: type, name: filename || `photo_${Date.now()}.jpg` });
      formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append("folder", "lost-and-found");
      formData.append("public_id", `post_${Date.now()}`);
      const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
        method: "POST", body: formData, headers: { "Content-Type": "multipart/form-data" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload thất bại");
      console.log('Upload thành công:', data.secure_url);
      setIsUploading(false);
      return data.secure_url;
    } catch (error) {
      console.error("Lỗi upload ảnh lên Cloudinary:", error);
      setIsUploading(false);
      throw new Error("Không thể tải ảnh lên. Vui lòng thử lại!");
    }
  };

  const validateForm = () => {
    // ... logic validation ...
    if (!title.trim()) { Alert.alert("Lỗi", "Vui lòng nhập tiêu đề!"); return false; }
    if (title.trim().length < 5) { Alert.alert("Lỗi", "Tiêu đề phải có ít nhất 5 ký tự!"); return false; }
    if (!description.trim()) { Alert.alert("Lỗi", "Vui lòng nhập mô tả!"); return false; }
    if (description.trim().length < 10) { Alert.alert("Lỗi", "Mô tả phải có ít nhất 10 ký tự!"); return false; }
    if (!selectedImage) { Alert.alert("Lỗi", "Vui lòng chọn ảnh!"); return false; }
    if (contactPhone.trim() && !/^[0-9]{10,11}$/.test(contactPhone.trim())) { Alert.alert("Lỗi", "Số điện thoại không hợp lệ! (10-11 chữ số)"); return false; }
    return true;
  };

  const handlePost = async () => {
    if (!validateForm()) return;
    setIsPosting(true);
    let imageUrl = null;
    try {
      imageUrl = await uploadImageToCloudinary(selectedImage);
      const postData = { type, title: title.trim(), description: description.trim(), imageUrl: imageUrl };
      if (contactPhone.trim()) postData.contactPhone = contactPhone.trim();
      if (location.placeName && location.placeName.trim()) {
        postData.location = { placeName: location.placeName.trim(), lat: location.lat || null, lng: location.lng || null };
      }
      console.log('Dữ liệu gửi đi:', postData);
      const response = await createPost(postData);
      console.log('Phản hồi từ server:', response);
      Alert.alert("Thành công", "Bài viết đã được đăng!", [{ text: "OK", onPress: () => { resetForm(); navigation.navigate("Home"); } }], { cancelable: false });
    } catch (error) {
      console.error('Lỗi đăng bài:', error);
      let errorMessage = 'Không thể đăng bài. Vui lòng thử lại!';
      if (error.response) errorMessage = error.response.data?.message || errorMessage;
      else if (error.request) errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!';
      else errorMessage = error.message || errorMessage;
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const resetForm = () => { /* ... */ };
  const handleImageSelect = (imageUri) => setSelectedImage(imageUri);
  const handleImageRemove = () => setSelectedImage(null);
  const getCurrentType = () => postTypes.find((t) => t.value === type) || postTypes[0]; // Thêm fallback
  const isButtonDisabled = isPosting || isUploading || !title.trim() || !description.trim() || !selectedImage;


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity
            style={[
              styles.postButton,
              isButtonDisabled && styles.postButtonDisabled,
            ]}
            onPress={handlePost}
            disabled={isButtonDisabled}
          >
            {isPosting || isUploading ? (
              <ActivityIndicator color={theme.colors.activeText} size="small" />
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
              source={{ uri: userInfo.avatar }} // Lấy từ state userInfo đã cập nhật
              onError={(e) => console.log('Lỗi tải avatar userInfo:', userInfo.avatar, e.nativeEvent.error)}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              {/* Post Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: (getCurrentType()?.color || theme.colors.primary) + "20" }, // Thêm fallback màu
                  ]}
                  onPress={() => setShowBottomSheet(true)}
                >
                  <Ionicons
                    name={getCurrentType()?.icon || 'alert-circle-outline'} // Thêm fallback icon
                    size={16}
                    color={getCurrentType()?.color || theme.colors.primary} // Thêm fallback màu
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: getCurrentType()?.color || theme.colors.primary }, // Thêm fallback màu
                    ]}
                  >
                    {getCurrentType()?.label || 'Chọn loại'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={getCurrentType()?.color || theme.colors.primary} // Thêm fallback màu
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ... (Các Input fields và Modal giữ nguyên) ... */}
           {/* Title Input */}
           <View style={styles.inputContainer}>
             <TextInput
               style={styles.titleInput}
               placeholder="Tiêu đề (ví dụ: Mất ví da màu đen)"
               placeholderTextColor={theme.colors.placeholder}
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
               placeholderTextColor={theme.colors.placeholder}
               value={description}
               onChangeText={setDescription}
               multiline
               textAlignVertical="top"
               maxLength={2000}
             />
             <Text style={styles.characterCount}>
               {description.length}/2000
             </Text>
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
               <Ionicons
                 name="call-outline"
                 size={20}
                 color={theme.colors.placeholder}
               />
               <TextInput
                 style={styles.phoneInput}
                 placeholder="Số điện thoại liên hệ (tùy chọn)"
                 placeholderTextColor={theme.colors.placeholder}
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
               <Ionicons
                 name="location-outline"
                 size={20}
                 color={theme.colors.placeholder}
               />
               <TextInput
                 style={styles.phoneInput}
                 placeholder="Địa điểm (tùy chọn)"
                 placeholderTextColor={theme.colors.placeholder}
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
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                {isUploading ? "Đang tải ảnh lên..." : "Đang đăng bài..."}
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
               onStartShouldSetResponder={() => true} // Ngăn TouchableOpacity bên ngoài đóng modal khi chạm vào sheet
             >
               <View style={styles.bottomSheetHandle} />
               <Text style={styles.bottomSheetTitle}>Chọn loại bài viết</Text>

               {postTypes.map((postType) => (
                 <TouchableOpacity
                   key={postType.value}
                   style={[
                     styles.bottomSheetItem,
                     type === postType.value && styles.bottomSheetItemSelected,
                   ]}
                   onPress={() => {
                     setType(postType.value);
                     setShowBottomSheet(false);
                   }}
                 >
                   <View
                     style={[
                       styles.typeIconContainer,
                       { backgroundColor: postType.color + "20" },
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

// Hàm styles động (giữ nguyên)
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
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    postButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 70,
      justifyContent: "center",
    },
    postButtonDisabled: {
      backgroundColor: colors.placeholder,
    },
    postButtonText: {
      color: colors.activeText,
      fontWeight: "600",
      fontSize: 14,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.card,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBg, // Thêm màu nền placeholder
    },
    userDetails: {
      marginLeft: 12,
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    typeSelector: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    typeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    typeButtonText: {
      fontSize: 13,
      fontWeight: "600",
    },
    inputContainer: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginTop: 8,
    },
    imagePickerWrapper: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      marginTop: 8,
    },
    titleInput: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      paddingVertical: 8,
    },
    descriptionInput: {
      fontSize: 16,
      color: colors.text,
      minHeight: 120,
      paddingVertical: 8,
    },
    characterCount: {
      fontSize: 12,
      color: colors.placeholder,
      textAlign: "right",
      marginTop: 4,
    },
    inputWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 4,
    },
    phoneInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      paddingVertical: 8,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      backgroundColor: colors.card,
      marginTop: 8,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: colors.placeholder,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    bottomSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "ios" ? 32 : 16,
    },
    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.placeholder,
      borderRadius: 2,
      alignSelf: "center",
      marginVertical: 12,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bottomSheetItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    bottomSheetItemSelected: {
      backgroundColor: colors.inputBg,
    },
    typeIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    bottomSheetItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
  });