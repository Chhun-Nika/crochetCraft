import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const PaymentInfo = sequelize.define('PaymentInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  card_last_four: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  card_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: true,
  updatedAt: false,
});

export default PaymentInfo; 