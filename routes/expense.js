const path = require('path');

const express = require('express');

const expenseController = require('../controllers/expense');

const auth = require('../middleware/auth');
const router = express.Router();

//to serve main html file

router.get('/sign', expenseController.baserootsignup);

router.get('/login', expenseController.baserootlogin);
// Route for adding a user
router.post('adduser', expenseController.adduser);

// Route for handling appointment data
router.post('/appointmentData', auth, expenseController.newexpense)

//route to fetch all data
router.get('/appointmentData', auth, expenseController.fetchexpense)


//route to delete expense
router.delete('/appointmentData/:id', expenseController.deleteexpense)

//route to update expense
router.put('/appointmentData/:id', expenseController.updateexpense)

router.post('/signup', expenseController.signup)

router.post('/login', expenseController.login)

router.get('/purchase/premiummembership', auth, expenseController.buypremium)

router.post('/purchase/updatetransectionstatus', auth, expenseController.updatetransectionstatus)


router.get('/rankwiseexpense' , expenseController.rankwiseexpense);
router.get('/', expenseController.baseroot);


module.exports = router
