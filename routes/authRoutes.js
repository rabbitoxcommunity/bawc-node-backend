const express = require('express');
const { login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/login', login);
router.get('/admin', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Admin Dashboard',
    user: req.user, // will contain user id from token
  });
});

module.exports = router;