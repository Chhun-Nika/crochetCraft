import Wishlist from '../models/wishlist.model.js';
import WishlistItem from '../models/wishlistItem.model.js';
import Product from '../models/product.model.js';

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    // Validate input
    if (!product_id) {
      return res.status(400).json({ 
        message: 'Product ID is required' 
      });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist for user
    let [wishlist, created] = await Wishlist.findOrCreate({
      where: { user_id: userId }
    });

    // Check if product already exists in wishlist
    const existingWishlistItem = await WishlistItem.findOne({
      where: {
        wishlist_id: wishlist.id,
        product_id: product_id
      }
    });

    if (existingWishlistItem) {
      return res.status(409).json({ 
        message: 'Product already exists in wishlist' 
      });
    }

    // Add product to wishlist
    await WishlistItem.create({
      wishlist_id: wishlist.id,
      product_id: product_id
    });

    return res.status(201).json({
      message: 'Product added to wishlist successfully',
      wishlist_id: wishlist.id,
      product_id: product_id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'stock']
        }
      ]
    });

    if (!wishlist) {
      return res.status(200).json({
        wishlist_id: null,
        items: [],
        total_items: 0
      });
    }

    const items = wishlist.products.map(product => ({
      product_id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock
    }));

    return res.status(200).json({
      wishlist_id: wishlist.id,
      items: items,
      total_items: items.length
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      where: { user_id: userId }
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Find and delete the wishlist item
    const deletedWishlistItem = await WishlistItem.destroy({
      where: {
        wishlist_id: wishlist.id,
        product_id: productId
      }
    });

    if (deletedWishlistItem === 0) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    return res.status(200).json({
      message: 'Product removed from wishlist successfully',
      product_id: productId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 