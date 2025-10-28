import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View, RefreshControl, ActivityIndicator, Text, TextInput } from 'react-native';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import CustomDrawer from '../components/navigation/DrawerContent';
import { getPosts } from '../service';
import { Ionicons } from '@expo/vector-icons'; // 

export default function HomeScreen({ navigation }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔍 Added Search Bar
  const [searchQuery, setSearchQuery] = useState('');

  // Transform MongoDB post to PostCard format
  const transformPost = (post) => {
    return {
      id: post._id,
      avatar: post.userId?.avatar || 'https://via.placeholder.com/50',
      name: post.userId?.name || 'Anonymous User',
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

      const transformedPosts = newPosts.map(transformPost);
      
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      
      setHasMore(newPosts.length === 20);
      
    } catch (error) {
      console.error('Error loading posts:', error);
      setError(error.message || 'Không thể tải bài viết');
      
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

  useEffect(() => {
    loadPosts();
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadPosts(1, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  };

  // 🔍 Added Search Bar — lọc danh sách bài đăng theo từ khóa
  const filteredPosts = posts.filter((post) => {
    const keyword = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(keyword) ||
      post.content?.toLowerCase().includes(keyword)
    );
  });

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
            <ActivityIndicator size="large" color="#0A66C2" />
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

        {/* 🔍 Added Search Bar UI */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài đăng..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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

          {filteredPosts.length === 0 && !loading && !error && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy bài viết phù hợp</Text>
              <Text style={styles.emptySubText}>Thử từ khóa khác nhé!</Text>
            </View>
          )}

          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {loading && posts.length > 0 && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#0A66C2" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2EF',
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
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
    color: '#666',
  },
  endMessage: {
    padding: 20,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 14,
    color: '#999',
  },
  // 🔍 Added Search Bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#111827',
  },
});
