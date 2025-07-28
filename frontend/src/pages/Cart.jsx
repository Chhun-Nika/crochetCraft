import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiSearch } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';
import Footer from '../components/Footer';

function Cart() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState({});
  const [animatingItems, setAnimatingItems] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const [messageAnimation, setMessageAnimation] = useState('');

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setShowErrorMessage('Please log in to view your cart.');
        setMessageAnimation('animate-slideInFromTop');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowErrorMessage('');
            setMessageAnimation('');
          }, 500);
        }, 3000);
        setLoading(false);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await API.get('/api/cart');
      
      // Handle different response structures
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data.cart && Array.isArray(response.data.cart)) {
        items = response.data.cart;
      } else {
        items = Object.values(response.data || {}).filter(item => 
          item && typeof item === 'object' && (item.id || item.product_id || item.productId)
        );
      }
      
      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      
      if (err.response?.status === 401) {
        setShowErrorMessage('Please log in to view your cart.');
      } else if (err.response?.status === 404) {
        setShowErrorMessage('Cart endpoint not found. Please check the API URL.');
      } else if (err.response?.status === 500) {
        setShowErrorMessage('Server error. Please try again later.');
      } else {
        setShowErrorMessage('Failed to load cart items. Please try again.');
      }
      
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Set loading state for this specific item
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowErrorMessage('Please log in to update your cart.');
        setMessageAnimation('animate-slideInFromTop');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowErrorMessage('');
            setMessageAnimation('');
          }, 500);
        }, 3000);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update quantity via backend using the correct route
      const response = await API.put(`/api/cart/update/${productId}`, { quantity: newQuantity });
      

    } catch (error) {
      console.error('Error updating quantity:', error);
      
      // Revert optimistic update on error
      setCartItems(prev => prev.map(item => {
        const itemId = item.id || item.product_id || item.productId;
        if (itemId === productId) {
          // Revert to previous quantity
          const currentItem = prev.find(i => (i.id || i.product_id || i.productId) === productId);
          return { ...item, quantity: currentItem ? currentItem.quantity : 1 };
        }
        return item;
      }));
      
      if (error.response?.status === 401) {
        setShowErrorMessage('Please log in to update your cart.');
      } else if (error.response?.status === 400) {
        setShowErrorMessage(error.response.data.message || 'Invalid quantity data.');
      } else if (error.response?.status === 404) {
        setShowErrorMessage('Product not found in cart.');
      } else if (error.response?.status === 500) {
        setShowErrorMessage('Server error. Please try again later.');
      } else {
        setShowErrorMessage('Failed to update quantity. Please try again.');
      }
      
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
      

    } finally {
      // Clear loading state for this item
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleQuantityClick = (productId, newQuantity) => {
    // Prevent quantity from going below 1
    if (newQuantity < 1) {
      return;
    }
    
    // Add button press animation
    const button = event.target.closest('button');
    if (button) {
      button.classList.add('animate-buttonPress');
      setTimeout(() => {
        button.classList.remove('animate-buttonPress');
      }, 300);
    }
    
    // Start quantity change animation
    setAnimatingItems(prev => ({ ...prev, [productId]: true }));
    
    // Optimistic update - update UI immediately
    setCartItems(prev => prev.map(item => {
      const itemId = item.id || item.product_id || item.productId;
      if (itemId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
    
    // Clear animation after it completes
    setTimeout(() => {
      setAnimatingItems(prev => ({ ...prev, [productId]: false }));
    }, 500);
    
    // Make API call
    updateQuantity(productId, newQuantity);
  };

  const removeFromCart = async (productId) => {
    // Set loading state for this specific item
    setRemovingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowErrorMessage('Please log in to manage your cart.');
        setMessageAnimation('animate-slideInFromTop');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowErrorMessage('');
            setMessageAnimation('');
          }, 500);
        }, 3000);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Remove item via backend using the correct route
      await API.delete(`/api/cart/remove/${productId}`);
      
      // Update local state immediately for smooth UX
      setCartItems(prev => prev.filter(item => {
        const itemId = item.id || item.product_id || item.productId;
        return itemId !== productId;
      }));
      
      // Show success message
      setShowErrorMessage('Item removed from cart successfully!');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 2000);
      
    } catch (error) {
      console.error('Error removing item:', error);
      
      if (error.response?.status === 401) {
        setShowErrorMessage('Please log in to manage your cart.');
      } else if (error.response?.status === 404) {
        setShowErrorMessage('Item not found in cart.');
      } else if (error.response?.status === 500) {
        setShowErrorMessage('Server error. Please try again later.');
      } else {
        setShowErrorMessage('Failed to remove item. Please try again.');
      }
      
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
    } finally {
      // Clear loading state for this item
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowErrorMessage('Please log in to manage your cart.');
        setMessageAnimation('animate-slideInFromTop');
        setTimeout(() => {
          setMessageAnimation('animate-slideOutToTop');
          setTimeout(() => {
            setShowErrorMessage('');
            setMessageAnimation('');
          }, 500);
        }, 3000);
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Clear cart via backend
      await API.delete('/api/cart');
      
      // Update local state immediately for smooth UX
      setCartItems([]);
      
      // Show success message
      setShowErrorMessage('Cart cleared successfully!');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 2000);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setShowErrorMessage('Failed to clear cart. Please try again.');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setShowErrorMessage('Your cart is empty. Please add items before checkout.');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => {
          setShowErrorMessage('');
          setMessageAnimation('');
        }, 500);
      }, 3000);
      return;
    }

    // Navigate to checkout page with cart items
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchCartItems}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      <PageTransition>
        {/* Message Display */}
        {showErrorMessage && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg border transition-all duration-500 ease-in-out ${messageAnimation} ${
            showErrorMessage.includes('successfully') 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
          }`}>
            {showErrorMessage}
          </div>
        )}

      {/* Header */}
      <div className="bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors px-3 py-1 rounded-lg cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            {/* Check if user is logged in */}
            {!localStorage.getItem('token') ? (
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiShoppingBag size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sign in to access your cart</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    Create an account or sign in to add items to your cart and start shopping.
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
                  <FiShoppingBag size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
                <Link 
                  to="/shop"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                
                <div className="border-t border-gray-100">
                  {cartItems.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      variant="cart"
                      showQuantity={true}
                      quantity={item.quantity}
                      onQuantityChange={handleQuantityClick}
                      showRemoveButton={true}
                      onRemoveFromCart={removeFromCart}
                      cartLoading={updatingItems[item.id || item.product_id || item.productId] || removingItems[item.id || item.product_id || item.productId]}
                      className={`p-6 transition-all duration-500 ease-in-out ${
                        updatingItems[item.id || item.product_id || item.productId] 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </div>
                  <div className="pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <Link 
                    to="/shop"
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </PageTransition>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Cart; 