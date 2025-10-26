import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View, RefreshControl } from 'react-native';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import CustomDrawer from '../components/navigation/DrawerContent';
import { getPosts } from '../service';

export default function HomeScreen({ navigation }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load posts từ MongoDB
  const loadPosts = async () => {
    try {
      const response = await getPosts();
      setPosts(response.posts || response);
    } catch (error) {
      console.error('Lỗi load posts:', error);
      // Fallback về mock data nếu API lỗi
      setPosts([
        {
          id: '1',
          avatar: 'https://via.placeholder.com/50',
          name: 'Thao Le (Sia)',
          degree: '3rd+',
          title: 'Founder at Sia Group. Cố vấn chiến lược và tri...',
          timeAgo: '1w',
          isEdited: true,
          content: 'Đối với mình đây là 1 case sale chưa tốt.\n\nMình đặt hàng trên website. Sale đã mất công liên hệ, ...more',
          showTranslation: true,
          image: 'https://via.placeholder.com/400x200',
          hasHD: true,
          isFollowing: false,
        },
        {
          id: '2',
          avatar: 'https://via.placeholder.com/50',
          name: 'Hai Tu',
          degree: null,
          title: 'commented on this',
          timeAgo: '2d',
          isEdited: false,
          content: 'da chị ơi em thấy mình có đơn hàng đặt hợp kính a',
          showTranslation: false,
          image: null,
          hasHD: false,
          isFollowing: true,
        },
        {
          id: '3',
          avatar: 'https://via.placeholder.com/50',
          name: 'Nguyen Van A',
          degree: '2nd',
          title: 'Software Engineer at Tech Company',
          timeAgo: '3d',
          isEdited: false,
          content: 'Excited to share my new project! 🚀\n\nAfter months of hard work, we finally launched our new mobile app. Check it out!',
          showTranslation: false,
          image: 'https://via.placeholder.com/400x250',
          hasHD: false,
          isFollowing: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load posts khi component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const handleSearchPress = () => {
    console.log('Search pressed');
    navigation.navigate('Search');
  };

  const handleMessagePress = () => {
    console.log('Message pressed');
  };

  const handleAvatarPress = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Logic làm mới dữ liệu
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

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
          refreshControl={ // 🆕 thêm refresh control
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Custom Drawer */}
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
});
