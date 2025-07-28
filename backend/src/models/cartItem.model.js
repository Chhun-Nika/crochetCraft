import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const CartItem = sequelize.define('CartItem', {
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Carts',
      key: 'cart_id'
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
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
}, {
  timestamps: false,
});

export default CartItem; 