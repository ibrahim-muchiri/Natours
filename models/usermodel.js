const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required in this field'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'please, password field is requred here!'],
    unique: [true, 'please, the email has been taken, select another email!'],
    lowercase: true,
    validate: [validator.isEmail, 'please, provide a valid email!']
  },

  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false
  },

  passwordConfirm: {
    type: String,
    required: [true, 'please, confirm your password!'],
    validate: {
      //THIS ONLY WORKS ON CREATE AND SAVE!
      validator: function(el) {
        return el === this.password;
      },
      message: 'password should be the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userSchema.plugin(uniqueValidator);

userSchema.pre('save', async function(next) {
  //Only run this function if the password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password in the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete the passwordConfirm fiels
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//compare  the candidatePassword(from the body) with the userpassword(one in the db)
//instance method!
//LOGIN
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//deleteMe (To make inactive users not to appear in getAllUsers😁)
userSchema.pre(/^find/, function(next) {
  //this point to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
