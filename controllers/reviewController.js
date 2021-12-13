const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  if (!reviews) {
    return next(new appError('Please!, there is no review'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //Allow Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  if (!newReview) {
    return next(new AppError('please, feed data in the body'));
  }

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
