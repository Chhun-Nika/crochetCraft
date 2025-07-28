import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiFilter } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

function Shop() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [messageAnimation, setMessageAnimation] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const limit = 12; // Products per page
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownTimeout = useRef();
  const categoryDropdownRef = useRef();
  // Remove productsTransitionKey state

  useEffect(() => {
    // Test API connection first
    console.log('API base URL:', API.defaults.baseURL);
    console.log('API headers:', API.defaults.headers);
    
    // Check for category parameters in URL
    const categoryFromUrl = searchParams.get('category');
    const categoryIdFromUrl = searchParams.get('categoryId');
    
    if (categoryFromUrl && categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl);
      setSelectedCategoryName(categoryFromUrl);
    }
    
    // Check for search parameter in URL
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
    
    fetchCategories();
    fetchUserWishlist();
  }, [searchParams]);

  // Add click outside handler for category dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle click outside on both mobile and desktop
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    // Add both mouse and touch event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    // Reset to page 1 when category changes
    setCurrentPage(1);
    fetchProducts(1, true);
  }, [selectedCategory]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== searchParams.get('search')) {
        setSearchLoading(true);
        setCurrentPage(1);
        fetchProducts(1, true);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Update URL when search term changes (without triggering fetch)
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newSearchParams.set('search', searchTerm.trim());
    } else {
      newSearchParams.delete('search');
    }
    // Only update if the search param actually changed
    if (newSearchParams.get('search') !== searchParams.get('search')) {
      setSearchParams(newSearchParams);
    }
  }, [searchTerm]);

  const fetchProducts = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      setError('');
      
      let url = `/api/products?limit=${limit}&page=${page}`;
      
      // Add category filter if selected
      if (selectedCategory && selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      // Add search filter if search term exists
      if (searchTerm && searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      
      console.log('Pagination Debug:', {
        page,
        limit,
        url,
        expectedProducts: `${(page - 1) * limit + 1} to ${page * limit}`,
        timestamp: new Date().toISOString()
      });
      
      console.log('Fetching products from:', url);
      
      const response = await API.get(url);
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // Check if response.data exists
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Handle backend response structure with pagination
      let productsData, totalCount, paginationInfo;
      
      console.log('Response data structure:', response.data);
      
      if (response.data.products && response.data.pagination) {
        // Your backend structure:
        {
        //   "products": [...],
        //   "pagination": {
        //     "currentPage": 1,
        //     "totalPages": 1,
        //     "totalItems": 10,
        //     "itemsPerPage": 10,
        //     "hasNextPage": false,
        //     "hasPrevPage": false
        //   }
        }
        productsData = response.data.products;
        totalCount = response.data.pagination.totalItems;
        paginationInfo = response.data.pagination;
        console.log('Using pagination response format');
        console.log('Backend pagination info:', paginationInfo);
      } else if (response.data.products && typeof response.data.total === 'number') {
        // Alternative structured response: { products: [...], total: number }
        productsData = response.data.products;
        totalCount = response.data.total;
        console.log('Using structured response format');
      } else if (Array.isArray(response.data)) {
        // Array response: [...]
        productsData = response.data;
        totalCount = response.data.length;
        console.log('Using array response format');
      } else {
        // Fallback
        productsData = response.data || [];
        totalCount = Array.isArray(response.data) ? response.data.length : 0;
        console.log('Using fallback format');
      }
      
      console.log('Extracted products:', productsData);
      console.log('Extracted total:', totalCount);
      
      // Validate response structure
      if (!productsData || !Array.isArray(productsData)) {
        console.error('Invalid products data:', productsData);
        throw new Error('Invalid products data received from server');
      }
      
      // Always set products (no more append for pagination)
      setProducts(productsData);
      setCurrentPage(page);
      
      console.log('Products received for page', page, ':', productsData.map(p => ({ id: p.id, name: p.name })));
      console.log('Product IDs for page', page, ':', productsData.map(p => p.id));
      
      setTotalProducts(totalCount);
      
      // Use backend pagination info if available, otherwise calculate
      if (paginationInfo) {
        setTotalPages(paginationInfo.totalPages);
        setHasMore(paginationInfo.hasNextPage);
        console.log('Using backend pagination:', paginationInfo);
      } else {
        setTotalPages(Math.ceil(totalCount / limit));
        setHasMore(page < Math.ceil(totalCount / limit));
      }
      
      console.log('Pagination state updated:', {
        currentPage: page,
        totalPages: paginationInfo ? paginationInfo.totalPages : Math.ceil(totalCount / limit),
        totalProducts: totalCount,
        hasMore: paginationInfo ? paginationInfo.hasNextPage : page < Math.ceil(totalCount / limit)
      });
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setHasMore(false);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await API.get('/api/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      console.error('Categories error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await API.get('/api/wishlist');
      
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data.wishlist && Array.isArray(response.data.wishlist)) {
        items = response.data.wishlist;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        items = response.data.products;
      } else {
        items = Object.values(response.data || {}).filter(item => 
          item && typeof item === 'object' && (item.id || item.product_id || item.productId)
        );
      }
      
      setWishlistItems(items);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
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
      setShowSuccessMessage(`${product.name} added to cart!`);
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
        setShowSuccessMessage('Failed to add item to cart. Please try again.');
      }
      
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product.id || product._id;
    
    if (!localStorage.getItem('token')) {
      setShowSuccessMessage('Please sign in to add items to your wishlist');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => setShowSuccessMessage(''), 500);
      }, 3000);
      return;
    }
    
    setWishlistLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const isInWishlist = isProductInWishlist(product);
      
      if (isInWishlist) {
        // Remove from wishlist
        await API.delete(`/api/wishlist/remove/${productId}`);
        setWishlistItems(prev => prev.filter(item => {
          const itemId = item.id || item.product_id || item.productId;
          return itemId !== productId;
        }));
        setShowSuccessMessage('Product removed from wishlist');
      } else {
        // Add to wishlist
        await API.post('/api/wishlist', { product_id: productId });
        setWishlistItems(prev => [...prev, product]);
        setShowSuccessMessage('Product added to wishlist');
      }
      
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => setShowSuccessMessage(''), 500);
      }, 3000);
      
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setShowSuccessMessage('Failed to update wishlist');
      setMessageAnimation('animate-slideInFromTop');
      setTimeout(() => {
        setMessageAnimation('animate-slideOutToTop');
        setTimeout(() => setShowSuccessMessage(''), 500);
      }, 3000);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1 && !loading) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchProducts(prevPage, true);
      window.scrollTo(0, 0); // Scroll to top when changing pages
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
      window.scrollTo(0, 0); // Scroll to top when changing pages
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage && !loading) {
      setCurrentPage(pageNumber);
      fetchProducts(pageNumber, true);
      window.scrollTo(0, 0); // Scroll to top when changing pages
    }
  };



  const handleCategoryChange = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName);
    setCurrentPage(1);
    // setProductsTransitionKey(prev => prev + 1); // trigger animation
    fetchProducts(1, true);
  };

  const isProductInWishlist = (product) => {
    return wishlistItems.some(item => {
      const itemId = item.id || item.product_id || item.productId;
      const productId = product.id || product.product_id || product.productId;
      return itemId === productId;
    });
  };

  // Use products directly from server pagination (no client-side filtering)
  const displayProducts = products;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              onClick={() => fetchProducts(1, true)}
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
        {/* Success Message */}
        {showSuccessMessage && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 text-blue-800 px-6 py-3 rounded-lg shadow-lg border border-blue-200 transition-all duration-500 ease-in-out ${messageAnimation}`}>
            {showSuccessMessage}
          </div>
        )}

      {/* Search and Filter Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchLoading ? (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                // Only use hover on larger screens
                if (window.innerWidth >= 768) {
                  if (categoryDropdownTimeout.current) clearTimeout(categoryDropdownTimeout.current);
                  setIsCategoryDropdownOpen(true);
                }
              }}
              onMouseLeave={() => {
                // Only use hover on larger screens
                if (window.innerWidth >= 768) {
                  categoryDropdownTimeout.current = setTimeout(() => setIsCategoryDropdownOpen(false), 200);
                }
              }}
              ref={categoryDropdownRef}
            >
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
                style={{ zIndex: 30 }}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                <span>{selectedCategoryName || 'All Categories'}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div
                className={`absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 transition-all duration-300 ease-in-out ${isCategoryDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'} md:w-56 w-full`}
                style={{ minWidth: '12rem', marginTop: '6px' }}
                onMouseEnter={() => {
                  // Only use hover on larger screens
                  if (window.innerWidth >= 768) {
                    if (categoryDropdownTimeout.current) clearTimeout(categoryDropdownTimeout.current);
                    setIsCategoryDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  // Only use hover on larger screens
                  if (window.innerWidth >= 768) {
                    categoryDropdownTimeout.current = setTimeout(() => setIsCategoryDropdownOpen(false), 200);
                  }
                }}
              >
                <button
                  onClick={() => {
                    handleCategoryChange('all', 'All Categories');
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedCategory === 'all' ? 'font-bold bg-blue-50 text-blue-600' : ''}`}
                  style={{ fontSize: '1rem' }}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategoryChange(category.id, category.name);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedCategory == category.id ? 'font-bold bg-blue-50 text-blue-600' : ''}`}
                    style={{ fontSize: '1rem' }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Title and Product Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedCategoryName || 'All Categories'}
        </h2>
        <p className="text-gray-600 text-base mt-1">
          {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
            {searchTerm && (
              <p className="text-gray-400 mt-2">Try adjusting your search terms.</p>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {displayProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={isProductInWishlist(product)}
                      wishlistLoading={wishlistLoading[product.id]}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            <div className="mt-16 flex flex-col items-center">
              {/* Page Info */}
              <p className="text-gray-600 mb-4">
                <span className="font-semibold text-blue-600">{totalProducts}</span> total products (Page {currentPage} of {totalPages})
              </p>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-6">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-6">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          disabled={pageNumber === currentPage || loading}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            pageNumber === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          } disabled:cursor-not-allowed`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Loading indicator */}
              {loading && (
                <div className="mt-4 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-gray-600">Loading...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </PageTransition>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Shop; 