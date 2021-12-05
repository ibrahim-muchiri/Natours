const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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
  // console.log(token);
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
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Please, you do not have permission to perform this  action',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.Get user on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('The user is not not found!', 404));
  }
  //2.Generate random password
  const resetToken = user.createPasswordRessetToken();
  await user.save({ validateBeforeSave: false });

  //3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password? submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nif you didn't forget password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Your token has sent to your email'
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email!, please try again later'
      ),
      500
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  //1.Get user based on the token
  const hashedPasword = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest();

  const user = await User.findOne({
    PasswordResetToken: hashedPassword,
    PasswordResetExpires: { $gt: Date.now() }
  });
  //2. If there is user, and token has not expired, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;

  await user.save();
  //3. update changed passwordAt property fo the user

  //4. Log the user in , send JWT

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
};
