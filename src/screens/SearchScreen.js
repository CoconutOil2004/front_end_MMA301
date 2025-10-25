import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['iPhone', 'Ví da', 'Túi xách']);
  const [popularSearches] = useState(['Điện thoại', 'Ví', 'Chìa khóa', 'Túi xách', 'Đồng hồ']);

  // Sample search results
  const sampleResults = [
    {
      id: '1',
      title: 'Tìm thấy iPhone 12 màu xanh',
      description: 'Tìm thấy điện thoại iPhone 12 màu xanh ở khu vực canteen...',
      type: 'found',
      location: 'Canteen trường',
      timeAgo: '2h',
      image: 'https://via.placeholder.com/100x100'
    },
    {
      id: '2',
      title: 'Mất ví da màu đen',
      description: 'Đánh mất ví da màu đen có thẻ sinh viên bên trong...',
      type: 'lost',
      location: 'Thư viện',
      timeAgo: '5h',
      image: 'https://via.placeholder.com/100x100'
    },
    {
      id: '3',
      title: 'Tìm thấy túi xách màu nâu',
      description: 'Tìm thấy túi xách màu nâu ở phòng học A201...',
      type: 'found',
      location: 'Phòng học A201',
      timeAgo: '1d',
      image: 'https://via.placeholder.com/100x100'
    }
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      // Simulate search API call
      const filteredResults = sampleResults.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultImage}>
        <Ionicons 
          name={item.type === 'found' ? 'checkmark-circle' : 'alert-circle'} 
          size={24} 
          color={item.type === 'found' ? '#10B981' : '#F59E0B'} 
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultDescription}>{item.description}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultLocation}>📍 {item.location}</Text>
          <Text style={styles.resultTime}>{item.timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={64} color="#9ca3af" />
      <Text style={styles.emptyTitle}>Tìm kiếm đồ thất lạc</Text>
      <Text style={styles.emptyDescription}>
        Nhập từ khóa để tìm kiếm các bài đăng về đồ thất lạc
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đồ thất lạc..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {searchQuery.length === 0 ? (
          <View>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.searchTag}
                    onPress={() => handleSearch(search)}
                  >
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.searchTagText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
              <View style={styles.popularTags}>
                {popularSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.popularTag}
                    onPress={() => handleSearch(search)}
                  >
                    <Text style={styles.popularTagText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              Tìm thấy {searchResults.length} kết quả
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2EF',
  },
  searchHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  searchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 8,
  },
  searchTagText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  popularTag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  popularTagText: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultImage: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultLocation: {
    fontSize: 12,
    color: '#666',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});