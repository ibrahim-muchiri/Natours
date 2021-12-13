const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//1) GLOBAL MIDDLEWARES
//Set security http Header
app.use(helmet());

//Login Parser
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit the request from the same API
const Limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request in this IP, please try again in an hour!'
});
app.use('/api', Limiter);

//Reading Data fom the body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NoSQl query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

app.use(
  hpp({
    whiteList: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from middleware👋');
  next();
});

//Test Middleware
app.use((req, res, next) => {
  // console.log(req.headers);
  req.requestTime = new Date().toISOString();

  next();
});

//2) ROUTE HANDLERS

//3) ROUTES

//app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
//app.post('/api/v1/tours', creatTour);
app.use('/api/v1/tours', tourRouter); //connecting route with the application
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
