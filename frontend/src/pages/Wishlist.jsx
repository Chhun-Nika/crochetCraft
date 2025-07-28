import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiSearch } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';
import Footer from '../components/Footer';

function Wishlist() {
  const { formatCurrency } = useCurrency();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingItems, setDeletingItems] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [messageAnimation, setMessageAnimation] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Fetching wishlist - Token exists:', !!token);
      
      if (!token) {
        // Don't set error, just set empty wishlist and let the main content handle the sign-in display
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Making API call to /api/wishlist');
      const response = await API.get('/api/wishlist');
      console.log('Wishlist API response:', response);
      console.log('Wishlist data received:', response.data);
      
      console.log('Response data type:', typeof response.data);
      console.log('Response data is array:', Array.isArray(response.data));
      
      if (response.data) {
        // Handle different response structures
        let items = [];
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          // Backend returns { orders: [...] } structure
          items = response.data.orders;
        } else if (response.data.wishlist && Array.isArray(response.data.wishlist)) {
          items = response.data.wishlist;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          items = response.data.items;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          items = response.data.products;
        } else {
          // If it's an object, try to extract items
          items = Object.values(response.data).filter(item => 
            item && typeof item === 'object' && item.id
          );
        }
        console.log('Extracted items:', items);
        console.log('First item structure:', items[0]);
        console.log('First item ID:', items[0]?.id, 'Type:', typeof items[0]?.id);
        setWishlistItems(items);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      
      if (err.response?.status === 401) {
        setError('Please log in to view your wishlist.');
      } else if (err.response?.status === 404) {
        setError('Wishlist endpoint not found. Please check the API URL.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to load wishlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    // Check if productId is valid
    if (!productId || productId === 'undefined' || productId === 'null' || isNaN(productId)) {
      alert('Invalid product ID. Please try again.');
      return;
    }
    
    // Set loading state for this specific item
    setDeletingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to manage your wishlist.');
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const productIdString = String(productId);
      const url = `/api/wishlist/remove/${productIdString}`;
      
      const response = await API.delete(url);
      
      // Remove item from local state - try multiple ID fields
      setWishlistItems(prev => {
        console.log('Previous wishlist items:', prev);
        console.log('Removing product ID:', productId);
        
        const filtered = prev.filter(item => {
          const itemId = item.id || item.product_id || item.productId;
          const shouldKeep = itemId !== productId;
          console.log(`Item ID: ${itemId}, Product ID: ${productId}, Keep: ${shouldKeep}`);
          return shouldKeep;
        });
        
        console.log('Filtered wishlist items:', filtered);
        return filtered;
      });
      
      // Show success message with animation
      setMessageAnimation('animate-slideInFromTop');
      setShowSuccessMessage('Product removed from wishlist!');
      
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowSuccessMessage('');
          setMessageAnimation('');
        }, 500);
      }, 2500);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      
      if (err.response?.status === 401) {
        setMessageAnimation('animate-slideInFromTop');
        setShowSuccessMessage('Please log in to manage your wishlist.');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowSuccessMessage('');
            setMessageAnimation('');
          }, 500);
        }, 2500);
      } else if (err.response?.status === 404) {
        setMessageAnimation('animate-slideInFromTop');
        setShowSuccessMessage('Product not found in wishlist.');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowSuccessMessage('');
            setMessageAnimation('');
          }, 500);
        }, 2500);
      } else if (err.response?.status === 500) {
        setMessageAnimation('animate-slideInFromTop');
        setShowSuccessMessage('Server error. Please try again later.');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowSuccessMessage('');
            setMessageAnimation('');
          }, 500);
        }, 2500);
      } else {
        setMessageAnimation('animate-slideInFromTop');
        setShowSuccessMessage(err.response?.data?.message || 'Failed to remove item from wishlist.');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowSuccessMessage('');
            setMessageAnimation('');
          }, 500);
        }, 2500);
      }
    } finally {
      // Clear loading state for this item
      setDeletingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setShowSuccessMessage('Please log in to add items to your cart.');
        setTimeout(() => {
          setShowSuccessMessage('');
        }, 3000);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Add product to cart via backend
      const response = await API.post('/api/cart', {
        product_id: product.id,
        quantity: 1
      });
      
      // Show success message
      setShowSuccessMessage('Product added to cart!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
      
      console.log('Cart updated:', response.data);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.response?.status === 401) {
        setShowSuccessMessage('Please log in to add items to your cart.');
      } else if (error.response?.status === 400) {
        setShowSuccessMessage(error.response.data.message || 'Invalid product data.');
      } else if (error.response?.status === 500) {
        setShowSuccessMessage('Server error. Please try again later.');
      } else {
        setShowSuccessMessage('Failed to add product to cart.');
      }
      
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <PageTransition>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading wishlist...</p>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <PageTransition>
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700 mb-4">{error}</p>
                <Link 
                  to="/login"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      <PageTransition>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 text-blue-800 px-6 py-3 rounded-lg shadow-lg border border-blue-200 transition-all duration-500 ease-in-out ${messageAnimation}`}>
            {showSuccessMessage}
          </div>
        )}
        
        {/* Header */}
        <div className="bg-white shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              {/* Check if user is logged in */}
              {!localStorage.getItem('token') ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiHeart size={24} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Sign in to access your wishlist</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                      Create an account or sign in to save your favorite products and build your personal wishlist.
                    </p>
                    <div className="space-y-3">
                      <Link 
                        to="/login"
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                      >
                        Sign In to Continue
                      </Link>
                      <div className="text-center">
                        <span className="text-gray-500 text-sm">Don't have an account? </span>
                        <Link 
                          to="/register"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          Create one here
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHeart size={32} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                  <p className="text-gray-600 mb-6">Start adding products you love to your wishlist!</p>
                  <Link 
                    to="/shop"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                // Handle different item structures
                const productData = item.product || item;
                const itemId = item.id || item.product_id || item.productId;
                
                return (
                  <ProductCard
                    key={itemId}
                    product={productData}
                    onAddToCart={addToCart}
                    onRemoveFromWishlist={removeFromWishlist}
                    showRemoveButton={true}
                    isInWishlist={true}
                    wishlistLoading={deletingItems[itemId]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Wishlist; 