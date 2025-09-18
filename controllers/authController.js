const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/validationMiddleware');
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = { login: [validate(loginSchema), login] };