import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ onSearchPress, onMessagePress, onAvatarPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Avatar - Opens Drawer */}
        <TouchableOpacity 
          style={styles.avatar}
          onPress={onAvatarPress}
        >
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.avatarImage}
          />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            editable={false}
          />
        </TouchableOpacity>

        {/* Message Icon */}
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={onMessagePress}
        >
          <Ionicons name="chatbox-ellipses-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    marginRight: 8,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3F8',
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  messageButton: {
    marginLeft: 12,
    padding: 4,
  },
});