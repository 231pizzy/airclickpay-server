const Joi = require('joi');
const mongoose = require('mongoose');

// Clear Mongoose models cache to prevent OverwriteModelError
mongoose.models = {};

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailToken: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    hawkPin: {
        type: String,
        required: true
      },
      accountStatus: {
        type: String,
        enum: ["inactive", "active", "disabled", "suspended"],
        default: "inactive"
    },    
      walletBalance: {
        type: Number,
        default: 0
    },
    earningsBalance: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default:
          "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=",
      },
      level1IDVerification: {
        type: Boolean,
        default: false
    },
    level1IDVerifCompar: {
        type: Schema.Types.Mixed,
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    BVN: {
        type: String,
        default: null
    },
    verificationAttempts: {
        type: Number,
        default: 4,
        min: 0,
    },
    disabledUntil: {
        type: Date,
        default: null
    },
    isInExtraTrialPhase: {
        type: Boolean,
        default: false,
      },
});

const User = mongoose.model('User', userSchema);

// Joi schema for validation
const userValidationSchema = Joi.object({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    country: Joi.string().min(3).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().required(),
    verified: Joi.boolean(),
    hawkPin: Joi.string().length(6).required(), 
});

// Function to validate user data
function validateUser(user) {
    return userValidationSchema.validate(user);
}

module.exports = { User, validateUser };
