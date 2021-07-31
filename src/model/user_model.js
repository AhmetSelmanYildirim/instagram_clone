const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },

    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 2,
        maxlength: 30
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },

    emailActive: {
        type: Boolean,
        default: false
    },

    avatar: {
        type: String,
        default: 'default.png',
    },

    photos: [{
        email: {type: String},
        name: {type: String},
        isActive: {type: Boolean, default: true},
        username: {type: String},
        like: {type: Number, default: 0},
        description: {type: String}
    }],

    following: [{
        username: {type: String},
        email: {type: String}
    }],

    followers: [{
        username: {type: String},
        email: {type: String}
    }],

    messages: [
        {
            username: {type: String},
            email: {type: String},
            messages: [{
                sender: {type: String},
                receiver: {type: String},
                message: {type: String}
            }]
        }
    ]

}, {collection: 'users', timestamps: true});

const User = mongoose.model('User', UserSchema);

module.exports = User