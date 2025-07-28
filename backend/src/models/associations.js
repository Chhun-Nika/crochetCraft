import Product from './product.model.js';
import Category from './category.model.js';
import User from './user.model.js';
import Cart from './cart.model.js';
import CartItem from './cartItem.model.js';
import Wishlist from './wishlist.model.js';
import WishlistItem from './wishlistItem.model.js';
import Order from './order.model.js';
import OrderItem from './orderItem.model.js';
import ShippingInfo from './shippingInfo.model.js';
import PaymentInfo from './paymentInfo.model.js';

// Define associations
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});

Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// User - Cart associations
User.hasMany(Cart, {
  foreignKey: 'user_id',
  as: 'carts'
});

Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Cart - Product associations (Many-to-Many through CartItem)
Cart.belongsToMany(Product, {
  through: CartItem,
  foreignKey: 'cart_id',
  otherKey: 'product_id',
  as: 'products'
});

Product.belongsToMany(Cart, {
  through: CartItem,
  foreignKey: 'product_id',
  otherKey: 'cart_id',
  as: 'carts'
});

// CartItem associations
CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id'
});

CartItem.belongsTo(Product, {
  foreignKey: 'product_id'
});

// User - Wishlist associations
User.hasMany(Wishlist, {
  foreignKey: 'user_id',
  as: 'wishlists'
});

Wishlist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Wishlist - Product associations (Many-to-Many through WishlistItem)
Wishlist.belongsToMany(Product, {
  through: WishlistItem,
  foreignKey: 'wishlist_id',
  otherKey: 'product_id',
  as: 'products'
});

Product.belongsToMany(Wishlist, {
  through: WishlistItem,
  foreignKey: 'product_id',
  otherKey: 'wishlist_id',
  as: 'wishlists'
});

// WishlistItem associations
WishlistItem.belongsTo(Wishlist, {
  foreignKey: 'wishlist_id'
});

WishlistItem.belongsTo(Product, {
  foreignKey: 'product_id'
});

// User - Order associations
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});

Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Order - Product associations (Many-to-Many through OrderItem)
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: 'order_id',
  otherKey: 'product_id',
  as: 'products'
});

Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: 'product_id',
  otherKey: 'order_id',
  as: 'orders'
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id'
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id'
});

// Order - ShippingInfo associations (One-to-One)
Order.hasOne(ShippingInfo, {
  foreignKey: 'order_id',
  as: 'shippingInfo'
});

ShippingInfo.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// Order - PaymentInfo associations (One-to-One)
Order.hasOne(PaymentInfo, {
  foreignKey: 'order_id',
  as: 'paymentInfo'
});

PaymentInfo.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

export { Product, Category, User, Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, ShippingInfo, PaymentInfo }; 