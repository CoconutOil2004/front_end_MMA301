// config/cloudinary.config.js

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dxyz123abc', // Thay bằng cloud name của bạn
  UPLOAD_PRESET: 'lost_and_found_preset', // Thay bằng upload preset của bạn
  API_URL: 'https://api.cloudinary.com/v1_1/djgwvheo3/image/upload', // Thay your_cloud_name
};

/**
 * Hướng dẫn setup Cloudinary:
 * 1. Đăng ký tài khoản tại https://cloudinary.com
 * 2. Lấy Cloud Name từ Dashboard
 * 3. Tạo Upload Preset:
 *    - Vào Settings > Upload
 *    - Scroll xuống "Upload presets"
 *    - Click "Add upload preset"
 *    - Đặt tên preset (ví dụ: "lost_and_found_preset")
 *    - Signing Mode: "Unsigned"
 *    - Folder: "lost-and-found" (tùy chọn)
 *    - Click Save
 */