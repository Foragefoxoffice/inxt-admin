const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/helpers');

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return sendError(res, 'Email already registered', 409);

    const user = await User.create({ name, email, password, role });
    const token = user.getSignedJwtToken();
    sendSuccess(res, { token, user: { _id: user._id, name, email, role: user.role } }, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Please provide email and password');

    const user = await User.findOne({ email }).select('+password');
    if (!user) return sendError(res, 'Invalid credentials', 401);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return sendError(res, 'Invalid credentials', 401);

    if (!user.isActive) return sendError(res, 'Account disabled', 403);

    const token = user.getSignedJwtToken();
    sendSuccess(res, { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  sendSuccess(res, { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
};

// @route PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true });
    sendSuccess(res, user);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// @route PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);
    user.password = newPassword;
    await user.save();
    sendSuccess(res, { message: 'Password updated successfully' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
