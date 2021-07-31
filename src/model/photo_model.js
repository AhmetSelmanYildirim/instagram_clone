const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
    email: {type: String},
    name: {type: String, trim: true},
    isActive: {type: Boolean, default: true},
    username: {type: String},
    like: {type: Number, default: 0},
    description: {type: String, default: "no description"},
    timestamp: {type: Number, default: new Date().getTime() - 1},

    likers: [{
        email: {type: String},
        isLiked: {type: Boolean, default: false},
    }],

    comments: [{
        email: {type: String},
        username: {type: String},
        commentText: {
            type: String,
            minlength: 1,
        },
        timestamp: {type: Number, default: new Date().getTime() - 1},
    }, {timestamps: true}],

}, {collection: 'photos', timestamps: true});

const UploadedPhoto = mongoose.model('UploadedPhoto', PhotoSchema);

module.exports = UploadedPhoto