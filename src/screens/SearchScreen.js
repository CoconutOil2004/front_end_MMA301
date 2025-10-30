import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getPosts } from "../service";

export default function SearchScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme.colors), [theme.colors]);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await getPosts(1, 100);
        const dataArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.posts)
          ? response.posts
          : [];
        setPosts(dataArray);
        setFilteredPosts(dataArray);
      } catch (error) {
        console.error("Search load posts error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const lowered = query.toLowerCase();
    const nextPosts = posts.filter((post) => {
      const title = post.title?.toLowerCase() || "";
      const description = post.description?.toLowerCase() || "";
      const type = post.type?.toLowerCase() || "";
      const author = post.userId?.name?.toLowerCase() || "";
      return (
        title.includes(lowered) ||
        description.includes(lowered) ||
        type.includes(lowered) ||
        author.includes(lowered)
      );
    });

    setFilteredPosts(nextPosts);
  }, [query, posts]);

  const handleClear = () => {
    setQuery("");
    Keyboard.dismiss();
  };

  const renderPost = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.8}
        onPress={() => {
          Keyboard.dismiss();
          navigation.navigate("PostDetail", {
            postId: item._id || item.id,
          });
        }}
      >
        <Text style={styles.resultTitle}>{item.title || "(Không có tiêu đề)"}</Text>
        {item.userId?.name && (
          <Text style={styles.resultMeta}>Bởi {item.userId.name}</Text>
        )}
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description || "Không có mô tả"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Tìm kiếm</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={theme.colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài đăng, người đăng, từ khóa..."
            placeholderTextColor={theme.colors.placeholder}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={theme.colors.placeholder}
            />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>
              Thử từ khóa khác hoặc kiểm tra chính tả.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item._id || item.id}
            renderItem={renderPost}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (!loadingMore) {
                setLoadingMore(true);
                setTimeout(() => setLoadingMore(false), 500);
              }
            }}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    clearButton: {
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 12,
    },
    emptyText: {
      fontSize: 14,
      color: colors.placeholder,
      textAlign: "center",
      marginTop: 6,
    },
    listContent: {
      paddingBottom: 24,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    resultMeta: {
      fontSize: 13,
      color: colors.placeholder,
      marginBottom: 6,
    },
    resultDescription: {
      fontSize: 14,
      color: colors.text,
    },
    loadingMore: {
      paddingVertical: 16,
      alignItems: "center",
    },
  });
