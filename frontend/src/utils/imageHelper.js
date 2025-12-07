/**
 * Image Helper Utility
 * Handles proper image URL construction for profile images
 */

// Get backend base URL from API URL (remove /api suffix)
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Constructs proper image URL from various path formats
 * @param {string} imagePath - Path from database (can be full URL, /app/ path, or relative path)
 * @returns {string} - Proper full URL to access the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If already a full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If starts with /app/ (old container path format)
  if (imagePath.startsWith('/app/')) {
    // Extract just the filename and construct proper URL
    const filename = imagePath.split('/').pop();
    return `${BACKEND_URL}/uploads/profile-images/${filename}`;
  }
  
  // If proper relative path (new format like "uploads/profile-images/file.png")
  return `${BACKEND_URL}/${imagePath}`;
};

export default getImageUrl;
