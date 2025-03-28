const { error } = require('console');
require('dotenv').config();
console.log("       ee       nn      vv        ", process.env.SECRET_KEY)
const Expense = require('../models/expenses');
const Order = require('../models/order')
const ReportLink = require('../models/reportlink')
const ForgotPasswordRequest = require('../models/ForgotPasswordRequests')
//expense is product here
const Sequelize = require('sequelize');
const validator = require('validator');
const sequelize = require('../util/database');
const { v4: uuidv4, validate } = require('uuid');
const { Op } = require("sequelize");
const Sib = require('sib-api-v3-sdk')
const AWS = require('aws-sdk');
let Client = Sib.ApiClient.instance;
let s3bucket = new AWS.S3({
  //  this is just instance of server
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
})
function uploadToS3(data, filename) {
  const BUCKET_NAME = "testbucket102030po"


  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data
  }

  return new Promise((resolve, reject) => {

    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log(err)
        reject(err)
      }
      else {
        console.log(s3response)
        resolve(s3response.Location);
      }
    })
  })
}



let apiKey = Client.authentications['api-key'];
apiKey.apiKey = process.env.razorpaykey;


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
const { link } = require('fs');
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
  console.log(req.body)

  try {

    const { amount, description, type } = req.body;

    let expense = new Expense({
      amount: amount, description: description, type: type, name: req.user.name, userId: req.user._id
    })
    console.log(expense)
    expense.save().then(result => {
      return res.status(201).json({
        message: "Expense recorded successfully",
        expense: result
      });
    })







    // Calculate new total based on expense type


    // Update user's totalsum within transaction


    // Commit transaction


    // Send success response


  } catch (err) {
    // Rollback transaction on error

    console.error('Error creating expense:', err);

    // Send appropriate error response
    return res.status(500).json({
      error: "Failed to record expense",
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};




exports.fetchexpense = async (req, res, next) => {
  try {
    const pageoffset = parseInt(req.query.pageoffset) || 0;
    const expenseperpage = parseInt(req.query.expenseperpage) || 5;

    // First, count the total documents for the given userId
    const totalItems = await Expense.countDocuments({ userId: req.user.id });
    const totalPages = Math.ceil(totalItems / expenseperpage);
    const currentPage = Math.floor(pageoffset / expenseperpage) + 1;

    // Then, fetch the expenses for the current page
    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ _id: -1 }) // Sort by _id descending; equivalent to sorting by id descending
      .skip(pageoffset)
      .limit(expenseperpage)
      .exec();

    res.json({
      expensedata: expenses,
      ispremium: req.user.isPremiumUser,
      currentPage: currentPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      totalPages: totalPages
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};



//route to fetch all data
// exports.fetchexpense = (req, res, next) => {
//   const pageoffset = parseInt(req.query.pageoffset) || 0; // Get page offset from query params
//   const expenseperpage = parseInt(req.query.expenseperpage) || 5 //5 by default
//   const limit = 5; // Items per page

//   // First, get total count of records for pagination calculations
//   Product.findAndCountAll({
//     where: { expenseuserId: req.user.id }
//   })
//     .then(result => {
//       const totalItems = result.count;
//       const totalPages = Math.ceil(totalItems / expenseperpage);
//       const currentPage = Math.floor(pageoffset / expenseperpage) + 1;

//       // Then fetch the actual page of data
//       return Product.findAll({
//         where: { expenseuserId: req.user.id },
//         offset: pageoffset,
//         limit: expenseperpage,
//         order: [['id', 'DESC']] // Optional: sort by id descending
//       })
//         .then(expensedata => {
//           res.json({
//             expensedata: expensedata,
//             ispremium: req.user.isPremiumUser,
//             currentPage: currentPage,
//             hasNextPage: currentPage < totalPages,
//             hasPreviousPage: currentPage > 1,
//             totalPages: totalPages
//           });
//         });
//     })
//     .catch(err => {
//       console.log(err);
//       console.error('Error fetching products:', err);
//       res.status(500).json({ error: "Failed to fetch products" });
//     });
// }

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



function validateInput(email, password) {
  console.log("inside validtor")
  if (!validator.isEmail(email)) {
    return "Invalid email format";
  }

  if (!validator.isLength(password, { min: 6, max: 12 })) {
    return "Password must be 6 digits";
  }
  return true; // Valid input
}

exports.signup = async (req, res, next) => {
  console.log("signup hitted")
  const saltRounds = 10;
  //salt is an string/whatver added to  password which increases randomness of password
  //even for same password each time to increase safety
  try {
    const { name, email, password } = req.body;
    let validated = validateInput(email, password)
    console.log(validated, "is validated status till now")
    if (validated == "Invalid email format" || validated == "Password must be 6 digits") {
      console.log("not validated ")
      return res.status(409).json({
        error: validated,
        message: validated
      });
    }
    // Check if user with email already exists
    // const existingUser = await Expenseuser.findOne({
    //   where: { email: email }
    // });
    // if (existingUser) {
    //   console.log('Account already exists for email:', email);
    //   return res.status(409).json({
    //     error: "Account already exists",
    //     message: "An account with this email already exists"
    //   });
    // }

    // If email doesn't exist, create new user
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    let expenseuser = new Expenseuser({
      name: name, email: email, password: hashedPassword
    })
    console.log(expenseuser)
    await expenseuser.save()



    // await Expenseuser.create(
    //   {
    //     name,
    //     email,
    //     password: hashedPassword
    //   }
    // );

    res.status(201).json({
      message: "User created successfully"
    });
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).json({
      error: "Failed to process signup",
      details: err.message
    });
  }
};


exports.login = async (req, res, next) => {
  console.log("hitted login")
  try {
    const { email, password } = req.body;


    const existingUser = await Expenseuser.find({ email: email })
    console.log("stored as place102", existingUser[0].password)

    //   const existingUser = await Expenseuser.findOne({
    //     where: { email: email }
    //   });
    if (existingUser) {
      bcrypt.compare(password, existingUser[0].password).then(function (result) {

        if (result) {
          return res.status(201).json({
            usertoken: generateAccessToken(existingUser[0]._id, existingUser[0].isPremiumUser),
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

// exports.postresetpassword = async (req, res) => {

//   await Expenseuser.findOne({ where: { email: req.body.email } })
//     .then(res => { uid = res.id })
//   let uniqueid = uuidv4();
//   let uniquelink = "https://localhost:5000/password/forgetpassword/" + uniqueid;
//   console.log(uniquelink)
//   ForgotPasswordRequests.create({
//     uuid: uniqueid,
//     isactive: true,
//     expenseuserId: uid
//   })

//   // }
//   try {

//     // //pasword reset send via sendinblue/brevo
//     // console.log("Starting password reset process");
//     // let apiInstance = new Sib.TransactionalEmailsApi();
//     // let sendSmtpEmail = new Sib.SendSmtpEmail(); // Define this first
//     // sendSmtpEmail.subject = "My {{params.subject}}";
//     // sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1><a href=uniquelink>reset link</a></body></html>";
//     // sendSmtpEmail.sender = { "name": "John", "email": "example@example.com" };
//     // sendSmtpEmail.to = [
//     //   { "email": req.body.email, "name": "sample-name" }
//     // ];
//     // sendSmtpEmail.replyTo = { "email": "example@brevo.com", "name": "sample-name" };
//     // sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
//     // sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };
//     // const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
//     // console.log('Email sent successfully:', JSON.stringify(result));



//     res.status(200).json({ message: 'Password reset email sent', link: uniquelink });

//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({
//       error: 'Failed to send password reset email',
//       details: error.message
//     });
//   }
// };





exports.postresetpassword = async (req, res) => {
  console.log("postresetpassword hitted ")
  try {
    const user = await Expenseuser.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).jsonn({ error: 'User not found' });
    }
    let uniqueid = uuidv4();
    const uniquelink = `http://localhost:5000/password/forgetpassword/${uniqueid}`;
    console.log(uniquelink);

    // await ForgotPasswordRequest.create({
    //   uuid: uniqueid,
    //   isactive: true,
    //   expenseuserId: user._id
    // });


    let forgetpasswordrequest = new ForgotPasswordRequest({
      uuid: uniqueid,
      isactive: true,
      expenseuserID: user._id
    })
    console.log(forgetpasswordrequest)
    await forgetpasswordrequest.save()



    // Uncomment the email sending logic when needed
    // console.log("Starting password reset process");
    // let apiInstance = new Sib.TransactionalEmailsApi();
    // let sendSmtpEmail = new Sib.SendSmtpEmail();
    // sendSmtpEmail.subject = "My {{params.subject}}";
    // sendSmtpEmail.htmlContent = `<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1><a href="${uniquelink}">reset link</a></body></html>`;
    // sendSmtpEmail.sender = { name: "John", email: "example@example.com" };
    // sendSmtpEmail.to = [{ email: req.body.email, name: "sample-name" }];
    // sendSmtpEmail.replyTo = { email: "example@brevo.com", name: "sample-name" };
    // sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    // sendSmtpEmail.params = { parameter: "My param value", subject: "common subject" };
    // const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log('Email sent successfully:', JSON.stringify(result));

    res.status(200).json({ message: 'Password reset email sent', link: uniquelink });
  } catch (error) {
    console.error('Error sending password reset link:', error);
    res.status(500).json({
      error: 'Failed to send password reset email',
      details: error.message
    });
  }
};


exports.getresetpasword = (req, res) => {
  console.log(" linkpass.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'linkpass.html'));
}
// exports.linkandurl = async (req, res) => {
//   let currentuser;
//   await ForgotPasswordRequests.findByPk(req.body.sid).then(res => {
//     currentuser = res;
//   })
//   if (!currentuser) {
//     console.log(" 770")
//     return res.status(500).json({
//       custommessage: 'invalid link'
//     })
//   }
//   try {
//     if (currentuser.isactive != 1) {
//       console.log(" 771")
//       return res.status(500).json({
//         custommessage: 'link is not active ,please generate new link',
//       });
//     }

//     if (req.body.password.length < 6) {
//       return res.status(500).json({
//         custommessage: 'password length should be greater then 6',
//       });
//     }
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     await Expenseuser.update(
//       { password: hashedPassword },
//       {
//         where: { id: currentuser.expenseuserId }
//       }
//     )
//     await ForgotPasswordRequests.update(
//       { isactive: false },
//       {
//         where: { uuid: currentuser.uuid }
//       }

//     )
//     res.status(200).json({ message: 'Password reset succesfully' });
//   }
//   catch {
//     console.log(" 772")
//     res.status(500).json({
//       error: 'Failed to send password reset email',
//       custommessage: error.message
//     });
//   }
// }

exports.linkandurl = async (req, res) => {
  console.log("linkandurl is hitted")
  try {
    const currentuser = await ForgotPasswordRequest.findOne({ uuid: req.body.sid });
console.log(currentuser)
    if (!currentuser) {
      console.log("770");
      return res.status(500).json({ custommessage: 'Invalid link' });
    }

    if (!currentuser.isactive) {
      console.log("771");
      return res.status(500).json({ custommessage: 'Link is not active, please generate a new link' });
    }

    if (req.body.password.length < 6) {
      return res.status(500).json({ custommessage: 'Password length should be greater than 6' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await Expenseuser.findByIdAndUpdate(currentuser.expenseuserID, { password: hashedPassword });

    await ForgotPasswordRequest.updateOne({ uuid: currentuser.uuid }, { isactive: false });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log("772");
    res.status(500).json({
      error: 'Failed to reset password',
      custommessage: error.message
    });
  }
};
exports.reportpagefrontend = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'reports.html'));
}

exports.datedexpense = (req, res) => {
  const { Op, fn, col } = require('sequelize');
  // Start of the day (2025-01-04 00:00:00)
  const startDate = new Date("2025-01-04 00:00:00");
  // End of the day (2025-01-04 23:59:59)
  const endDate = new Date("2025-01-04 23:59:59");
  // Sequelize query

  Product.findAll({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: {
      include: [
        [fn('DATE_FORMAT', col('created_at'), '%d-%m-%Y'), 'formatted_date'] // Format date as dd-mm-yyyy
      ]
    }
  }).then(expensedata => {
    res.json({ expensedata: expensedata });
  }).catch(err => {
    console.error(err);
  });
}

// exports.downloadexpenses = async (req, res) => {
//   console.log(req.user.id, " hell o   hello ")
//   try {
//     const expenses = await req.user.getExpensedata(); // Magic method
//     console.log("            attacked          ", expenses);
//     const stringified = JSON.stringify(expenses);
//     const filename = `expense${new Date()}.txt`
//     console.log(stringified)
//     const fileurl = await uploadToS3(stringified, filename);
//     await ReportLink.create({
//       link: fileurl,
//       expenseuserId: req.user.id  // assuming user.id is your user identifier
//     });
//     res.status(200).json({ fileurl, success: true })
//   }
//   catch (err) {
//     console.log(err)
//     res.status(501).json({ error: err })
//   }
// }
