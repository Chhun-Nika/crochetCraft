import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBaby, 
  FaScarf, 
  FaShoppingBag, 
  FaGem, 
  FaHome, 
  FaHeart,
  FaStar,
  FaLeaf,
  FaPalette,
  FaGift
} from 'react-icons/fa';

const CategoryCard = ({ category }) => {
  // Safety check for category prop
  if (!category || !category.name) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FaGift className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Unknown Category
        </h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          Category information not available.
        </p>
      </div>
    );
  }

  // Function to get appropriate icon based on category name
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FaGift className="w-8 h-8 text-blue-600" />;
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('toy') || name.includes('baby') || name.includes('amigurumi')) {
      return <FaBaby className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('scarf') || name.includes('shawl') || name.includes('wrap')) {
      return <FaScarf className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('bag') || name.includes('purse') || name.includes('tote')) {
      return <FaShoppingBag className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('accessory') || name.includes('jewelry') || name.includes('bead')) {
      return <FaGem className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('home') || name.includes('decor') || name.includes('cushion')) {
      return <FaHome className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('heart') || name.includes('love') || name.includes('romantic')) {
      return <FaHeart className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('star') || name.includes('holiday') || name.includes('christmas')) {
      return <FaStar className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('nature') || name.includes('flower') || name.includes('plant')) {
      return <FaLeaf className="w-8 h-8 text-blue-600" />;
    } else if (name.includes('art') || name.includes('creative') || name.includes('design')) {
      return <FaPalette className="w-8 h-8 text-blue-600" />;
    } else {
      return <FaGift className="w-8 h-8 text-blue-600" />;
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

  return (
    <Link 
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
  );
};

export default CategoryCard; 