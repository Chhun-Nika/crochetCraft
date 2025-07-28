import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { getImageUrl } from '../api';
import { useCurrency } from '../context/CurrencyContext';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [showMessage, setShowMessage] = useState('');
  const [messageAnimation, setMessageAnimation] = useState('');

  useEffect(() => {
    fetchProductDetails();
    checkWishlistStatus();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to load product details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await API.get('/api/wishlist');
      const wishlistItems = response.data.orders || response.data || [];
      const isInWishlist = wishlistItems.some(item => 
        item.id === parseInt(id) || 
        item.product_id === parseInt(id) || 
        item.product?.id === parseInt(id)
      );
      setIsInWishlist(isInWishlist);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = async () => {
    try {
      setCartLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setShowMessage('Please log in to add items to cart');
        setMessageAnimation('animate-slideInFromTop');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowMessage('');
            setMessageAnimation('');
          }, 500);
        }, 3000);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.post('/api/cart', {
        product_id: parseInt(id),
        quantity: quantity
      });

      setShowMessage('Product added to cart successfully!');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowMessage('');
          setMessageAnimation('');
        }, 500);
      }, 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setShowMessage('Failed to add product to cart. Please try again.');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
    } finally {
      setCartLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setShowMessage('Please log in to manage wishlist');
        setMessageAnimation('animate-slideInFromTop');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowMessage('');
            setMessageAnimation('');
          }, 500);
        }, 3000);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (isInWishlist) {
        // Remove from wishlist
        await API.delete(`/api/wishlist/remove/${id}`);
        setIsInWishlist(false);
        setShowMessage('Product removed from wishlist');
      } else {
        // Add to wishlist
        await API.post('/api/wishlist', {
          product_id: parseInt(id)
        });
        setIsInWishlist(true);
        setShowMessage('Product added to wishlist');
      }

      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowMessage('');
          setMessageAnimation('');
        }, 500);
      }, 2000);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setShowMessage('Failed to update wishlist. Please try again.');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/shop')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageTransition>
        {/* Message Display */}
        {showMessage && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg border transition-all duration-500 ease-in-out ${messageAnimation} ${
            showMessage.includes('successfully') || showMessage.includes('added to wishlist') || showMessage.includes('removed from wishlist')
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
          }`}>
            {showMessage}
          </div>
        )}

        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 px-4">Product Details</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg shadow-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-xl" style={{ display: 'none' }}>
                  <span className="text-gray-400">No Image</span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(product.price))}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {product.category && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={cartLoading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiShoppingCart size={20} />
                  )}
                  <span>{cartLoading ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isInWishlist
                      ? 'text-red-500 bg-red-50 hover:bg-red-100'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {wishlistLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                  ) : (
                    <FiHeart size={20} className={isInWishlist ? 'fill-current' : ''} />
                  )}
                </button>
              </div>

              {/* Product Features */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiTruck className="text-green-500" size={20} />
                    <span className="text-gray-700">Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiShield className="text-green-500" size={20} />
                    <span className="text-gray-700">30-day return policy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiStar className="text-green-500" size={20} />
                    <span className="text-gray-700">Handmade with care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}

export default ProductDetails; 