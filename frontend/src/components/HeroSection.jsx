import React from 'react';
import { Link } from 'react-router-dom'; // Added Link import

function HeroSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-12 py-16 bg-gradient-to-r from-blue-100 to-blue-50">
      <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Welcome to <span className="text-blue-600">CrochetCraft</span></h2>
        <p className="text-lg text-gray-700 mb-6">Discover handmade crochet products, perfect for gifts or personal use. Shop by category, add to your wishlist, and enjoy a seamless shopping experience!</p>
        <Link to="/shop">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Shop Now</button>
        </Link>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img src="/home2.png" alt="CrochetCraft Hero" className="w-100 h-100 object-contain" />
      </div>
    </section>
  );
}

export default HeroSection; 