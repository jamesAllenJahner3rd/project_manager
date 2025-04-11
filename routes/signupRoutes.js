const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signupController');

// @desc    Show signup page
// @route   GET /signup
router.get('/', signupController.getSignup);

// @desc    Process signup form
// @route   POST /signup
router.post('/', signupController.postSignup);

module.exports = router; 