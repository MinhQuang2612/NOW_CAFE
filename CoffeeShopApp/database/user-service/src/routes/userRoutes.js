const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/auth/google', userController.loginGoogle);
router.post('/auth/facebook', userController.loginFacebook);
router.get('/user/:userId', userController.getUserById);
router.put('/user/:userId', userController.updateUser);
router.put('/change-password/:userId', userController.changePassword);
router.post('/user/send-otp',userController.sendOtp);
router.post('/user/create-account',userController.createAcount);
router.post('/user/check-account',userController.checkAccount);
router.post('/user/reset-password', userController.resetPassword);

module.exports = router; 