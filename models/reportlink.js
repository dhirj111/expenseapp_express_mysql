const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ReportLink = sequelize.define('reportlink', {
  link: {
    type: Sequelize.STRING,
    autoIncrement: false,
    allowNull: false,
    primaryKey: true
  },
  expenseuserId: {  // or whatever your foreign key name is
    type: Sequelize.INTEGER,
    allowNull: false
  }

}
);
//
module.exports = ReportLink;