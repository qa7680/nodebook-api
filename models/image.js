const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    image: { data: Buffer, contentType: String },
    post:{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment:{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
});

module.exports = mongoose.model('Image', ImageSchema);