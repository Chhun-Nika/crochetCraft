import { Op } from 'sequelize';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

// Helper function to format image URLs
const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, make it absolute to the backend
  if (imageUrl.startsWith('/')) {
    return `http://localhost:3000${imageUrl}`;
  }
  
  // If it's a filename without path, assume it's in public/images
  return `http://localhost:3000/public/images/${imageUrl}`;
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    const whereClause = {};
    
    // Category filter
    if (req.query.category) {
      whereClause.categoryId = req.query.category;
    }

    // Search filter (search in name and description)
    if (req.query.search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Price range filters
    if (req.query.minPrice) {
      whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(req.query.maxPrice) };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'image_url'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Format image URLs for each product
    const formattedProducts = products.map(product => ({
      ...product.toJSON(),
      image_url: formatImageUrl(product.image_url)
    }));

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      products: formattedProducts,
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

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'stock', 'image_url', 'createdAt']
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format image URL
    const formattedProduct = {
      ...product.toJSON(),
      image_url: formatImageUrl(product.image_url)
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 