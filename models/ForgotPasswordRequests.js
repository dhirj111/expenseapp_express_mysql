const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ForgotPasswordRequests = sequelize.define('forgetpasswordrequests', {
  uuid: {
    type: Sequelize.STRING,
    autoIncrement: false,
    allowNull: false,
    primaryKey: true
  },
  isactive: Sequelize.BOOLEAN

}
);

module.exports = ForgotPasswordRequests;