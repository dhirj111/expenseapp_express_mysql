const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordRequestSchema = new Schema({
  uuid: {
    type: String,
    required: true
  }, isactive: {
    type: Boolean, default: false
  },
  expenseuserID: {
    type: Schema.Types.ObjectId,
    ref: 'Expenseuser',
    required: true
  }
});

module.exports = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);
