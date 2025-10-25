import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
//================================================================
// 1. COMPONENT POSTCARD (Đã được cung cấp)
// (Styles đã được đổi tên thành 'postCardStyles' để tránh xung đột)
//================================================================
function PostCard({ post }) {
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
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    // Sau khi xoá token, AppNavigator sẽ tự hiểu là chưa login → quay lại Login
  };
  return (
    <View style={postCardStyles.postCard}>
      {/* Post Header */}
      <View style={postCardStyles.postHeader}>
        <Image source={{ uri: avatar }} style={postCardStyles.postAvatar} />
        <View style={postCardStyles.postInfo}>
          <View style={postCardStyles.postNameRow}>
            <Text style={postCardStyles.postName}>{name}</Text>
            {degree && (
              <Text style={postCardStyles.postDegree}>· {degree}</Text>
            )}
          </View>
          <Text style={postCardStyles.postTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={postCardStyles.postMeta}>
            <Text style={postCardStyles.postTime}>
              {timeAgo}
              {isEdited && " · Edited"} ·
            </Text>
            <Ionicons
              name="earth"
              size={12}
              color="#666"
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>

        <View style={postCardStyles.postActions}>
          {!isFollowing && (
            <TouchableOpacity style={postCardStyles.followButton}>
              <Ionicons name="add" size={18} color="#0A66C2" />
              <Text style={postCardStyles.followText}>Follow</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={postCardStyles.moreButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post Content */}
      <Text style={postCardStyles.postContent}>{content}</Text>

      {/* Translation Button */}
      {showTranslation && (
        <TouchableOpacity style={postCardStyles.translationButton}>
          <Text style={postCardStyles.translationText}>Show translation</Text>
        </TouchableOpacity>
      )}

      {/* Post Image */}
      {image && (
        <View style={postCardStyles.postImageContainer}>
          <Image
            source={{ uri: image }}
            style={postCardStyles.postImage}
            resizeMode="cover"
          />
          {hasHD && (
            <View style={postCardStyles.hdBadge}>
              <Text style={postCardStyles.hdText}>HD</Text>
            </View>
          )}
        </View>
      )}

      {/* Post Footer - Actions */}
      <View style={postCardStyles.postFooter}>
        <TouchableOpacity style={postCardStyles.footerButton}>
          <Ionicons name="thumbs-up-outline" size={20} color="#666" />
          <Text style={postCardStyles.footerButtonText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postCardStyles.footerButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={postCardStyles.footerButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postCardStyles.footerButton}>
          <Ionicons name="arrow-redo-outline" size={20} color="#666" />
          <Text style={postCardStyles.footerButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postCardStyles.footerButton}>
          <Ionicons name="paper-plane-outline" size={20} color="#666" />
          <Text style={postCardStyles.footerButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      {/* === Header: Cover Photo === */}
      <View style={styles.header}>
        <Image
          style={styles.coverPhoto}
          source={{ uri: "https://picsum.photos/seed/cover/400/200" }}
        />
      </View>

      {/* === Profile Info: Pic, Name, Headline === */}
      <View style={styles.profileInfoContainer}>
        <Image
          style={styles.profilePhoto}
          source={{ uri: "https://picsum.photos/seed/profile/200" }}
        />
        <Text style={styles.name}>Nguyễn Văn A</Text>
        <Text style={styles.headline}>
          Senior React Native Developer | Tech Lead
        </Text>
        <Text style={styles.location}>Hanoi, Vietnam • 500+ connections</Text>
      </View>

      {/* === Action Buttons === */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* === About Card === */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.aboutText}>
          Passionate software engineer with 5+ years of experience in mobile
          development using React Native. Always eager to learn new technologies
          and build amazing user experiences.
        </Text>
      </View>

      {/* === Experience Card === */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Experience</Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={32} color="#6b7280" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Senior React Native Developer</Text>
            <Text style={styles.infoSubText}>Google • Full-time</Text>
            <Text style={styles.infoDate}>
              Jan 2023 - Present • 2 yrs 10 mos
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={32} color="#6b7280" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>React Native Developer</Text>
            <Text style={styles.infoSubText}>Facebook • Full-time</Text>
            <Text style={styles.infoDate}>Jan 2020 - Dec 2022 • 3 yrs</Text>
          </View>
        </View>
      </View>

      {/* === Education Card === */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Education</Text>
        <View style={styles.infoRow}>
          <MaterialIcons name="school" size={32} color="#6b7280" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              Hanoi University of Science and Technology
            </Text>
            <Text style={styles.infoSubText}>
              Bachelor's degree, Computer Science
            </Text>
            <Text style={styles.infoDate}>2015 - 2019</Text>
          </View>
        </View>
      </View>

      {/* === Activity / Posts === */}
      <View style={styles.activityTitleContainer}>
        <Text style={styles.cardTitle}>Activity</Text>
      </View>

      {/* Render danh sách bài viết */}
      {/* {MOCK_POSTS.map((post) => (
        <PostCard key={post.id} post={post} />
      ))} */}
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#EF4444",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 10,
          }}
          onPress={async () => {
            await logout();
            Alert.alert("Đăng xuất", "Bạn đã đăng xuất thành công!");
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

//================================================================
// 4. STYLESHEET CỦA POSTCARD
//================================================================
const postCardStyles = StyleSheet.create({
  postCard: {
    backgroundColor: "#fff",
    marginTop: 8,
    // Thay vì marginHorizontal, chúng ta để nó full-width
    // và thêm border để tách biệt
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
  },
  postInfo: {
    flex: 1,
    marginLeft: 8,
  },
  postNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  postName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  postDegree: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  postTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  postTime: {
    fontSize: 12,
    color: "#666",
  },
  postActions: {
    alignItems: "flex-end",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  followText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A66C2",
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  translationButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  translationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  postImageContainer: {
    position: "relative",
    // Bỏ borderRadius và overflow để ảnh full-width
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 250, // Tăng chiều cao ảnh một chút
    backgroundColor: "#E0E0E0",
  },
  hdBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hdText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
});

//================================================================
// 5. STYLESHEET CỦA PROFILESCREEN
//================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Light gray background
    paddingBottom: 24, // Thêm padding ở dưới
  },
  header: {
    height: 180,
    backgroundColor: "#d1d5db", // Placeholder color
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  profileInfoContainer: {
    alignItems: "center",
    marginTop: -60, // Pulls the profile picture up to overlap
    paddingHorizontal: 16,
    backgroundColor: "#ffffff", // Thêm nền trắng cho phần info
    paddingBottom: 16,
    // Thêm border dưới để tách biệt
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: "#ffffff",
    borderWidth: 4,
    backgroundColor: "#e5e7eb", // Placeholder
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
    paddingVertical: 12, // Thêm padding dọc
    backgroundColor: "#ffffff", // Nền trắng
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
    backgroundColor: "#2563eb", // Blue
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb", // Light gray
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
  // Style mới cho tiêu đề Activity
  activityTitleContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#ffffff",
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
});
