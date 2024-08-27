const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// Public Routes
router.post('/login', userController.login);
router.post('/users/forgot-password', userController.forgotPassword);
router.post('/users/reset-password/:token', userController.resetPassword);

// Protected Routes
router.post('/users', authenticateToken, userController.createUser);
router.get('/users', authenticateToken, userController.getUsers);
router.get('/users/:id', authenticateToken, userController.getUser);
router.put('/users/:id', authenticateToken, userController.updateUser);
router.put('/users/:id/password', authenticateToken, userController.changePassword);
router.delete('/users/:id', authenticateToken, userController.deleteUser);

module.exports = router;
