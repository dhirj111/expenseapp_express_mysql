const express = require('express');
const path = require('path');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
uuidv4();
const app = express();

// Middleware in the correct order
app.use(cors());
app.use(express.json()); // Built-in middleware for parsing JSON
app.use(express.urlencoded({ extended: true })); // Built-in middleware for parsing URL-encoded data

const sequelize = require('./util/database');
const ReportLink = require('./models/reportlink')
const Expense = require('./models/expenses');
const Expenseuser = require('./models/expenseuser');
const ForgotPasswordRequests = require('./models/ForgotPasswordRequests');

Expense.belongsTo(Expenseuser, { foreignKey: 'expenseuserId' })

Expenseuser.hasMany(Expense, { foreignKey: 'expenseuserId' })

ForgotPasswordRequests.belongsTo(Expenseuser);

//ReportLink 
Expenseuser.hasMany(ReportLink, { foreignKey: 'expenseuserId' })
ReportLink.belongsTo(Expenseuser, { foreignKey: 'expenseuserId' })


Expenseuser.hasMany(ForgotPasswordRequests)

const Order = require('./models/order');

Expenseuser.hasMany(Order);

Order.belongsTo(Expenseuser)
//defiend new relations with user and order after improting it
const adminRoutes = require('./routes/expense');

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(adminRoutes);

// Sync Sequelize models and start the server
sequelize
  .sync()
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on http://localhost:5000');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });