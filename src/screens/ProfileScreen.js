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
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { getPostByUserId } from "../service";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import PostCard from "../components/PostCard";

export default function ProfileScreen() {
  const { logout, user, updateAvatar, getDisplayAvatar } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayAvatar, setDisplayAvatar] = useState(getDisplayAvatar());

  // ✅ Cập nhật avatar khi context thay đổi
  useEffect(() => {
    setDisplayAvatar(getDisplayAvatar());
  }, [user, getDisplayAvatar]);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      if (userId) {
        const response = await getPostByUserId(userId);
        if (response.success && response.data) {
          setPosts(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải avatar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleUploadAvatar = async (uri) => {
    try {
      setUploading(true);

      const timestamp = Date.now();
      const userId = user?._id || user?.id || 'unknown';

      // 1️⃣ Upload ảnh lên Cloudinary
      console.log('📤 Đang upload avatar lên Cloudinary...');
      const response = await uploadToCloudinary(uri, {
        folder: 'avatars',
        publicId: `avatar_${userId}_${timestamp}`,
        onProgress: (progress) => {
          console.log('Tiến trình tải lên:', Math.round(progress) + '%');
        }
      });

      if (!response.secure_url) {
        throw new Error('Không nhận được URL từ Cloudinary');
      }

      const newAvatarUrl = response.secure_url;
      console.log('✅ Upload Cloudinary thành công:', newAvatarUrl);

      // 2️⃣ Gọi API để lưu vào database + cập nhật context
      const urlWithCacheBuster = `${newAvatarUrl}?t=${timestamp}`;
      await updateAvatar(urlWithCacheBuster);
      
      // 3️⃣ Cập nhật local state
      setDisplayAvatar(urlWithCacheBuster);

      Alert.alert('Thành công', 'Avatar đã được cập nhật!');

    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      
      let errorMessage = 'Không thể tải avatar lên';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const displayName = user?.name || 'Người dùng';
  const displayEmail = user?.email || '';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Image
          style={styles.coverPhoto}
          source={{ uri: "https://picsum.photos/seed/cover/400/200" }}
        />
      </View>

      <View style={styles.profileInfoContainer}>
        <View style={styles.avatarContainer}>
          <Image
            style={styles.profilePhoto}
            source={{ uri: displayAvatar }}
            key={displayAvatar}
          />
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handleImagePick}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.headline}>
          {user?.headline || 'React Native Developer'}
        </Text>
        <Text style={styles.location}>
          {user?.location || 'Hanoi, Vietnam'} • {posts.length} bài viết
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giới thiệu</Text>
        <Text style={styles.aboutText}>
          {user?.about || 'Lập trình viên đam mê công nghệ, chuyên phát triển ứng dụng di động với React Native. Luôn học hỏi và cải thiện kỹ năng mỗi ngày.'}
        </Text>
        {displayEmail && (
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.emailText}>{displayEmail}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kinh nghiệm</Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={32} color="#6b7280" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Senior React Native Developer</Text>
            <Text style={styles.infoSubText}>Tech Company • Toàn thời gian</Text>
            <Text style={styles.infoDate}>
              Tháng 1, 2023 - Hiện tại • 2 năm
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={32} color="#6b7280" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>React Native Developer</Text>
            <Text style={styles.infoSubText}>Startup • Toàn thời gian</Text>
            <Text style={styles.infoDate}>Tháng 1, 2020 - Tháng 12, 2022 • 3 năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Học vấn</Text>
        <View style={styles.infoRow}>
          <MaterialIcons name="school" size={32} color="#6b7280" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              Đại học Bách Khoa Hà Nội
            </Text>
            <Text style={styles.infoSubText}>
              Cử nhân, Khoa học Máy tính
            </Text>
            <Text style={styles.infoDate}>2015 - 2019</Text>
          </View>
        </View>
      </View>

      <View style={styles.activityTitleContainer}>
        <Text style={styles.cardTitle}>Hoạt động ({posts.length})</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A66C2" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id || post.id} post={post} />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
        </View>
      )}

      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    height: 180,
    backgroundColor: "#d1d5db",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  profileInfoContainer: {
    alignItems: "center",
    marginTop: -60,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatarContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: "#ffffff",
    borderWidth: 4,
    backgroundColor: "#e5e7eb",
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0A66C2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    color: "#111827",
  },
  headline: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 4,
    textAlign: "center",
  },
  location: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    borderColor: "#d1d5db",
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "bold",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  aboutText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  infoSubText: {
    fontSize: 14,
    color: "#4b5563",
  },
  infoDate: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  activityTitleContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  logoutContainer: {
    alignItems: "center",
    marginVertical: 24,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});