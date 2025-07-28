import express, { json } from "express";
import dotenv from 'dotenv';
import cors from 'cors'
// import User from './models/user.model.js';
import sequelize from './sequelize.js';
import authRoutes from './routes/Auth.route.js';
import userRoutes from './routes/User.route.js';
import productRoutes from './routes/Product.route.js';
import categoryRoutes from './routes/Category.route.js';
import cartRoutes from './routes/Cart.route.js';
import wishlistRoutes from './routes/Wishlist.route.js';
import orderRoutes from './routes/Order.route.js';
import './models/associations.js';


dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

// Enable json serialization
app.use(express.json());

// Serve static files from public directory
app.use('/public', express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/order', orderRoutes);

// // 404 handler for incorrect routes
// app.all('*', (req, res) => {
//   res.status(404).json({
//     message: 'Route not found',
//     error: `Cannot ${req.method} ${req.originalUrl}`,
//     availableRoutes: [
//       'POST /api/auth/register',
//       'POST /api/auth/login',
//       'GET /api/user/profile',
//       'PUT /api/user/profile',
//       'GET /api/products',
//       'GET /api/products/:id',
//       'GET /api/categories',
//       'GET /api/categories/:id/products',
//       'POST /api/cart',
//       'GET /api/cart',
//       'PUT /api/cart/update/:productId',
//       'DELETE /api/cart/remove/:productId',
//       'POST /api/wishlist',
//       'GET /api/wishlist',
//       'DELETE /api/wishlist/remove/:productId',
//       'POST /api/order',
//       'GET /api/order',
//       'GET /api/order/:orderId'
//     ]
//   });
// });

// Sync Sequelize models
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Failed to sync database:', err);
});