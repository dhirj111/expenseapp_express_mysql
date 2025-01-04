const { error } = require('console');
const Product = require('../models/expenses');
const Order = require('../models/order')
//expense is product here
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const brevo = require('@getbrevo/brevo');
const Sib = require('sib-api-v3-sdk')
let Client = Sib.ApiClient.instance;

let apiKey = Client.authentications['api-key'];
apiKey.apiKey = "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"


let SECRET_KEY = "abc123"
//its for test purpose and should be not exposed publically
const jwt = require('jsonwebtoken')
function generateAccessToken(id, isPremiumUser) {

  return jwt.sign({ userId: id, ispremium: isPremiumUser }, SECRET_KEY);
}

//product here is expense ,
const Expenseuser = require('../models/expenseuser');
const router = require('../routes/expense');
const { route } = require('../routes/expense');
const path = require('path');
const bcrypt = require('bcrypt');
const { json, where } = require('sequelize');
const { JsonWebTokenError } = require('jsonwebtoken');
const Razorpay = require('razorpay');
//to serve main html file
exports.baseroot = (req, res, next) => {
  console.log("Serving htmlmain.html");
  res.sendFile(path.join(__dirname, '..', 'htmlmain.html'));
}

exports.baserootsignup = (req, res, next) => {
  console.log("Serving singup.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
}

exports.baserootlogin = (req, res, next) => {
  console.log("Serving login.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
}

exports.baseforget = (req, res, next) => {
  console.log("serving password to reset password")
  res.sendFile(path.join(__dirname, '..', 'public', 'forget.html'));
}

// Route for adding a user
exports.adduser = (req, res, next) => {
  console.log("Request received at /adduser");
  console.log(req.body);
  res.send("Add user endpoint hit");
}

// Route for handling appointment data of newly added expense
exports.newexpense = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    console.log("Received data at /appointmentData");
    console.log("user attached with req of middleware", req.user.id, " ", req.body.user);

    const { expense, description, type } = req.body;

    // Get current user with totalsum
    const user = await Expenseuser.findByPk(req.user.id, { transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Create new expense within transaction
    const newExpense = await Product.create({
      expense: Number(expense),
      description: description.trim(),
      type: type.toLowerCase(),
      expenseuserId: req.user.id,
      name: req.user.name
    }, { transaction: t });

    // Calculate new total based on expense type
    const newTotal = type.toLowerCase() === 'income' ? (user.totalsum || 0) + Number(expense) : (user.totalsum || 0) - Number(expense);

    // Update user's totalsum within transaction
    await user.update({ totalsum: newTotal }, { transaction: t });

    // Commit transaction
    await t.commit();

    // Send success response
    return res.status(201).json({
      message: "Expense recorded successfully",
      expense: newExpense,
      currentBalance: newTotal
    });

  } catch (err) {
    // Rollback transaction on error
    await t.rollback();

    console.error('Error creating expense:', err);

    // Send appropriate error response
    return res.status(500).json({
      error: "Failed to record expense",
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
//route to fetch all data
exports.fetchexpense = (req, res, next) => {
  Product.findAll({ where: { expenseuserId: req.user.id } })
    .then(expensedata => {
      res.json({ expensedata: expensedata, ispremium: req.user.isPremiumUser });
    })
    .catch(err => {
      console.log(err)
      console.error('Error fetching products:', err);
      res.status(500).json({ error: "Failed to fetch products" });
    });
}

//route to delete expense
exports.deleteexpense = (req, res, next) => {
  let currentid;
  let token = req.headers['token']
  jwt.verify(token, SECRET_KEY, function (err, decoded) {
    currentid = decoded.userId // bar
  });
  //way to fetch id from route is req.params.id
  const productId = req.params.id;
  const userfromrequest = req.params.expenseuserId;

  Product.destroy({
    where: { id: productId }
  })
    .then(result => {
      if (result) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    })
    .catch(err => {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: "Failed to delete product" });
    });
}
//route to update expense
exports.updateexpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  //way to fetch id from route is req.params.id
  //way to get object passed along with data is req.body
  const productId = req.params.id;
  const { expense, description, type } = req.body;

  await Product.update(
    { expense, description, type },
    { where: { id: productId } },
    { transaction: t }
  )
    .then(([updatedCount]) => {
      if (updatedCount > 0) {
        return Product.findByPk(productId, { transaction: t });
      } else {
        throw new Error('Product not found');
      }
    }
    )

    .then(updatedProduct => {

      res.json({ message: "Product updated successfully", product: updatedProduct });
    })
    .catch(err => {

      console.error('Error updating product:', err);
      res.status(500).json({ error: "Failed to update product" });
    });

}
exports.signup = async (req, res, next) => {
  const t = await sequelize.transaction();
  const saltRounds = 10;
  //salt is an string/whatver added to  password which increases randomness of password
  //even for same password each time to increase safety
  try {
    const { name, email, password } = req.body;

    // Check if user with email already exists
    const existingUser = await Expenseuser.findOne({
      where: { email: email }
    }, { transaction: t });

    if (existingUser) {
      console.log('Account already exists for email:', email);
      await t.rollback();
      return res.status(409).json({
        error: "Account already exists",
        message: "An account with this email already exists"
      });
    }

    // If email doesn't exist, create new user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await Expenseuser.create(
      {
        name,
        email,
        password: hashedPassword,
        totalsum: 0
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({
      message: "User created successfully"
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in signup:', err);
    res.status(500).json({
      error: "Failed to process signup",
      details: err.message
    });
  }
};


exports.login = async (req, res, next) => {
  console.log(req.body)
  try {
    const { email, password } = req.body;

    const existingUser = await Expenseuser.findOne({
      where: { email: email }
    });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password).then(function (result) {

        if (result) {
          return res.status(201).json({
            usertoken: generateAccessToken(existingUser.id, existingUser.isPremiumUser),
            code: "userverified",
            message: "user logged in succesfully",
            urltoredirect: 'http://localhost:5000/'
          });
        }
        else {
          return res.status(401).json({
            message: "password is incorrect"
          })
        };
      });

    }
    else {
      res.status(404).json({
        message: " user does not exist",
      });
    }
  }
  catch (err) {
    //this block is for eror in exceution of try blocks as a 
    // whole, catch does not care about individual error of logic
    console.log("inside catch  block of controller err is ==", err);
    res.status(500).json({
      error: " user does not exist",
      message: err.message
    });
  }
}

exports.buypremium = async (req, res) => {
  const t = await sequelize.transaction();
  console.log(req.user.id);
  const rzp = new Razorpay({
    key_id: "rzp_test_BpGJqLLuHLOWWQ",
    key_secret: "xSSP7tmZq1Hle782rmCDBRPP",
  });

  try {
    rzp.orders.create({ amount: 3355050, currency: 'INR' }, async (err, order) => {
      if (err) {
        console.error("Error creating order:", err);
        return res.status(500).json({ error: "Failed to create order" });
      }

      console.log("Order created successfully:", order);

      try {
        await req.user.createOrder({ orderId: order.id, status: 'pending' }, { transaction: t });
        console.log("Order stored in database successfully");
        await t.commit();

        return res.status(201).json({
          order,
          key_id: rzp.key_id,
        });
      } catch (dbError) {

        console.error("Error saving order to database:", dbError);
        return res.status(500).json({ error: "Failed to save order in database" });
      }
    });
  } catch (error) {
    await t.rollback()
    console.error("Error in buypremium:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatetransectionstatus = async (req, res) => {
  const t = await sequelize.transaction();
  console.log("payment status and body is", req.body)
  try {
    const { payment_id, order_id } = req.body;

    // Create an array of independent promises to be executed
    const updatePromises = [
      // Update order with payment details
      Order.update(
        {
          paymentId: payment_id,
          status: 'SUCCESSFUL'
        },
        {
          where: { orderId: order_id }
        },
        { transaction: t }
      ),

      // Update user premium status
      Expenseuser.update(
        { isPremiumUser: true },
        {
          where: { id: req.user.id }
        },
        { transaction: t }

      )
    ];

    // Execute all promises concurrently
    await Promise.all(updatePromises);
    await t.commit();

    // Send success response
    return res.status(202).json({
      usertoken: generateAccessToken(req.user.id, true),
      success: true,
      message: "Transaction Successful"
    });

  } catch (err) {
    await t.rollback()
    console.error('Error in updateTransactionStatus:', err);
    return res.status(500).json({
      success: false,
      message: "Error processing transaction",
      error: err.message
    });
  }
};

exports.rankwiseexpense = async (req, res) => {
  Expenseuser.findAll({
    order: [['totalsum', 'DESC']],
    attributes: ['name', 'totalsum'],
    limit: 5
  }).then(expensedata => {
    res.json({ expensedata: expensedata });
  })
    .catch(err => {
      console.log(err)
      console.error('Error fetching products:', err);
      res.status(500).json({ error: "Failed to fetch products" });
    });
}

exports.resetpassword = async (req, res) => {
  try {
    console.log("Starting password reset process");

    let apiInstance = new Sib.TransactionalEmailsApi();
    let sendSmtpEmail = new Sib.SendSmtpEmail(); // Define this first

    sendSmtpEmail.subject = "My {{params.subject}}";
    sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1></body></html>";
    sendSmtpEmail.sender = { "name": "John", "email": "example@example.com" };
    sendSmtpEmail.to = [
      { "email": req.body.email, "name": "sample-name" }
    ];
    sendSmtpEmail.replyTo = { "email": "example@brevo.com", "name": "sample-name" };
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', JSON.stringify(result));
    res.status(200).json({ message: 'Password reset email sent' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send password reset email',
      details: error.message
    });
  }
};