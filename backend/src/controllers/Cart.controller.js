import Cart from '../models/cart.model.js';
import CartItem from '../models/cartItem.model.js';
import Product from '../models/product.model.js';

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    // Validate input
    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({ 
        message: 'Product ID and quantity (minimum 1) are required' 
      });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has enough stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}` 
      });
    }

    // Find or create cart for user
    let [cart, created] = await Cart.findOrCreate({
      where: { user_id: userId }
    });

    // Check if product already exists in cart
    const existingCartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: product_id
      }
    });

    if (existingCartItem) {
      // Update quantity if product already in cart
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      // Add new product to cart
      await CartItem.create({
        cart_id: cart.cart_id,
        product_id: product_id,
        quantity: quantity
      });
    }

    return res.status(201).json({
      message: 'Product added to cart successfully',
      cart_id: cart.cart_id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity']
          },
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'stock']
        }
      ]
    });

    if (!cart) {
      return res.status(200).json({
        cart_id: null,
        items: [],
        total_items: 0,
        total_price: 0
      });
    }

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    
    const items = cart.products.map(product => {
      const quantity = product.CartItem.quantity;
      const itemTotal = parseFloat(product.price) * quantity;
      
      totalItems += quantity;
      totalPrice += itemTotal;

      return {
        product_id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        quantity: quantity,
        item_total: itemTotal.toFixed(2)
      };
    });

    return res.status(200).json({
      cart_id: cart.cart_id,
      items: items,
      total_items: totalItems,
      total_price: totalPrice.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        message: 'Quantity must be at least 1' 
      });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has enough stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}` 
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the cart item
    const cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      message: 'Cart item updated successfully',
      product_id: productId,
      quantity: quantity
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find and delete the cart item
    const deletedCartItem = await CartItem.destroy({
      where: {
        cart_id: cart.cart_id,
        product_id: productId
      }
    });

    if (deletedCartItem === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    return res.status(200).json({
      message: 'Product removed from cart successfully',
      product_id: productId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Delete all cart items for this user
    const deletedItems = await CartItem.destroy({
      where: { cart_id: cart.cart_id }
    });

    return res.status(200).json({
      message: 'Cart cleared successfully',
      items_removed: deletedItems,
      cart_id: cart.cart_id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 