const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({

    sender: {type: String},
    receiver: {type: String},
    message: {type: String}


}, {collection: 'messages', timestamps: true});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message