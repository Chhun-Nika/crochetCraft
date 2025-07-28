import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGift, FiHome, FiHeart, FiStar, FiPackage, FiShoppingBag, FiDollarSign, FiSmile, FiZap, FiFeather, FiBox, FiCircle } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';

function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching categories from backend...');
      
      const response = await API.get('/api/categories');
      console.log('Categories response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn('Categories response is not an array:', response.data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError('');
      console.log('Fetching featured products from backend...');
      
      // Fetch first 4 products to display as featured
      const response = await API.get('/api/products?limit=4&offset=0');
      console.log('Featured products response:', response.data);
      
      if (response.data && response.data.products && Array.isArray(response.data.products)) {
        setFeaturedProducts(response.data.products);
      } else if (response.data && Array.isArray(response.data)) {
        setFeaturedProducts(response.data.slice(0, 4));
      } else {
        console.warn('Products response is not in expected format:', response.data);
        setFeaturedProducts([]);
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setProductsError('Failed to load featured products');
      setFeaturedProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Function to get category description based on category name
  const getCategoryDescription = (categoryName) => {
    if (!categoryName) return "Beautiful handcrafted items perfect for gifts or personal enjoyment.";
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('toy') || name.includes('baby') || name.includes('amigurumi')) {
      return "Handcrafted toys and adorable amigurumi characters perfect for children and collectors.";
    } else if (name.includes('scarf') || name.includes('shawl') || name.includes('wrap')) {
      return "Cozy scarves, elegant shawls, and warm wraps to keep you stylish and comfortable.";
    } else if (name.includes('bag') || name.includes('purse') || name.includes('tote')) {
      return "Unique handcrafted bags and purses that combine functionality with artistic design.";
    } else if (name.includes('accessory') || name.includes('jewelry') || name.includes('bead')) {
      return "Beautiful accessories and jewelry pieces that add the perfect finishing touch to any outfit.";
    } else if (name.includes('home') || name.includes('decor') || name.includes('cushion')) {
      return "Lovely home decorations and cushions that bring warmth and personality to your space.";
    } else if (name.includes('heart') || name.includes('love') || name.includes('romantic')) {
      return "Romantic and heart-themed creations perfect for expressing love and affection.";
    } else if (name.includes('star') || name.includes('holiday') || name.includes('christmas')) {
      return "Festive holiday decorations and seasonal items to celebrate special occasions.";
    } else if (name.includes('nature') || name.includes('flower') || name.includes('plant')) {
      return "Nature-inspired pieces featuring flowers, plants, and organic designs.";
    } else if (name.includes('art') || name.includes('creative') || name.includes('design')) {
      return "Creative and artistic crochet pieces that showcase unique designs and patterns.";
    } else {
      return "Beautiful handcrafted items perfect for gifts or personal enjoyment.";
    }
  };

  // Function to get appropriate icon based on category name
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FiGift className="w-5 h-5 text-blue-600" />;
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('toy') || name.includes('baby') || name.includes('amigurumi')) {
      return <FiSmile className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('scarf') || name.includes('shawl') || name.includes('wrap')) {
      return <FiPackage className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('bag') || name.includes('purse') || name.includes('tote')) {
      return <FiShoppingBag className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('accessory') || name.includes('jewelry') || name.includes('bead')) {
      return <FiDollarSign className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('home') || name.includes('decor') || name.includes('cushion')) {
      return <FiHome className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('heart') || name.includes('love') || name.includes('romantic')) {
      return <FiHeart className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('star') || name.includes('holiday') || name.includes('christmas')) {
      return <FiStar className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('nature') || name.includes('flower') || name.includes('plant')) {
      return <FiFeather className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('art') || name.includes('creative') || name.includes('design')) {
      return <FiBox className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('lightning') || name.includes('energy') || name.includes('power')) {
      return <FiZap className="w-5 h-5 text-blue-600" />;
    } else if (name.includes('feather') || name.includes('bird') || name.includes('wing')) {
      return <FiCircle className="w-5 h-5 text-blue-600" />;
    } else {
      return <FiGift className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      <PageTransition>
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <section className="px-6 py-14">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center">Shop by Category</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading categories...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchCategories}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="max-w-6xl mx-auto">
                {/* First row - 3 items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                  {categories.slice(0, 3).map((category) => (
                    <Link 
                      key={category.id || category._id} 
                      to={`/shop?category=${encodeURIComponent(category.name)}&categoryId=${category.id || category._id}`}
                      className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:scale-105 group"
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 text-center leading-relaxed">
                        {getCategoryDescription(category.name)}
                      </p>
                    </Link>
                  ))}
                </div>
                
                {/* Second row - 2 items (centered) */}
                {categories.length > 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {categories.slice(3, 5).map((category) => (
                      <Link 
                        key={category.id || category._id} 
                        to={`/shop?category=${encodeURIComponent(category.name)}&categoryId=${category.id || category._id}`}
                        className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:scale-105 group"
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                          {getCategoryIcon(category.name)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 text-center leading-relaxed">
                          {getCategoryDescription(category.name)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No categories available at the moment.</p>
                <button 
                  onClick={fetchCategories}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Refresh Categories
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="px-6 py-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800">Featured Products</h3>
              <Link to="/shop">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105">
                  View All Products
                </button>
              </Link>
            </div>
            
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading featured products...</span>
              </div>
            ) : productsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{productsError}</p>
                <button 
                  onClick={fetchFeaturedProducts}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id || product._id} 
                    product={product}
                    showAddToCart={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No featured products available at the moment.</p>
                <Link to="/shop">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Browse All Products
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </PageTransition>
    </div>
  );
}

export default Home; 