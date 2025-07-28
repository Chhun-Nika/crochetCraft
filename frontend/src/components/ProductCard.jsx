import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { getImageUrl } from '../api.js';
import { useCurrency } from '../context/CurrencyContext';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onRemoveFromWishlist,
  onRemoveFromCart,
  isInWishlist = false,
  wishlistLoading = false,
  cartLoading = false,
  showQuantity = false,
  quantity = 1,
  onQuantityChange,
  showRemoveButton = false,
  className = "",
  variant = "default" // "default", "cart", "wishlist"
}) => {
  const { formatCurrency } = useCurrency();
  // Handle different product structures
  const productData = product.product || product;
  const productId = product.id || product.product_id || product.productId || productData?.id;
  const productName = product.name || productData?.name;
  const productDescription = product.description || productData?.description;
  const productPrice = product.price || productData?.price;
  const productImage = product.image_url || product.image || productData?.image_url || productData?.image;

  // Cart variant - smaller, horizontal layout
  if (variant === "cart") {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 ease-in-out ${className}`}>
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={getImageUrl(productImage)}
              alt={productName}
              className="w-20 h-20 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center shadow-md" style={{ display: 'none' }}>
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {productName}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {productDescription}
            </p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(parseFloat(productPrice))}
            </p>
          </div>

          {/* Quantity Controls */}
          {showQuantity && onQuantityChange && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onQuantityChange(productId, quantity - 1)}
                disabled={cartLoading || quantity <= 1}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {cartLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                ) : (
                  <FiMinus size={16} className="transition-all duration-300 ease-in-out transform group-hover:scale-110" />
                )}
              </button>
              <span className="w-12 text-center text-gray-900 font-medium">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(productId, quantity + 1)}
                disabled={cartLoading}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {cartLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                ) : (
                  <FiPlus size={16} className="transition-all duration-300 ease-in-out transform group-hover:scale-110" />
                )}
              </button>
            </div>
          )}

          {/* Remove Button */}
          {showRemoveButton && onRemoveFromCart && (
            <button
              onClick={() => onRemoveFromCart(productId)}
              disabled={cartLoading}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove from cart"
            >
              {cartLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
              ) : (
                <FiTrash2 size={18} />
              )}
            </button>
          )}
        </div>

        {/* Item Total for Cart */}
        {variant === "cart" && (
          <div className="mt-4 text-right">
            <span className="text-lg font-semibold text-gray-900">
              Total: ${(parseFloat(productPrice) * quantity).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default variant - vertical card layout for Shop and Wishlist
  return (
    <div className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:scale-105 ${className}`}>
      {/* Product Image - Clickable */}
      <Link to={`/product/${productId}`} className="block">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
          <img
            src={getImageUrl(productImage)}
            alt={productName}
            className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-110" style={{ display: 'none' }}>
            <span className="text-gray-400">No Image</span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${productId}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 transition-colors duration-300 ease-in-out group-hover:text-blue-600 cursor-pointer">
            {productName}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 transition-colors duration-300 ease-in-out group-hover:text-gray-700">
          {productDescription}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-blue-600 transition-all duration-300 ease-in-out group-hover:scale-110">
            {formatCurrency(productPrice ? parseFloat(productPrice) : 0)}
          </span>
          
          <div className="flex items-center space-x-2">
            {/* Wishlist Button */}
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product)}
                disabled={wishlistLoading}
                className={`p-2 rounded-full transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                  isInWishlist
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 transform hover:scale-110'
                }`}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {wishlistLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                ) : (
                  <FiHeart 
                    size={18} 
                    className={`transition-all duration-500 ease-in-out ${
                      isInWishlist 
                        ? 'fill-current' 
                        : 'hover:scale-110'
                    }`}
                  />
                )}
              </button>
            )}

            {/* Remove from Wishlist Button */}
            {showRemoveButton && onRemoveFromWishlist && (
              <button
                onClick={() => onRemoveFromWishlist(productId)}
                disabled={wishlistLoading}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove from Wishlist"
              >
                {wishlistLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                ) : (
                  <FiTrash2 size={18} className="transition-all duration-500 ease-in-out hover:scale-110" />
                )}
              </button>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProductCard; 