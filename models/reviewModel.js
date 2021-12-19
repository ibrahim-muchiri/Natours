const mongoose = require('mongoose');
//const Tour = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review must not be empty']
    },
    rating: {
      type: String,
      min: 1,
      max: 2
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour'
      //required: [true, 'Review must belong to the tour']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
      //required: [true, 'Review must belong to the user']
    }
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

// reviewSchema.statics.calcAverageRatings = async function(tourId) {
//   console.log(tourId);
//   const stats = await this.aggregate([
//     {
//       $match: { tour: tourId }
//     },
//     {
//       $group: {
//         _id: '$tour',
//         nRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' }
//       }
//     }
//   ]);
//   console.log(stats);

// await Tour.findByIdAndUpdate(tourId, {
//   ratingsQuantity: stats[0].nRating,
//   ratingsAverage: stats[0].avgRating
// });
// };

// reviewSchema.post('save', function() {
//   //This point to the current review
//   this.constructor.calcAverageRatings(this.tour);
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
