const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('expensedata', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  expense: {
    type: Sequelize.INTEGER,  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  description: {
    type: Sequelize.STRING(45),  // Matches table VARCHAR(45)
    allowNull: true  // Matches NULL constraint in table
  },
  type: {
    type: Sequelize.STRING(45),  // Matches table VARCHAR(45)
    allowNull: true  // Matches NULL constraint in table
  },
  name: {
    type: Sequelize.STRING(45),  // Matches table VARCHAR(45)
    allowNull: true  // Matches NULL constraint in table
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,  // Ensures automatic timestamp
    allowNull: false
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,  // Initial value
    onUpdate: Sequelize.NOW,      // Auto-update on modification
    allowNull: false
  }
}, {
  timestamps: false,  // Since you are manually defining timestamps
  tableName: 'expensedata'  // Explicitly map the table name
});

module.exports = Product;