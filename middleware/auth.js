const jwt = require('jsonwebtoken');
const Expenseuser = require('../models/expenseuser')
let SECRET_KEY = "abc123"
const authenticate = async (req, res, next) => {
  try {
    console.log("in auth try block")
    const token = req.header('token');
    console.log(token);
    const user = jwt.verify(token, SECRET_KEY);
    console.log(user.userId, "this is inside auth")
    Expenseuser.findById(user.userId).then(user => {
      console.log(JSON.stringify(user));
      req.user = user;
      console.log("req.user in auth is", req.user)
      next()
    }
    ).catch(err => { throw new Error(err) })
  }
  catch (err) {
    console.log(err);
    return res.status(401).json({ success: false })
  }
}

module.exports = authenticate;