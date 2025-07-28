import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiTruck, FiCheck } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Form states
  const [orderNote, setOrderNote] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    card_number: '',
    card_holder: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    card_type: '',
    card_last_four: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await API.get('/api/cart');
      
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data.cart && Array.isArray(response.data.cart)) {
        items = response.data.cart;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else {
        items = Object.values(response.data || {}).filter(item => 
          item && typeof item === 'object' && (item.id || item.product_id || item.productId)
        );
      }

      if (items.length === 0) {
        navigate('/cart');
        return;
      }

      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price || item.product?.price || 0);
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateShippingInfo = () => {
    const errors = {};
    
    // Match backend validation exactly
    if (!shippingInfo.first_name || shippingInfo.first_name.trim() === '') {
      errors.first_name = 'First name is required';
    }
    
    if (!shippingInfo.last_name || shippingInfo.last_name.trim() === '') {
      errors.last_name = 'Last name is required';
    }
    
    if (!shippingInfo.email || shippingInfo.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingInfo.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (!shippingInfo.phone || shippingInfo.phone.trim() === '') {
      errors.phone = 'Phone is required';
    } else if (shippingInfo.phone.trim().length < 10) {
      errors.phone = 'Please enter a valid phone number (minimum 10 digits)';
    }
    
    if (!shippingInfo.address || shippingInfo.address.trim() === '') {
      errors.address = 'Address is required';
    } else if (shippingInfo.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }
    
    if (!shippingInfo.city || shippingInfo.city.trim() === '') {
      errors.city = 'City is required';
    }
    
    if (!shippingInfo.state || shippingInfo.state.trim() === '') {
      errors.state = 'State is required';
    }
    
    if (!shippingInfo.zip_code || shippingInfo.zip_code.trim() === '') {
      errors.zip_code = 'ZIP code is required';
    } else if (shippingInfo.zip_code.trim().length < 5) {
      errors.zip_code = 'ZIP code must be at least 5 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentInfo = () => {
    const errors = {};
    
    // Match backend validation exactly
    if (!paymentInfo.card_last_four || paymentInfo.card_last_four.trim() === '') {
      errors.card_last_four = 'Card last four digits is required';
    } else if (paymentInfo.card_last_four.trim().length !== 4 || !/^\d{4}$/.test(paymentInfo.card_last_four.trim())) {
      errors.card_last_four = 'Card last four digits must be 4 numbers';
    }
    
    if (!paymentInfo.card_type || paymentInfo.card_type.trim() === '') {
      errors.card_type = 'Card type is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShippingInfo()) {
      setCurrentStep(2);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (validatePaymentInfo()) {
      // Determine card type based on card number
      const cardNumber = paymentInfo.card_number.replace(/\s/g, '');
      let cardType = 'Unknown';
      
      if (cardNumber.startsWith('4')) {
        cardType = 'Visa';
      } else if (cardNumber.startsWith('5')) {
        cardType = 'Mastercard';
      } else if (cardNumber.startsWith('3')) {
        cardType = 'American Express';
      } else if (cardNumber.startsWith('6')) {
        cardType = 'Discover';
      }

      setPaymentInfo(prev => ({
        ...prev,
        card_type: cardType,
        card_last_four: cardNumber.slice(-4)
      }));

      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate all forms before proceeding
      const isShippingValid = validateShippingInfo();
      const isPaymentValid = validatePaymentInfo();
      
      if (!isShippingValid || !isPaymentValid) {
        setError('Please fill in all required fields correctly.');
        return;
      }

      setProcessing(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to complete your order.');
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Match backend validateCheckout middleware structure exactly
      const orderData = {
        items: cartItems.map(item => ({
          product_id: parseInt(item.id || item.product_id || item.productId),
          quantity: parseInt(item.quantity || 1)
        })),
        shippingInfo: {
          first_name: shippingInfo.first_name.trim(),
          last_name: shippingInfo.last_name.trim(),
          email: shippingInfo.email.trim(),
          phone: shippingInfo.phone.trim(),
          address: shippingInfo.address.trim(),
          city: shippingInfo.city.trim(),
          state: shippingInfo.state.trim(),
          zip_code: shippingInfo.zip_code.trim(),
          country: shippingInfo.country.trim()
        },
        paymentInfo: {
          card_last_four: paymentInfo.card_last_four,
          card_type: paymentInfo.card_type
        },
        total_amount: parseFloat(calculateTotal().toFixed(2))
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2)); // Debug log
      console.log('Cart items:', cartItems); // Debug cart items
      console.log('Shipping info:', shippingInfo); // Debug shipping info
      console.log('Payment info:', paymentInfo); // Debug payment info

      const response = await API.post('/api/order', orderData);

      if (response.data) {
        setSuccess('Order placed successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }

    } catch (err) {
      console.error('Error placing order:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid order data. Please check your information.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to complete your order.';
      } else if (err.response?.status === 422) {
        errorMessage = err.response.data?.message || 'Validation failed. Please check your information.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (formType, field, value) => {
    if (formType === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [field]: value }));
    } else if (formType === 'payment') {
      setPaymentInfo(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageTransition>
        {/* Success/Error Messages */}
        {success && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-lg border border-green-200">
            {success}
          </div>
        )}

        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 text-red-800 px-6 py-3 rounded-lg shadow-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FiArrowLeft size={20} />
                <span>Back to Cart</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {currentStep > 1 ? <FiCheck size={16} /> : '1'}
                </div>
                <span className="font-medium">Shipping</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {currentStep > 2 ? <FiCheck size={16} /> : '2'}
                </div>
                <span className="font-medium">Payment</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="font-medium">Review</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <FiTruck size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.first_name}
                          onChange={(e) => handleInputChange('shipping', 'first_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.first_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.first_name && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.last_name}
                          onChange={(e) => handleInputChange('shipping', 'last_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.last_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.last_name && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.state}
                          onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.state && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.zip_code}
                          onChange={(e) => handleInputChange('shipping', 'zip_code', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.zip_code ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.zip_code && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.zip_code}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <FiCreditCard size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.card_number}
                        onChange={(e) => handleInputChange('payment', 'card_number', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.card_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.card_number && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.card_number}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.card_holder}
                        onChange={(e) => handleInputChange('payment', 'card_holder', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.card_holder ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.card_holder && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.card_holder}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Month *
                        </label>
                        <select
                          value={paymentInfo.expiry_month}
                          onChange={(e) => handleInputChange('payment', 'expiry_month', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.expiry_month ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        {formErrors.expiry_month && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.expiry_month}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year *
                        </label>
                        <select
                          value={paymentInfo.expiry_year}
                          onChange={(e) => handleInputChange('payment', 'expiry_year', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.expiry_year ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">YYYY</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        {formErrors.expiry_year && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.expiry_year}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => handleInputChange('payment', 'cvv', e.target.value.replace(/\D/g, ''))}
                          maxLength="4"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.cvv && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back to Shipping
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Review Order
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>

                  {/* Order Notes */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Order Notes (Optional)</h3>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Add any special instructions or notes for your order..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>

                  {/* Shipping Information Review */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {shippingInfo.first_name} {shippingInfo.last_name}
                      </p>
                      <p className="text-gray-700">{shippingInfo.email}</p>
                      <p className="text-gray-700">{shippingInfo.phone}</p>
                      <p className="text-gray-700">{shippingInfo.address}</p>
                      <p className="text-gray-700">
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip_code}
                      </p>
                      <p className="text-gray-700">{shippingInfo.country}</p>
                    </div>
                  </div>

                  {/* Payment Information Review */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {paymentInfo.card_type} ending in {paymentInfo.card_last_four}
                      </p>
                      <p className="text-gray-700">Cardholder: {paymentInfo.card_holder}</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Payment
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={processing}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id || item.product_id} className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name || item.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency((item.price || item.product?.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-50 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Checkout; 