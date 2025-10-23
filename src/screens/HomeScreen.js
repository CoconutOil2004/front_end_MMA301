// src/screens/HomeScreen.js
import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Header from '../components/Header';
import PostCard from '../components/PostCard';

export default function HomeScreen() {
  // Dữ liệu mẫu cho các bài viết
  const posts = [
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
  ];

  const handleSearchPress = () => {
    console.log('Search pressed');
    // Navigate to search screen
  };

  const handleMessagePress = () => {
    console.log('Message pressed');
    // Navigate to messages screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Component */}
      <Header 
        onSearchPress={handleSearchPress}
        onMessagePress={handleMessagePress}
      />

      {/* Content Area */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Render tất cả posts */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2EF',
  },
  content: {
    flex: 1,
  },
});