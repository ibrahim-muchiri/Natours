const User = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');

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
