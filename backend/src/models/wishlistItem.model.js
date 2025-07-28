import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const WishlistItem = sequelize.define('WishlistItem', {
  wishlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Wishlists',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
}, {
  timestamps: false,
});

export default WishlistItem; 