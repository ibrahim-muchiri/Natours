const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if the email and password exist
  if (!email || !password) {
    return next(new AppError('please, provide email and password!', 400));
  }
  //check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect password or email', 401));
  }

  // console.log(user);

  //send back the token to the user
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //getting token and checking wether its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(new AppError('You have to login first', 401));
  }
  //verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  //check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exist!', 401)
    );
  }
  //check if the user changed the password after the token was issued
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(new AppError('user changed password, please login again', 401));
  }
  //Grant access to the protected routes
  req.user = currentUser;
  next();
});
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!role.includes(req.user.role)) {
//       return next(
//         new appError(
//           'Please, you do not have permission to perform this  action',
//           403
//         )
//       );
//     }
