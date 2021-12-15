const express = require('express');
//const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerController');

exports.setTourUserIds = (req, res, next) => {
  //   //Allow Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.use.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
