const { error } = require('console');
const Product = require('../models/expenses');
const Expenseuser = require('../models/expenseuser');
const router = require('../routes/expense');
const { route } = require('../routes/expense');
const path = require('path');
const bcrypt = require('bcrypt');
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

// Route for adding a user
exports.adduser = (req, res, next) => {
  console.log("Request received at /adduser");
  console.log(req.body);
  res.send("Add user endpoint hit");
}

// Route for handling appointment data of newly added expense
exports.newexpense = (req, res, next) => {


  console.log("Received data at /appointmentData");
  const { expense, description, type } = req.body;
  //.create is sequlize method , which  we are using right now in models expense.js exported module
  //similary it worked in other middlewares for delete as destroy , findAll or getting full db
  //and update for updating data
  Product.create({
    expense: expense,
    description: description,
    type: type
  })
    .then(result => {
      console.log('Created Product:', result);
      res.status(201).json({
        message: "Product created successfully",
        product: result
      });
    })
    .catch(err => {
      console.error('Error creating product:', err);
      res.status(500).json({ error: "Failed to create product", details: err.message });
    });

}

//route to fetch all data
exports.fetchexpense = (req, res, next) => {
  Product.findAll()
    .then(expensedata => {
      res.json(expensedata);
    })
    .catch(err => {
      console.log(err)
      console.error('Error fetching products:', err);
      res.status(500).json({ error: "Failed to fetch products" });
    });
}

//route to delete expense
exports.deleteexpense = (req, res, next) => {
  //way to fetch id from route is req.params.id
  const productId = req.params.id;
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
exports.updateexpense = (req, res, next) => {
  //way to fetch id from route is req.params.id
  //way to get object passed along with data is req.body
  const productId = req.params.id;
  const { expense, description, type } = req.body;

  Product.update(
    { expense, description, type },
    { where: { id: productId } }
  )
    .then(([updatedCount]) => {
      if (updatedCount > 0) {
        return Product.findByPk(productId);
      } else {
        throw new Error('Product not found');
      }
    })
    .then(updatedProduct => {
      res.json({ message: "Product updated successfully", product: updatedProduct });
    })
    .catch(err => {
      console.error('Error updating product:', err);
      res.status(500).json({ error: "Failed to update product" });
    });

}
exports.signup = async (req, res, next) => {
  const saltRounds = 10;
  //salt is an string/whatver added to  password which increases randomness of password
  //even for same password each time to increase safety
  try {
    const { name, email, password } = req.body;

    // Check if user with email already exists
    const existingUser = await Expenseuser.findOne({
      where: { email: email }
    });

    if (existingUser) {
      console.log('Account already exists for email:', email);
      return res.status(409).json({
        error: "Account already exists",
        message: "An account with this email already exists"
      });
    }

    // If email doesn't exist, create new user

    bcrypt.hash(password, saltRounds, await function (err, hash) {
      // Store hash in your password DB.

      Expenseuser.create({
        name: name,
        email: email,
        password: hash
      });
    });

    // console.log('Created User:', newUser);
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

//async declaration
//try executes code inside block
// await make it wait till end
// catch any error in execution of whole async declared function
exports.login = async (req, res, next) => {
  console.log(req.body)
  try {
    const { email, password } = req.body;

    const existingUser = await Expenseuser.findOne({
      where: { email: email }
    });

    if (existingUser) {
      //const ispasswordmatched = bcrypt.compare(password, existingUser.password);
      //above line does not work bcz .compare returns promise , so it can be handled by .then or try catch
      bcrypt.compare(password, existingUser.password).then(function (result) {

        if (result) {
          return res.status(201).json({
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

//return just breaks execution of next code lines inside function where it used