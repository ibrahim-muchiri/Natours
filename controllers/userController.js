const User = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //2) send an error if user Posted password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update, please use /updateMyPassword',
        400
      )
    );
  }

  //2)Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  //update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    message: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error while loading this file!',
    message: 'This file is not yet to be implemented'
  });
};

exports.CreateUsers = (req, res) => {
  res.status(500).json({
    status: 'error while loading this file!',
    message: 'This file is not yet to be implemented'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error while loading this file!',
    message: 'This file is not yet to be implemented'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error while loading this file!',
    message: 'This file is not yet to be implemented'
  });
};
