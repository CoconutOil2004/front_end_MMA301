import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from '../context/AuthContext'; 
import { DEFAULT_AVATAR } from '../utils/constants';

export default function Header({ onSearchPress, onMessagePress, onAvatarPress }) {
  // Lấy theme
  const { theme } = useTheme();
  // Lấy styles (phải sau khi lấy theme)
  const styles = getStyles(theme.colors);
  // Lấy auth
  const { user, avatarUrl } = useContext(AuthContext);

  // Dùng DEFAULT_AVATAR chung
  const displayAvatar = avatarUrl || user?.avatar || DEFAULT_AVATAR;

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={onAvatarPress}
        >
          <Image
            source={{ uri: displayAvatar }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={theme.colors.placeholder}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={onMessagePress}
        >
          <Ionicons
            name="chatbox-ellipses-outline"
            size={24}
            color={theme.colors.placeholder}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. Hàm styles động
const getStyles = (colors) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      backgroundColor: colors.inputBg,
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
      color: colors.text,
    },
    messageButton: {
      marginLeft: 12,
      padding: 4,
    },
  });