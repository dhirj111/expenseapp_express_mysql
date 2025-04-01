const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isPremiumUser: {
    type: Boolean,
    default: false
  },
  expenses: {
    expense: [
      {
        expenseId: { type: Schema.Types.ObjectId, ref: 'expense', required: true }
      }
    ]
  }
});

module.exports = mongoose.model('Expenseuser', userSchema);

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const Expenseuser = sequelize.define('expenseuser', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   name: {
//     type: Sequelize.STRING(45),  // Matches table definition
//     allowNull: true  // Since `expense` is defined as NULL in table
//   },
//   email: {
//     type: Sequelize.STRING(45),  // Matches table VARCHAR(45)
//     allowNull: true  // Matches NULL constraint in table
//   },
//   password: {
//     type: Sequelize.STRING,  // Matches table VARCHAR(45)
//     allowNull: true  // Matches NULL constraint in table
//   },
//   totalsum: {
//     type: Sequelize.INTEGER,  // Matches table VARCHAR(45)
//     allowNull: true  //
//   },
//   isPremiumUser: Sequelize.BOOLEAN
// }
// );

// module.exports = Expenseuser;