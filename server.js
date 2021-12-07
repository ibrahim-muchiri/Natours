const mongoose = require('mongoose');
const dotEnv = require('dotenv');

// process.on('uncaughtException', err => {
//   console.log(err.name, err.message);
//   console.log('UNCAUGHT EXCEPTION 🤦‍♂️, Shuttingdown... ☀');
//   process.exit(1);
// });

dotEnv.config({ path: './config.env' });

const app = require('./index');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    //userFindAndModify: false
  })
  .then(() => console.log('Database connected successfully!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is listening to port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 🤦‍♂️, Shuttingdown... ☀');
  server.close(() => {
    process.exit(1);
  });
});
