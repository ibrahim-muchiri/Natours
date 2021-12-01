const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please! name is required here'],
      unique: true,
      trim: true,
      maxLength: [30, 'A tour name should not exeed 30 characters'],
      minLength: [5, 'A tour name should not be less than 5 characters']
    },

    duration: {
      type: Number,
      required: [true, 'Duration is required!']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'please! this field is required']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'difficulty must be either: easy, medium or hard!'
      }
    },

    ratingsAverage: {
      type: Number,
      default: 5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price is required in this field!']
    },

    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      validate: {
        validator: function(val) {
          //This only points to current doc on a new document creation!
          return val < this.price;
        },
        message: 'A price discount({val}) must be less than the price!'
      }
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour image is required!']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
