import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import { FaUser, FaHeart, FaShoppingCart, FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';
import { FiUser, FiHeart, FiShoppingCart, FiDollarSign, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const currencyTimeoutRef = useRef(null);
  const accountTimeoutRef = useRef(null);

  // Function to refresh user data
  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await API.get('/api/user/profile');
        console.log('Refreshed user data from API:', response.data);
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error refreshing user data:', error);
        if (error.response?.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete API.defaults.headers.common['Authorization'];
        }
      }
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      
      // First try to get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('User data from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      
      // Always refresh user data from API to ensure it's up to date
      refreshUserData();
    }
  }, []);

  // Listen for user data updates from other components and page focus
  useEffect(() => {
    const handleUserDataUpdate = (event) => {
      console.log('Navbar received user data update:', event.detail);
      setUser(event.detail);
      // Force re-render by updating authentication state
      setIsAuthenticated(true);
    };

    const handleStorageChange = (event) => {
      if (event.key === 'user' && event.newValue) {
        console.log('Navbar received storage change for user:', event.newValue);
        try {
          const updatedUser = JSON.parse(event.newValue);
          setUser(updatedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
        }
      }
    };

    const handlePageFocus = () => {
      console.log('Page focused, refreshing user data');
      refreshUserData();
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handlePageFocus);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, []);

  // Function to handle clicks outside of dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Close currency dropdown if clicked outside
      if (isCurrencyOpen && !event.target.closest('[data-currency-dropdown]')) {
        setIsCurrencyOpen(false);
      }
      
      // Close account dropdown if clicked outside
      if (isAccountOpen && !event.target.closest('[data-account-dropdown]') && !event.target.closest('[data-account-button]')) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCurrencyOpen, isAccountOpen]);

  const handleCurrencyEnter = () => {
    if (currencyTimeoutRef.current) {
      clearTimeout(currencyTimeoutRef.current);
    }
    setIsCurrencyOpen(true);
  };

  const handleCurrencyLeave = () => {
    currencyTimeoutRef.current = setTimeout(() => {
      setIsCurrencyOpen(false);
    }, 200); // 200ms delay before closing
  };

  const handleAccountEnter = () => {
    if (accountTimeoutRef.current) {
      clearTimeout(accountTimeoutRef.current);
    }
    setIsAccountOpen(true);
  };

  const handleAccountLeave = () => {
    // Don't close dropdown if user is logging out
    if (isLoggingOut) return;
    
    accountTimeoutRef.current = setTimeout(() => {
      setIsAccountOpen(false);
    }, 200); // 200ms delay before closing
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Keep dropdown open during logout animation
    
    // Simulate logout animation delay
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoggingOut(false);
      setIsAccountOpen(false); // Close dropdown after logout is complete
      // Remove token from API headers
      delete API.defaults.headers.common['Authorization'];
    }, 800);
  };

  // Debug logging
  console.log('Navbar render - isAuthenticated:', isAuthenticated, 'user:', user);
  console.log('User name in navbar:', user?.name);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Nav Links */}
          <div className="flex items-center space-x-15">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <h1 className="text-3xl font-bold text-blue-600 tracking-tight cursor-pointer">CrochetCraft</h1>
            </div>
            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors cursor-pointer ${
                  location.pathname === '/' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`font-medium transition-colors cursor-pointer ${
                  location.pathname === '/shop' || location.pathname.startsWith('/product/')
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                className={`font-medium transition-colors cursor-pointer ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium transition-colors cursor-pointer ${location.pathname === '/contact' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right: Icons and Controls */}
          <div className="flex items-center space-x-4">
            {/* Wishlist Icon - Hidden on mobile */}
            <Link to="/wishlist" className={`p-2 hover:bg-blue-50 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 cursor-pointer hidden lg:block ${
              location.pathname === '/wishlist' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:text-blue-600'
            }`} title="Wishlist">
              <FiHeart size={20} className="transition-all duration-300" />
            </Link>
            {/* Cart Icon - Hidden on mobile */}
            <Link to="/cart" className={`p-2 hover:bg-blue-50 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 cursor-pointer hidden lg:block ${
              location.pathname === '/cart' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:text-blue-600'
            }`} title="Cart">
              <FiShoppingCart size={20} className="transition-all duration-300" />
            </Link>
            {/* Currency Dropdown - Hidden on mobile */}
            <div className="relative hidden lg:block" onMouseEnter={handleCurrencyEnter} onMouseLeave={handleCurrencyLeave}>
              <button
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center"
                title={`Currency: ${currency}`}
                aria-haspopup="true"
                aria-expanded={isCurrencyOpen}
              >
                {currency === 'USD' ? <FiDollarSign size={20} className="transition-all duration-300" /> : <FaMoneyBillWave size={20} className="transition-all duration-300" />}
                <span className="ml-1 text-sm font-medium hidden md:inline">{currency}</span>
              </button>
              {isCurrencyOpen && (
                <div 
                  data-currency-dropdown
                  className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn"
                >
                  <button
                    className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer ${currency === 'USD' ? 'font-bold' : ''}`}
                    onClick={() => setCurrency('USD')}
                  >USD</button>
                  <button
                    className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer ${currency === 'RIELS' ? 'font-bold' : ''}`}
                    onClick={() => setCurrency('RIELS')}
                  >RIELS</button>
                </div>
              )}
            </div>
            {/* Profile Icon - Hidden on mobile */}
            <div className="relative hidden lg:block" onMouseEnter={handleAccountEnter} onMouseLeave={handleAccountLeave}>
              <button
                data-account-button
                className={`flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                  isAuthenticated ? 'bg-blue-50 text-blue-600' : ''
                }`}
                title={isAuthenticated ? user?.name || 'Account' : 'Account'}
                aria-haspopup="true"
                aria-expanded={isAccountOpen}
              >
                {isAuthenticated && user ? (
                  <>
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-6 h-6 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium hidden xl:block">{user.name}</span>
                  </>
                ) : (
                  <FiUser size={20} className="transition-all duration-300" />
                )}
              </button>
              {isAccountOpen && (
                <div 
                  data-account-dropdown
                  className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn"
                  onMouseEnter={() => {
                    if (accountTimeoutRef.current) {
                      clearTimeout(accountTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={handleAccountLeave}
                >
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        <Link to="/profile" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">Profile</Link>
                        <Link to="/orders" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">Orders</Link>
                        <button 
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-4 border-red-600 border-t-transparent"></div>
                              <span>Signing out...</span>
                            </div>
                          ) : (
                            'Sign Out'
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setIsAccountOpen(false)} className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                          <FiLogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                        <Link to="/register" onClick={() => setIsAccountOpen(false)} className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                          <FiUserPlus className="mr-2 h-4 w-4" />
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-blue-600 focus:outline-none p-2 hover:bg-blue-100 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 cursor-pointer"
              title="Menu"
            >
              <svg className="w-6 h-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-0 right-0 h-full w-80 bg-gray-50 shadow-xl z-50 transform transition-all duration-500 ease-out animate-slideInRightSlow">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="text-xl font-bold text-blue-600">Menu</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-6 overflow-y-auto h-full bg-gray-50 pb-32">
                {/* Currency Section - Moved to Top */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Currency</h3>
                                        <div className="relative bg-gray-200 rounded-lg p-1 flex w-28">
                      <button 
                        className={`relative z-10 flex-1 h-6 rounded text-xs font-medium transition-all duration-300 flex items-center justify-center ${currency === 'USD' ? 'text-white' : 'text-gray-700'}`}
                        onClick={() => setCurrency('USD')}
                      >
                        USD
                      </button>
                      <button 
                        className={`relative z-10 flex-1 h-6 rounded text-xs font-medium transition-all duration-300 flex items-center justify-center ${currency === 'RIELS' ? 'text-white' : 'text-gray-700'}`}
                        onClick={() => setCurrency('RIELS')}
                      >
                        RIELS
                      </button>
                      {/* Animated Background Slider */}
                      <div 
                        className={`absolute top-1 bottom-1 bg-blue-600 rounded transition-all duration-300 ease-in-out ${
                          currency === 'USD' 
                            ? 'left-1 w-[calc(50%-0.25rem)]' 
                            : 'left-[calc(50%-0.125rem)] w-[calc(50%-0.25rem)]'
                        }`}
                      />
                    </div>
                  </div>
                </div>


                
                {/* Navigation Links */}
                <div className="space-y-1">
                  <Link 
                    to="/" 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      location.pathname === '/' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">Home</span>
                  </Link>
                  
                  <Link 
                    to="/shop" 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      location.pathname === '/shop' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">Shop</span>
                  </Link>
                  
                  <Link 
                    to="/about" 
                    className={`flex items-center space-x-3 p-3 font-medium transition-colors rounded-lg cursor-pointer ${location.pathname === '/about' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">About Us</span>
                  </Link>
                  
                  <Link 
                    to="/contact" 
                    className={`flex items-center space-x-3 p-3 font-medium transition-colors rounded-lg cursor-pointer ${location.pathname === '/contact' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Contact Us</span>
                  </Link>
                </div>
                
                {/* Shopping Section - Moved Up */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shopping</h3>
                  <div className="space-y-1">
                    <Link to="/wishlist" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      location.pathname === '/wishlist' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}>
                      <FiHeart size={20} />
                      <span>Wishlist</span>
                    </Link>
                    <Link to="/cart" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      location.pathname === '/cart' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}>
                      <FiShoppingCart size={20} />
                      <span>Cart</span>
                    </Link>
                  </div>
                </div>
                
                {/* Account Section - Moved Down */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                  
                  {/* User Info - Show when authenticated */}
                  {isAuthenticated && user && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {isAuthenticated ? (
                      <>
                        <Link to="/profile" className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <FiUser size={20} />
                          <span>Profile</span>
                        </Link>
                        <Link to="/orders" className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Orders</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                              <span>Signing out...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Sign Out</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <FiLogIn size={20} />
                          <span>Sign In</span>
                        </Link>
                        <Link to="/register" className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <FiUserPlus size={20} />
                          <span>Sign Up</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 