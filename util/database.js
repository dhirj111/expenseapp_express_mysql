const Sequelize = require('sequelize');
const sequelize = new Sequelize('node-complete', 'root', '1@Password', {
  dialect: 'mysql',
  host: 'localhost'
});
module.exports = sequelize;