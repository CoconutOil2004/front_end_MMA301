import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View, RefreshControl, ActivityIndicator, Text } from 'react-native';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import CustomDrawer from '../components/navigation/DrawerContent';
import { getPosts } from '../service';
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from '../context/AuthContext'; // 👈 Import context

export default function HomeScreen({ navigation }) {
  const { user, avatarUrl } = useContext(AuthContext); // 👈 Lấy user và avatar từ context
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { theme } = useTheme(); // 2. Lấy theme
  const styles = getStyles(theme.colors); // 3. Tạo styles

  const transformPost = (post) => {
    const postUserId = post.userId?._id || post.userId?.id;
    const currentUserId = user?._id || user?.id;
    const isCurrentUserPost = postUserId === currentUserId;

    return {
      id: post._id,
      // ✅ Nếu là post của user hiện tại, dùng avatarUrl từ context
      avatar: isCurrentUserPost 
        ? (avatarUrl || user?.avatar || 'https://via.placeholder.com/50')
        : (post.userId?.avatar || 'https://via.placeholder.com/50'),
      name: post.userId?.name || 'Anonymous User',
      userId: post.userId, // 👈 Thêm userId để PostCard có thể check
      degree: null,
      title: post.title || '',
      timeAgo: getTimeAgo(post.createdAt),
      isEdited: post.createdAt !== post.updatedAt,
      content: post.description || '',
      showTranslation: false,
      image: post.imageUrl || null,
      hasHD: false,
      isFollowing: false,
      likes: post.likes || [],
      tags: post.tags || [],
      status: post.status || 'open',
      contactPhone: post.contactPhone || '',
      type: post.type, // Thêm type
    };
  };

  // Calculate time ago from date
  const getTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };

  // Load posts from MongoDB
  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      const response = await getPosts(pageNum, 20);
      console.log('API Response:', response);
      
      // Handle different response structures
      let newPosts = [];
      if (Array.isArray(response)) {
        newPosts = response;
      } else if (response.posts && Array.isArray(response.posts)) {
        newPosts = response.posts;
      } else if (response.data && Array.isArray(response.data)) {
        newPosts = response.data;
      } else {
        console.warn('Unexpected response structure:', response);
        newPosts = [];
      }

      // Transform posts to match PostCard format
      const transformedPosts = newPosts.map(transformPost);
      
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      
      // Check if there are more posts to load
      setHasMore(newPosts.length === 20);
      
    } catch (error) {
      console.error('Error loading posts:', error);
      setError(error.message || 'Không thể tải bài viết');
      
      // Show mock data only on first load
      if (!append && posts.length === 0) {
        setPosts([
          {
            id: '1',
            avatar: 'https://via.placeholder.com/50',
            name: 'Demo User',
            degree: '3rd+',
            title: 'Demo Post - API Error',
            timeAgo: '1w',
            isEdited: false,
            content: 'Đây là bài viết mẫu. API đang gặp sự cố. Vui lòng kiểm tra:\n\n1. Backend server đã chạy chưa?\n2. URL API có đúng không?\n3. Kiểm tra console log để xem lỗi chi tiết.',
            showTranslation: false,
            image: 'https://via.placeholder.com/400x200',
            hasHD: false,
            isFollowing: false,
          },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load posts when component mounts
  useEffect(() => {
    loadPosts();
  }, []);

  // ✅ Re-transform posts khi avatarUrl thay đổi
  useEffect(() => {
    if (posts.length > 0 && avatarUrl) {
      setPosts(prevPosts => 
        prevPosts.map(post => {
          const postUserId = post.userId?._id || post.userId?.id;
          const currentUserId = user?._id || user?.id;
          const isCurrentUserPost = postUserId === currentUserId;
          
          if (isCurrentUserPost) {
            return {
              ...post,
              avatar: avatarUrl
            };
          }
          return post;
        })
      );
    }
  }, [avatarUrl]);

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleMessagePress = () => {
    navigation.navigate("Messages");
  };

  const handleAvatarPress = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadPosts(1, false);
  };

  // Load more posts when scrolling to bottom
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  };

  // Render loading state
  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header
            onSearchPress={handleSearchPress}
            onMessagePress={handleMessagePress}
            onAvatarPress={handleAvatarPress}
          />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải bài viết...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          onSearchPress={handleSearchPress}
          onMessagePress={handleMessagePress}
          onAvatarPress={handleAvatarPress}
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubText}>Kéo xuống để thử lại</Text>
            </View>
          )}

          {posts.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
              <Text style={styles.emptySubText}>Kéo xuống để làm mới</Text>
            </View>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {loading && posts.length > 0 && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
            </View>
          )}

          {!hasMore && posts.length > 0 && (
            <View style={styles.endMessage}>
              <Text style={styles.endMessageText}>Bạn đã xem hết bài viết</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <CustomDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
    </View>
  );
}

// 4. Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.placeholder,
    },
    errorContainer: {
      backgroundColor: colors.danger + "20",
      padding: 16,
      margin: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.danger + "50",
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
      marginBottom: 4,
    },
    errorSubText: {
      color: colors.danger,
      fontSize: 12,
    textAlign: 'center',
    },
    emptyContainer: {
      padding: 40,
    alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.text,
    fontWeight: '600',
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      color: colors.placeholder,
    },
    loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
      padding: 16,
    },
    loadingMoreText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.placeholder,
    },
    endMessage: {
      padding: 20,
    alignItems: 'center',
    },
    endMessageText: {
      fontSize: 14,
      color: colors.placeholder,
    },
  });