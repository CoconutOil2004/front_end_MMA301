// src/screens/ProfileScreen.js
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
  SafeAreaView, // <-- Import SafeAreaView
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../context/AuthContext";
// Giả sử API getPostByUserId tồn tại trong service
import { getPostByUserId } from "../service";
// Giả sử bạn có hàm upload này
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import PostCard from "../components/PostCard";
import { useTheme } from "../context/ThemeContext"; // <-- 1. IMPORT USE THEME

export default function ProfileScreen() {
  // Lấy context
  const { logout, user, updateAvatar, getDisplayAvatar } = useContext(AuthContext);
  const { theme } = useTheme(); // <-- 2. GỌI USE THEME
  const styles = getStyles(theme.colors); // <-- 3. TẠO STYLES ĐỘNG

  // States
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayAvatar, setDisplayAvatar] = useState(getDisplayAvatar());

  // Cập nhật avatar hiển thị khi avatar trong context (user) thay đổi
  useEffect(() => {
    setDisplayAvatar(getDisplayAvatar());
  }, [user, getDisplayAvatar]);

  // Fetch bài viết của user khi component mount hoặc khi user thay đổi
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetchUserPosts(userId);
    } else {
      setLoading(false);
      setPosts([]);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Hàm fetch bài viết
  const fetchUserPosts = async (userId) => {
    setLoading(true);
    // setRefreshing(true); // Chỉ set refreshing khi kéo
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
      // setRefreshing(false); // Chỉ tắt trong onRefresh
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

  // Thông tin hiển thị (có fallback)
  const displayName = user?.name || 'Người dùng';
  const displayEmail = user?.email || '';
  const displayHeadline = user?.headline || 'Chưa cập nhật headline';
  const displayLocation = user?.location || 'Chưa cập nhật vị trí';
  const displayAbout = user?.about || 'Chưa có giới thiệu.';

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
        // Đặt nền cho nội dung cuộn
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

        {/* === Thông tin Profile === */}
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
          <Text style={styles.headline}>{displayHeadline}</Text>
          <Text style={styles.location}>
            {displayLocation} • {posts.length} bài viết
          </Text>
        </View>

        {/* === Các nút Action === */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
            {/* Giữ lại Text hoặc Icon tùy ý */}
            <Text style={styles.secondaryButtonText}>Chia sẻ</Text>
            {/* <Ionicons name="share-social-outline" size={20} color={theme.colors.text} /> */}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
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
        </View>

        {/* === Card Kinh nghiệm === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kinh nghiệm</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="work-outline" size={32} color={theme.colors.placeholder} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Senior React Native Developer</Text>
              <Text style={styles.infoSubText}>Tech Company • Toàn thời gian</Text>
              <Text style={styles.infoDate}>Tháng 1, 2023 - Hiện tại • 2 năm</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="work-outline" size={32} color={theme.colors.placeholder} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>React Native Developer</Text>
              <Text style={styles.infoSubText}>Startup • Toàn thời gian</Text>
              <Text style={styles.infoDate}>Tháng 1, 2020 - Tháng 12, 2022 • 3 năm</Text>
            </View>
          </View>
        </View>

        {/* === Card Học vấn === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Học vấn</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="school-outline" size={32} color={theme.colors.placeholder} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Đại học Bách Khoa Hà Nội</Text>
              <Text style={styles.infoSubText}>Cử nhân, Khoa học Máy tính</Text>
              <Text style={styles.infoDate}>2015 - 2019</Text>
            </View>
          </View>
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
    </SafeAreaView>
  );
}

// --- HÀM STYLES ĐỘNG ---
const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background, // Nền cho cả khu vực an toàn
    },
    container: {
      flex: 1,
      // Nền được đặt ở contentContainerStyle
    },
    header: {
      height: 150, // Chiều cao ảnh bìa
      backgroundColor: colors.inputBg, // Màu nền placeholder ảnh bìa
    },
    coverPhoto: {
      width: "100%",
      height: "100%",
    },
    profileInfoContainer: {
      alignItems: "center",
      marginTop: -50, // Avatar đè lên ảnh bìa
      paddingHorizontal: 16,
      backgroundColor: colors.card, // Nền khu vực thông tin
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8, // Khoảng cách dưới khu vực thông tin
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    profilePhoto: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderColor: colors.card, // Viền cùng màu nền
      borderWidth: 4,
      backgroundColor: colors.inputBg, // Màu nền placeholder avatar
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary, // Màu nút sửa
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.card, // Viền cùng màu nền
    },
    name: {
      fontSize: 22,
      fontWeight: "bold",
      marginTop: 8,
      color: colors.text, // Màu chữ tên
      textAlign: 'center',
    },
    headline: {
      fontSize: 15,
      color: colors.placeholder, // Màu chữ headline
      marginTop: 4,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    location: {
      fontSize: 14,
      color: colors.placeholder, // Màu chữ vị trí
      marginTop: 6,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card, // Nền khu vực nút
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
      backgroundColor: colors.primary, // Màu nút chính
      flex: 1, // Chiếm nhiều không gian hơn
      marginRight: 4,
    },
    primaryButtonText: {
      color: colors.activeText, // Màu chữ nút chính
      fontWeight: "bold",
      fontSize: 14,
    },
    secondaryButton: {
      backgroundColor: colors.inputBg, // Nền nút phụ
      borderColor: colors.border,
      borderWidth: 1,
      minWidth: 40, // Đủ rộng cho icon
      paddingHorizontal: 12,
    },
    secondaryButtonText: {
      color: colors.text, // Màu chữ nút phụ (nếu có text)
      fontWeight: "bold",
      fontSize: 14,
    },
    card: {
      backgroundColor: colors.card, // Nền thẻ
      padding: 16,
      marginBottom: 8, // Khoảng cách giữa các thẻ
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text, // Màu tiêu đề thẻ
    },
    aboutText: {
      fontSize: 14,
      color: colors.text, // Màu chữ giới thiệu
      lineHeight: 20,
    },
    emailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border, // Màu đường kẻ
    },
    emailText: {
      fontSize: 14,
      color: colors.placeholder, // Màu chữ email
      marginLeft: 8,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start", // Icon và text căn lề trên
      marginBottom: 16,
    },
    infoTextContainer: {
      marginLeft: 16,
      flex: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text, // Màu tiêu đề chính (kinh nghiệm, học vấn)
      marginBottom: 2,
    },
    infoSubText: {
      fontSize: 14,
      color: colors.placeholder, // Màu chữ phụ (công ty, ngành học)
    },
    infoDate: {
      fontSize: 13,
      color: colors.placeholder, // Màu chữ ngày tháng
      marginTop: 2,
    },
    activityTitleContainer: {
      paddingHorizontal: 16,
      backgroundColor: colors.card, // Nền tiêu đề hoạt động
      paddingTop: 16,
      paddingBottom: 0, // Bỏ padding dưới vì PostCard đầu tiên sẽ có marginTop=8
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      backgroundColor: colors.card, // Nền loading
      minHeight: 150,
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.placeholder, // Màu chữ loading
    },
    loadingContainerFull: { // Loading toàn màn hình ban đầu
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyContainer: { // Khi không có bài viết
      paddingVertical: 40,
      alignItems: 'center',
      backgroundColor: colors.card, // Nền khi trống
      minHeight: 150,
      justifyContent: 'center',
      marginBottom: 8,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.placeholder, // Màu chữ khi trống
    },
    logoutContainer: {
      alignItems: "center",
      marginVertical: 24,
      marginBottom: 40, // Khoảng cách cuối trang
      paddingHorizontal: 16,
    },
    logoutButton: {
      backgroundColor: colors.danger, // Màu nút đăng xuất
      paddingVertical: 12,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%', // Nút full width
    },
    logoutIcon: {
      marginRight: 8,
    },
    logoutText: {
      color: colors.activeText, // Màu chữ nút đăng xuất
      fontSize: 16,
      fontWeight: "600",
    },
  });