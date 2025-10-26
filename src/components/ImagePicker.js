import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ImagePicker({ selectedImage, onImageSelect, onImageRemove }) {
  const handleImagePicker = () => {
    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {
          text: 'Camera',
          onPress: () => {
            // TODO: Implement camera capture
            Alert.alert('Camera', 'Tính năng chụp ảnh sẽ được thêm sau');
          },
        },
        {
          text: 'Thư viện ảnh',
          onPress: () => {
            // TODO: Implement image library picker
            // Tạm thời sử dụng ảnh mẫu
            const sampleImage = 'https://picsum.photos/400/300';
            onImageSelect(sampleImage);
          },
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ]
    );
  };

  if (selectedImage) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        <TouchableOpacity style={styles.removeButton} onPress={onImageRemove}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.pickerButton} onPress={handleImagePicker}>
      <Ionicons name="image-outline" size={24} color="#0A66C2" />
      <Text style={styles.pickerText}>Thêm ảnh</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#F3F2EF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  pickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0A66C2',
    fontWeight: '500',
  },
});

