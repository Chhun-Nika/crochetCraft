import axios from 'axios';

// Get the backend URL from environment or use default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const API = axios.create({
    baseURL: BACKEND_URL,
});

const token = localStorage.getItem("token");
if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, make it absolute to the backend
  if (imagePath.startsWith('/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // If it's a filename without path, assume it's in public/images
  return `${BACKEND_URL}/public/images/${imagePath}`;
};

export default API;
