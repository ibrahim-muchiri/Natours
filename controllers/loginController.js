const catchAsync = require('../utils/catchAsync');

exports.login = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
});
