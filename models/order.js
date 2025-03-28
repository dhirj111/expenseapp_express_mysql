// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const Order = sequelize.define('order', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   paymentId: Sequelize.STRING,
//   orderId: Sequelize.STRING,
//   status: Sequelize.STRING
// }
// );
// module.exports = Order;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({

  //
  paymentId: {
    type: String,
    // required: true
  },
  OrderId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }

})

module.exports = mongoose.model('Order', orderSchema);