const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourmodel');

exports.getOverview = catchAsync(async (req, res) => {
  //1.get tour data from the collection
  const tours = await Tour.find();

  //2.build template

  //3.render that template using tour data from 1

  res.status(200).render('overview', {
    title: 'All Tour',
    tours
  });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker'
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account'
  });
};
