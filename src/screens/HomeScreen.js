import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import CustomDrawer from '../components/navigation/DrawerContent';

export default function HomeScreen({ navigation }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);

  // Sample data for Lost & Found posts
  const samplePosts = [
    {
      id: '1',
      avatar: 'https://via.placeholder.com/50',
      name: 'Nguyễn Văn A',
      degree: 'Sinh viên năm 3',
      title: 'Khoa Công nghệ thông tin',
      timeAgo: '2h',
      isEdited: false,
      content: 'Mình tìm thấy một chiếc ví da màu đen ở khu vực thư viện. Trong ví có thẻ sinh viên và một ít tiền mặt. Ai mất liên hệ mình nhé! 📱',
      showTranslation: false,
      image: 'https://via.placeholder.com/400x200',
      hasHD: false,
      isFollowing: false,
      type: 'found',
      location: 'Thư viện trường',
      contact: '0123456789'
    },
    {
      id: '2',
      avatar: 'https://via.placeholder.com/50',
      name: 'Trần Thị B',
      degree: 'Sinh viên năm 2',
      title: 'Khoa Kinh tế',
      timeAgo: '5h',
      isEdited: false,
      content: 'Mình đánh mất chiếc điện thoại iPhone 12 màu xanh ở khu vực canteen. Ai nhặt được xin liên hệ mình, mình sẽ hậu tạ! 🙏',
      showTranslation: false,
      image: null,
      hasHD: false,
      isFollowing: true,
      type: 'lost',
      location: 'Canteen trường',
      contact: '0987654321'
    },
    {
      id: '3',
      avatar: 'https://via.placeholder.com/50',
      name: 'Lê Văn C',
      degree: 'Sinh viên năm 4',
      title: 'Khoa Ngoại ngữ',
      timeAgo: '1d',
      isEdited: false,
      content: 'Tìm thấy một chiếc túi xách màu nâu ở phòng học A201. Trong túi có sách vở và một số đồ dùng học tập. Ai mất inbox mình nhé! 📚',
      showTranslation: false,
      image: 'https://via.placeholder.com/400x250',
      hasHD: false,
      isFollowing: false,
      type: 'found',
      location: 'Phòng học A201',
      contact: '0369852147'
    },
  ];

  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setPosts(samplePosts);
      setRefreshing(false);
    }, 1000);
  };

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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header 
          onSearchPress={handleSearchPress}
          onMessagePress={handleMessagePress}
          onAvatarPress={handleAvatarPress}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color="#F97316" />
            <Text style={styles.actionText}>Đăng bài tìm đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.actionText}>Đăng bài tìm thấy</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
});