import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const Wishlist = sequelize.define('Wishlist', {
  id: {
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
  timestamps: false,
});

export default Wishlist; 