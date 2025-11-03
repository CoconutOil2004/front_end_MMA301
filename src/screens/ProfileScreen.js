import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../context/AuthContext";
import { getPostByUserId, changePassword } from "../service";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import PostCard from "../components/PostCard";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const { logout, user, updateAvatar, getDisplayAvatar } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  const navigation = useNavigation(); //

  // States
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayAvatar, setDisplayAvatar] = useState(getDisplayAvatar());

// STATE CHO MODAL
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setDisplayAvatar(getDisplayAvatar());
  }, [user, getDisplayAvatar]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetchUserPosts(userId);
    } else {
      setLoading(false);
      setPosts([]);
    }
  }, [user]);

  // Hàm fetch bài viết
  const fetchUserPosts = async (userId) => {
    setLoading(true);
    try {
      const response = await getPostByUserId(userId);
      if (response && Array.isArray(response)) {
        setPosts(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setPosts(response.data);
      } else {
        console.warn("API getPostByUserId trả về cấu trúc không mong đợi:", response);
        setPosts([]);
      }
    } catch (error) {
      console.error('Lỗi tải bài viết:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết của bạn.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý kéo để làm mới
  const onRefresh = async () => {
    const userId = user?._id || user?.id;
    if (userId) {
        setRefreshing(true);
        await fetchUserPosts(userId);
        setRefreshing(false);
    } else {
        setRefreshing(false);
    }
  };

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
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi chọn ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  // Hàm xử lý tải avatar lên
  const handleUploadAvatar = async (uri) => {
    setUploading(true);
    try {
      const timestamp = Date.now();
      const userId = user?._id || user?.id || 'unknown';
      const response = await uploadToCloudinary(uri, {
        folder: 'avatars',
        publicId: `avatar_${userId}_${timestamp}`,
      });
      if (!response?.secure_url) {
        throw new Error('Upload ảnh lên Cloudinary thất bại.');
      }
      const newAvatarUrl = response.secure_url;
      const urlWithCacheBuster = `${newAvatarUrl}?t=${timestamp}`;
      await updateAvatar(urlWithCacheBuster);
      setDisplayAvatar(urlWithCacheBuster);
      Alert.alert('Thành công', 'Avatar đã được cập nhật!');
    } catch (error) {
      console.error('❌ Lỗi tải avatar lên:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải avatar lên.');
    } finally {
      setUploading(false);
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => { await logout(); }
        }
      ]
    );
  };

  const openPasswordModal = () => {
    setIsModalVisible(true);
  };

  const closePasswordModal = () => {
    setIsModalVisible(false);
    setOldPassword(""); // Reset input
    setNewPassword(""); // Reset input
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ mật khẩu cũ và mới.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await changePassword({ oldPassword, newPassword });
      
      Alert.alert("Thành công", response.message || "Đổi mật khẩu thành công!");
      closePasswordModal();
      
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error.response?.data || error.message);
      Alert.alert("Lỗi", error.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Thông tin hiển thị (đã sửa để khớp với backend)
  const displayName = user?.name || 'Người dùng';
  const displayEmail = user?.email || '';
  const displayHeadline = user?.bio || 'Chưa cập nhật giới thiệu';
  const displayLocation = user?.phone || 'Chưa cập nhật SĐT';
  const displayAbout = user?.bio || 'Chưa có giới thiệu.';

  // Render loading ban đầu
  if (loading && posts.length === 0 && !refreshing) {
      return (
          <SafeAreaView style={styles.safeArea}>
              <View style={styles.loadingContainerFull}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ backgroundColor: theme.colors.background, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* === Header Cover === */}
        <View style={styles.header}>
          <Image
            style={styles.coverPhoto}
            source={{ uri: "https://picsum.photos/seed/cover/400/200" }}
          />
        </View>

        {/* === Thông tin Profile=== */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.profilePhoto}
              source={{ uri: displayAvatar }}
              key={displayAvatar}
              onError={(e)=> console.log("Lỗi load avatar profile:", displayAvatar, e.nativeEvent.error)}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleImagePick}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={theme.colors.activeText} />
              ) : (
                <Ionicons name="camera" size={18} color={theme.colors.activeText} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.location}> 
            • {posts.length} bài viết
          </Text>
        </View>

        {/* === Các nút Action === */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.primaryButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={openPasswordModal}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* === Card Giới thiệu === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giới thiệu</Text>
          <Text style={styles.aboutText}>{displayAbout}</Text> 
          {displayEmail && (
            <View style={styles.emailContainer}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.placeholder} />
              <Text style={styles.emailText}>{displayEmail}</Text>
            </View>
            
          )}
           {displayLocation && (
            <View style={styles.emailContainer}>
              <Ionicons name="call-outline" size={16} color={theme.colors.placeholder} />
              <Text style={styles.emailText}>{displayLocation}</Text>
            </View>
            
          )}
        </View>

        {/* === Phần Hoạt động === */}
        <View style={styles.activityTitleContainer}>
          <Text style={styles.cardTitle}>Hoạt động ({posts.length})</Text>
        </View>

        {/* Loading / Posts / Empty State */}
        {(loading && posts.length === 0) || refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : posts.length > 0 ? (
          <View>
            {posts.map((post) => (
              <PostCard key={post._id || post.id} post={post} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={theme.colors.placeholder} />
            <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
          </View>
        )}

        {/* === Nút Đăng xuất === */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.activeText} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

{/* --- MODAL ĐỔI MẬT KHẨU --- */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closePasswordModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={closePasswordModal}
          />
          
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu cũ</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu cũ của bạn"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={closePasswordModal}
              >
                <Text style={styles.modalButtonTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleChangePassword}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? (
                  <ActivityIndicator size="small" color={theme.colors.activeText} />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      height: 150,
      backgroundColor: colors.inputBg,
    },
    coverPhoto: {
      width: "100%",
      height: "100%",
    },
    profileInfoContainer: {
      alignItems: "center",
      marginTop: -50,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    profilePhoto: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderColor: colors.card,
      borderWidth: 4,
      backgroundColor: colors.inputBg,
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    name: {
      fontSize: 22,
      fontWeight: "bold",
      marginTop: 8,
      color: colors.text,
      textAlign: 'center',
    },
    headline: {
      fontSize: 15,
      color: colors.placeholder,
      marginTop: 4,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    location: {
      fontSize: 14,
      color: colors.placeholder,
      marginTop: 6,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      height: 40,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      flex: 1,
      marginRight: 4,
    },
    primaryButtonText: {
      color: colors.activeText,
      fontWeight: "bold",
      fontSize: 14,
    },
    secondaryButton: {
      backgroundColor: colors.inputBg,
      borderColor: colors.border,
      borderWidth: 1,
      minWidth: 40,
      paddingHorizontal: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 14,
    },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
    },
    aboutText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    emailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    emailText: {
      fontSize: 14,
      color: colors.placeholder,
      marginLeft: 8,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
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
    activityTitleContainer: {
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      paddingTop: 16,
      paddingBottom: 0,
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      backgroundColor: colors.card,
      minHeight: 150,
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.placeholder,
    },
    loadingContainerFull: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      backgroundColor: colors.card,
      minHeight: 150,
      justifyContent: 'center',
      marginBottom: 8,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.placeholder,
    },
    logoutContainer: {
      alignItems: "center",
      marginVertical: 24,
      marginBottom: 40,
      paddingHorizontal: 16,
    },
    logoutButton: {
      backgroundColor: colors.danger,
      paddingVertical: 12,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    logoutIcon: {
      marginRight: 8,
    },
    logoutText: {
      color: colors.activeText,
      fontSize: 16,
      fontWeight: "600",
    },
    // --- STYLES MỚI CHO MODAL ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end', // Đẩy modal lên từ dưới
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: 22,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      paddingBottom: Platform.OS === 'ios' ? 40 : 22, // Thêm padding cho iOS
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputContainer: { // Style này dùng lại từ EditProfile
      marginBottom: 16,
    },
    label: { // Style này dùng lại từ EditProfile
      fontSize: 13,
      color: colors.placeholder,
      marginBottom: 6,
    },
    input: { // Style này dùng lại từ EditProfile
      fontSize: 16,
      color: colors.text,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtonCancel: {
      backgroundColor: colors.inputBg,
      marginRight: 8,
    },
    modalButtonTextCancel: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 16,
    },
    modalButtonSave: {
      backgroundColor: colors.primary,
      marginLeft: 8,
    },
    modalButtonTextSave: {
      color: colors.activeText,
      fontWeight: '600',
      fontSize: 16,
    },
  });