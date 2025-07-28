import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const Cart = sequelize.define('Cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
}, {
  timestamps: true,
  createdAt: true,
  updatedAt: false,
});

export default Cart; 