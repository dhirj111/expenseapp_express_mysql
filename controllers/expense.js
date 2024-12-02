  const Product = require('../models/expenses');
  const router = require('../routes/expense');
  const { route } = require('../routes/expense');
  const path = require('path');
  //to serve main html file
  exports.baseroot = (req, res, next) => {
    console.log("Serving htmlmain.html");
    res.sendFile(path.join(__dirname, '..', 'htmlmain.html'));
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














