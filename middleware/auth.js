const jwt = require('jsonwebtoken');
const Expenseuser = require('../models/expenseuser')
let SECRET_KEY = "abc123"
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('token');
    console.log(token);
    const user = jwt.verify(token, SECRET_KEY);
    console.log(user.userId)
    Expenseuser.findByPk(user.userId).then(user => {
      console.log(JSON.stringify(user));
      req.user = user;
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