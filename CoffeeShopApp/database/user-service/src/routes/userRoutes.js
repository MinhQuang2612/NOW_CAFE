const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/auth/google', userController.loginGoogle);
router.post('/auth/facebook', userController.loginFacebook);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.put('/change-password/:userId', userController.changePassword);
router.post('/send-otp',userController.sendOtp);
router.post('/create-account',userController.createAcount);
router.post('/check-account',userController.checkAccount);
router.post('/reset-password', userController.resetPassword);

module.exports = router; 