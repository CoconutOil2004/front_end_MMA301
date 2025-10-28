// utils/cloudinaryUpload.js

import { CLOUDINARY_CONFIG } from '../config/cloudinary.config';

/**
 * Upload ảnh lên Cloudinary
 * @param {string} uri - URI của ảnh từ ImagePicker
 * @param {Object} options - Tùy chọn upload
 * @param {string} options.folder - Folder trên Cloudinary
 * @param {string} options.publicId - Public ID cho ảnh
 * @param {Function} options.onProgress - Callback để theo dõi tiến trình
 * @returns {Promise<Object>} - Response từ Cloudinary
 */
export const uploadToCloudinary = async (uri, options = {}) => {
  try {
    const {
      folder = 'lost-and-found',
      publicId = `photo_${Date.now()}`,
      onProgress,
    } = options;

    // Tạo FormData
    const formData = new FormData();
    
    // Lấy tên file và extension
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Thêm file vào FormData
    formData.append('file', {
      uri: uri,
      type: type,
      name: filename || `${publicId}.jpg`,
    });

    // Thêm các tham số Cloudinary
    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('public_id', publicId);

    console.log('Starting upload to Cloudinary...');

    // Gửi request với XMLHttpRequest để theo dõi progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Theo dõi tiến trình upload
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Xử lý khi hoàn thành
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('Upload successful:', response.secure_url);
          resolve(response);
        } else {
          const error = JSON.parse(xhr.responseText);
          console.error('Upload failed:', error);
          reject(new Error(error.error?.message || 'Upload failed'));
        }
      });

      // Xử lý lỗi
      xhr.addEventListener('error', () => {
        console.error('Network error during upload');
        reject(new Error('Lỗi mạng khi tải ảnh lên'));
      });

      // Xử lý timeout
      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout');
        reject(new Error('Quá thời gian chờ khi tải ảnh lên'));
      });

      // Cấu hình và gửi request
      xhr.open('POST', CLOUDINARY_CONFIG.API_URL);
      xhr.timeout = 60000; // 60 seconds timeout
      xhr.send(formData);
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload nhiều ảnh lên Cloudinary
 * @param {Array<string>} uris - Mảng các URI ảnh
 * @param {Object} options - Tùy chọn upload
 * @returns {Promise<Array<Object>>} - Mảng response từ Cloudinary
 */
export const uploadMultipleToCloudinary = async (uris, options = {}) => {
  try {
    const uploadPromises = uris.map((uri, index) => {
      const publicId = `${options.publicId || 'photo'}_${Date.now()}_${index}`;
      return uploadToCloudinary(uri, {
        ...options,
        publicId,
      });
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Xóa ảnh từ Cloudinary (cần API key và secret)
 * Lưu ý: Chức năng này cần được thực hiện từ backend vì lý do bảo mật
 * @param {string} publicId - Public ID của ảnh cần xóa
 */
export const deleteFromCloudinary = async (publicId) => {
  console.warn('Deletion should be handled from backend for security reasons');
  throw new Error('Please implement deletion from your backend server');
};

/**
 * Lấy URL ảnh với transformation
 * @param {string} publicId - Public ID của ảnh
 * @param {Object} transformations - Các transformation cần áp dụng
 * @returns {string} - URL ảnh đã transform
 */
export const getTransformedImageUrl = (publicId, transformations = {}) => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = transformations;

  let transformString = `q_${quality},f_${format}`;
  
  if (width || height) {
    transformString += `,c_${crop}`;
    if (width) transformString += `,w_${width}`;
    if (height) transformString += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
};

/**
 * Tối ưu hóa URL ảnh cho hiển thị
 * @param {string} url - URL ảnh gốc từ Cloudinary
 * @param {Object} options - Tùy chọn tối ưu
 * @returns {string} - URL ảnh đã tối ưu
 */
export const optimizeImageUrl = (url, options = {}) => {
  const {
    width = 800,
    quality = 'auto',
    format = 'auto',
  } = options;

  // Chỉ xử lý nếu là URL Cloudinary
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // Thêm transformations vào URL
  const urlParts = url.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/w_${width},q_${quality},f_${format}/${urlParts[1]}`;
  }

  return url;
};