import Order from '../models/order.model.js';
import OrderItem from '../models/orderItem.model.js';
import Cart from '../models/cart.model.js';
import CartItem from '../models/cartItem.model.js';
import Product from '../models/product.model.js';
import ShippingInfo from '../models/shippingInfo.model.js';
import PaymentInfo from '../models/paymentInfo.model.js';

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingInfo, paymentInfo, order_note } = req.body;

    // Validate required data
    if (!shippingInfo || !paymentInfo) {
      return res.status(400).json({ 
        message: 'Shipping and payment information are required' 
      });
    }

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
          attributes: ['id', 'name', 'price', 'stock']
        }
      ]
    });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ 
        message: 'Cart is empty. Cannot create order.' 
      });
    }

    // Calculate total price and validate stock
    let totalPrice = 0;
    const orderItems = [];

    for (const product of cart.products) {
      const quantity = product.CartItem.quantity;
      const itemTotal = parseFloat(product.price) * quantity;
      totalPrice += itemTotal;

      // Check stock availability
      if (product.stock < quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}` 
        });
      }

      orderItems.push({
        product_id: product.id,
        quantity: quantity,
        price: product.price
      });
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      total_price: totalPrice.toFixed(2),
      status: 'pending',
      orderedAt: new Date(),
      order_note: order_note || null
    });

    // Create shipping information
    await ShippingInfo.create({
      order_id: order.id,
      first_name: shippingInfo.first_name,
      last_name: shippingInfo.last_name,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip_code: shippingInfo.zip_code,
      country: shippingInfo.country || 'United States'
    });

    // Create payment information
    await PaymentInfo.create({
      order_id: order.id,
      card_last_four: paymentInfo.card_last_four,
      card_type: paymentInfo.card_type,
      payment_status: 'pending',
      transaction_id: paymentInfo.transaction_id || null
    });

    // Create order items and update stock
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      });

      // Deduct stock
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.product_id }
      });
    }

    // Clear cart
    await CartItem.destroy({
      where: { cart_id: cart.cart_id }
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order_id: order.id,
      total_price: order.total_price,
      status: order.status,
      items_count: orderItems.length,
      order_note: order.order_note,
      shipping_info: {
        first_name: shippingInfo.first_name,
        last_name: shippingInfo.last_name,
        email: shippingInfo.email,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip_code: shippingInfo.zip_code,
        country: shippingInfo.country
      },
      payment_info: {
        card_last_four: paymentInfo.card_last_four,
        card_type: paymentInfo.card_type,
        payment_status: 'pending'
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: userId },
      attributes: ['id', 'total_price', 'status', 'orderedAt', 'order_note'],
      order: [['orderedAt', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);

    const order = await Order.findOne({
      where: { 
        id: orderId,
        user_id: userId 
      },
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price']
          },
          attributes: ['id', 'name', 'description', 'image_url']
        },
        {
          model: ShippingInfo,
          as: 'shippingInfo',
          attributes: ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'country']
        },
        {
          model: PaymentInfo,
          as: 'paymentInfo',
          attributes: ['card_last_four', 'card_type', 'payment_status', 'transaction_id']
        }
      ],
      attributes: ['id', 'total_price', 'status', 'orderedAt', 'order_note']
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = order.products.map(product => ({
      product_id: product.id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      quantity: product.OrderItem.quantity,
      price: product.OrderItem.price,
      item_total: (parseFloat(product.OrderItem.price) * product.OrderItem.quantity).toFixed(2)
    }));

    return res.status(200).json({
      order_id: order.id,
      total_price: order.total_price,
      status: order.status,
      orderedAt: order.orderedAt,
      order_note: order.order_note,
      items: items,
      items_count: items.length,
      shipping_info: order.shippingInfo,
      payment_info: order.paymentInfo
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 