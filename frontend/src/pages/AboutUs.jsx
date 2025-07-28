import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';

function AboutUs() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <PageTransition>
        <div className="max-w-4xl mx-auto px-1 sm:px-2 lg:px-4 py-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">About Us</h1>
          <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
            <span className="font-semibold text-blue-600">CrochetCraft</span> is a modern e-commerce platform dedicated to handmade crochet creations and supplies. Our mission is to bring warmth, creativity, and joy to every home through unique, high-quality crochet products crafted with love and care.
          </p>

          <div className="p-8 mb-10">
            <h2 className="text-3xl font-bold text-gray-700 mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
              We believe in the beauty of handmade art. Our mission is to empower artisans, inspire creativity, and connect people with the magic of crochet. Whether you're a maker, a collector, or a gift-giver, we want to make your experience delightful and meaningful.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mb-12 mt-20 text-center">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">Quality</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Every product is carefully crafted and quality-checked.</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">Community</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">We support local artisans and foster a creative community.</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">Sustainability</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">We use eco-friendly materials and packaging whenever possible.</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">Customer Care</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Your satisfaction and happiness are our top priorities.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 max-w-[800px] mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col items-center">
                <img src="/public/nika.jpg" alt="Leader img" className='mb-8 w-40 h-40 rounded-full object-cover' />
                <h3 className="text-lg font-bold text-gray-900">Nika Chhun</h3>
                <p className="text-gray-600">Founder & Lead Developer</p>
              </div>
              <div className="flex flex-col items-center">
                <img src="/public/theara.jpg" alt="Co-leadeer img" className='mb-8 w-40 h-40 rounded-full object-cover'/>
                <h3 className="text-lg font-bold text-gray-900">Kon Sotheara</h3>
                <p className="text-gray-600">Co-founder & Lead Development</p>
              </div>
            </div>
          </div>

        </div>
        <Footer />
      </PageTransition>
    </div>
  );
}

export default AboutUs; 