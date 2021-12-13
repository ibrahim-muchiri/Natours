const mongoose = require('mongoose');
const slugify = require('slugify');

//const User = require('./usermodel');

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

    // priceDiscount: {
    //   type: Number,
    //   validate: {
    //     validator: function(val) {
    //       //This only points to current doc on a new document creation!
    //       return val < this.price;
    //     },
    //     message: 'A price discount({val}) must be less than the price!'
    //   }
    // },
    summary: {
      type: String,
      trim: true
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },

    startLocation: {
      //GEOJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    location: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

//Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  const slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

//QUERRY MIDDLEWARE
//tour schema.pre('find', function(next){})
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
